package com.lms.openlms.service;

import com.lms.openlms.dto.AssignmentDto;
import com.lms.openlms.entity.Assignment;
import com.lms.openlms.entity.Course;
import com.lms.openlms.entity.Enrollment;
import com.lms.openlms.entity.Submission;
import com.lms.openlms.entity.User;
import com.lms.openlms.exception.BadRequestException;
import com.lms.openlms.exception.ConflictException;
import com.lms.openlms.exception.ResourceNotFoundException;
import com.lms.openlms.repository.AssignmentRepository;
import com.lms.openlms.repository.EnrollmentRepository;
import com.lms.openlms.repository.SubmissionRepository;
import com.lms.openlms.repository.UserRepository;
import com.lms.openlms.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseAccessService courseAccessService;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             SubmissionRepository submissionRepository,
                             EnrollmentRepository enrollmentRepository,
                             UserRepository userRepository,
                             CourseAccessService courseAccessService) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseAccessService = courseAccessService;
    }

    public AssignmentDto.AssignmentResponse createAssignment(Long courseId, Long professorUserId, AssignmentDto.CreateAssignmentRequest request) {
        Course course = courseAccessService.requireOwner(courseId, professorUserId);
        User professor = userRepository.findById(professorUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Assignment assignment = new Assignment();
        assignment.setCourse(course);
        assignment.setTitle(request.getTitle().trim());
        assignment.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        assignment.setDueDate(request.getDueDate());
        assignment.setMaxMarks(request.getMaxMarks());
        assignment.setAttachmentUrl(request.getAttachmentUrl() != null && !request.getAttachmentUrl().trim().isEmpty()
                ? request.getAttachmentUrl().trim() : null);
        assignment.setCreatedBy(professor);

        Assignment saved = assignmentRepository.save(assignment);
        return toResponseForFaculty(saved);
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto.AssignmentResponse> listCourseAssignments(Long courseId, AuthUser user) {
        courseAccessService.requireMemberOrOwner(courseId, user);
        List<Assignment> assignments = assignmentRepository.findByCourseCourseIdOrderByDueDateAsc(courseId);
        boolean isFaculty = "FACULTY".equalsIgnoreCase(user.role()) || "PROFESSOR".equalsIgnoreCase(user.role());

        return assignments.stream()
                .map(a -> toResponse(a, user, isFaculty))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto.AssignmentResponse> listMyAssignments(Long studentUserId, AuthUser user) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentUserId(studentUserId);
        List<Long> courseIds = enrollments.stream().map(e -> e.getCourse().getCourseId()).toList();
        if (courseIds.isEmpty()) {
            return List.of();
        }

        List<Assignment> assignments = assignmentRepository.findByCourseCourseIdInOrderByDueDateAsc(courseIds);
        return assignments.stream()
                .map(a -> toResponse(a, user, false))
                .toList();
    }

    @Transactional(readOnly = true)
    public AssignmentDto.AssignmentResponse getAssignment(Long assignmentId, AuthUser user) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        courseAccessService.requireMemberOrOwner(assignment.getCourse().getCourseId(), user);
        boolean isFaculty = "FACULTY".equalsIgnoreCase(user.role()) || "PROFESSOR".equalsIgnoreCase(user.role());
        return toResponse(assignment, user, isFaculty);
    }

    public AssignmentDto.AssignmentResponse updateAssignment(Long assignmentId, Long professorUserId, AssignmentDto.UpdateAssignmentRequest request) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        courseAccessService.requireOwner(assignment.getCourse().getCourseId(), professorUserId);

        // If due date changed, it must be in the future
        if (!assignment.getDueDate().equals(request.getDueDate()) && request.getDueDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("New due date must be in the future");
        }

        // Lowering maxMarks below existing graded marks
        List<Submission> submissions = submissionRepository.findByAssignmentAssignmentId(assignmentId);
        for (Submission s : submissions) {
            if (s.getMarksObtained() != null && request.getMaxMarks() < s.getMarksObtained()) {
                throw new ConflictException("Cannot lower max marks below existing graded submission mark (" + s.getMarksObtained() + ")");
            }
        }

        assignment.setTitle(request.getTitle().trim());
        assignment.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        assignment.setDueDate(request.getDueDate());
        assignment.setMaxMarks(request.getMaxMarks());
        assignment.setAttachmentUrl(request.getAttachmentUrl() != null && !request.getAttachmentUrl().trim().isEmpty()
                ? request.getAttachmentUrl().trim() : null);

        Assignment updated = assignmentRepository.save(assignment);
        return toResponseForFaculty(updated);
    }

    public void deleteAssignment(Long assignmentId, Long professorUserId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        courseAccessService.requireOwner(assignment.getCourse().getCourseId(), professorUserId);

        if (submissionRepository.existsByAssignmentAssignmentId(assignmentId)) {
            throw new ConflictException("Assignment has submissions");
        }

        assignmentRepository.delete(assignment);
    }

    private AssignmentDto.AssignmentResponse toResponse(Assignment a, AuthUser user, boolean isFaculty) {
        if (isFaculty) {
            return toResponseForFaculty(a);
        }
        return toResponseForStudent(a, user.userId());
    }

    private AssignmentDto.AssignmentResponse toResponseForFaculty(Assignment a) {
        long count = submissionRepository.countByAssignmentAssignmentId(a.getAssignmentId());
        AssignmentDto.AssignmentResponse res = new AssignmentDto.AssignmentResponse();
        res.setAssignmentId(a.getAssignmentId());
        res.setCourseId(a.getCourse().getCourseId());
        res.setCourseName(a.getCourse().getCourseName());
        res.setTitle(a.getTitle());
        res.setDescription(a.getDescription());
        res.setDueDate(a.getDueDate());
        res.setMaxMarks(a.getMaxMarks());
        res.setAttachmentUrl(a.getAttachmentUrl());
        res.setCreatedById(a.getCreatedBy() != null ? a.getCreatedBy().getUserId() : null);
        res.setCreatedByName(a.getCreatedBy() != null ? a.getCreatedBy().getName() : null);
        res.setSubmissionCount(count);
        res.setMyStatus(null);
        res.setMySubmission(null);
        return res;
    }

    private AssignmentDto.AssignmentResponse toResponseForStudent(Assignment a, Long studentUserId) {
        Optional<Submission> submissionOpt = submissionRepository.findByAssignmentAssignmentIdAndStudentUserId(
                a.getAssignmentId(), studentUserId);

        AssignmentDto.AssignmentResponse res = new AssignmentDto.AssignmentResponse();
        res.setAssignmentId(a.getAssignmentId());
        res.setCourseId(a.getCourse().getCourseId());
        res.setCourseName(a.getCourse().getCourseName());
        res.setTitle(a.getTitle());
        res.setDescription(a.getDescription());
        res.setDueDate(a.getDueDate());
        res.setMaxMarks(a.getMaxMarks());
        res.setAttachmentUrl(a.getAttachmentUrl());
        res.setCreatedById(a.getCreatedBy() != null ? a.getCreatedBy().getUserId() : null);
        res.setCreatedByName(a.getCreatedBy() != null ? a.getCreatedBy().getName() : null);
        res.setSubmissionCount(null);

        if (submissionOpt.isPresent()) {
            Submission s = submissionOpt.get();
            res.setMyStatus(s.getStatus() != null ? s.getStatus() : "SUBMITTED");
            boolean isLate = s.getSubmittedAt() != null && s.getSubmittedAt().isAfter(a.getDueDate());
            res.setMySubmission(new AssignmentDto.MySubmissionSummary(
                    s.getSubmissionId(),
                    s.getStatus(),
                    s.getMarksObtained(),
                    isLate
            ));
        } else {
            if (LocalDateTime.now().isAfter(a.getDueDate())) {
                res.setMyStatus("OVERDUE");
            } else {
                res.setMyStatus("PENDING");
            }
            res.setMySubmission(null);
        }

        return res;
    }
}
