package com.lms.openlms.service;

import com.lms.openlms.dto.SubmissionDto.GradeRequest;
import com.lms.openlms.dto.SubmissionDto.SubmissionResponse;
import com.lms.openlms.dto.SubmissionDto.SubmitRequest;
import com.lms.openlms.entity.Assignment;
import com.lms.openlms.entity.Course;
import com.lms.openlms.entity.Submission;
import com.lms.openlms.entity.User;
import com.lms.openlms.exception.BadRequestException;
import com.lms.openlms.exception.ConflictException;
import com.lms.openlms.exception.ResourceNotFoundException;
import com.lms.openlms.repository.AssignmentRepository;
import com.lms.openlms.repository.SubmissionRepository;
import com.lms.openlms.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final CourseAccessService courseAccessService;

    public SubmissionService(SubmissionRepository submissionRepository,
                             AssignmentRepository assignmentRepository,
                             UserRepository userRepository,
                             CourseAccessService courseAccessService) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.userRepository = userRepository;
        this.courseAccessService = courseAccessService;
    }

    public static class SubmitResult {
        private final SubmissionResponse response;
        private final boolean isCreated;

        public SubmitResult(SubmissionResponse response, boolean isCreated) {
            this.response = response;
            this.isCreated = isCreated;
        }

        public SubmissionResponse getResponse() {
            return response;
        }

        public boolean isCreated() {
            return isCreated;
        }
    }

    public SubmitResult submit(Long assignmentId, SubmitRequest req, Long studentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        Course course = assignment.getCourse();
        courseAccessService.requireStudentEnrolled(course.getCourseId(), studentId);

        String text = req.getSubmissionText();
        String fileUrl = req.getFileUrl();

        if (text != null && !text.isBlank()) {
            if (text.length() > 10000) {
                throw new BadRequestException("Submission text must not exceed 10000 characters");
            }
            text = text.trim();
        } else {
            text = null;
        }

        if (fileUrl != null && !fileUrl.isBlank()) {
            fileUrl = fileUrl.trim();
            if (fileUrl.length() > 500 || (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://"))) {
                throw new BadRequestException("File URL must be a valid http(s) URL up to 500 characters");
            }
        } else {
            fileUrl = null;
        }

        if (text == null && fileUrl == null) {
            throw new BadRequestException("At least one of submission text or file URL is required");
        }

        Optional<Submission> existing = submissionRepository.findByAssignmentAssignmentIdAndStudentUserId(assignmentId, studentId);
        if (existing.isPresent()) {
            Submission submission = existing.get();
            if ("APPROVED".equalsIgnoreCase(submission.getStatus())) {
                throw new ConflictException("Already approved");
            }
            submission.setSubmissionText(text);
            submission.setFileUrl(fileUrl);
            submission.setStatus("SUBMITTED");
            submission.setMarksObtained(null);
            submission.setFeedback(null);
            submission.setGradedAt(null);
            submission.setSubmittedAt(LocalDateTime.now());
            Submission saved = submissionRepository.save(submission);
            return new SubmitResult(toResponse(saved), false);
        } else {
            User student = userRepository.findById(studentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            Submission submission = new Submission();
            submission.setAssignment(assignment);
            submission.setStudent(student);
            submission.setSubmissionText(text);
            submission.setFileUrl(fileUrl);
            submission.setStatus("SUBMITTED");
            submission.setSubmittedAt(LocalDateTime.now());
            Submission saved = submissionRepository.save(submission);
            return new SubmitResult(toResponse(saved), true);
        }
    }

    @Transactional(readOnly = true)
    public SubmissionResponse getMySubmissionForAssignment(Long assignmentId, Long studentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        courseAccessService.requireStudentEnrolled(assignment.getCourse().getCourseId(), studentId);

        Submission submission = submissionRepository.findByAssignmentAssignmentIdAndStudentUserId(assignmentId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        return toResponse(submission);
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsForAssignment(Long assignmentId, Long facultyUserId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        courseAccessService.requireOwner(assignment.getCourse().getCourseId(), facultyUserId);

        return submissionRepository.findByAssignmentAssignmentIdOrderBySubmittedAtDesc(assignmentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getMySubmissions(Long studentId) {
        return submissionRepository.findByStudentUserIdOrderBySubmittedAtDesc(studentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubmissionResponse> getGradingQueue(Long facultyUserId, String status, Long courseId, Long assignmentId) {
        String normalizedStatus = null;
        if (status != null && !status.isBlank()) {
            normalizedStatus = status.trim().toUpperCase();
        }
        return submissionRepository.findGradingQueue(facultyUserId, normalizedStatus, courseId, assignmentId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SubmissionResponse grade(Long submissionId, GradeRequest req, Long facultyUserId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        Assignment assignment = submission.getAssignment();
        if (assignment == null || assignment.getCourse() == null) {
            throw new ResourceNotFoundException("Course not found");
        }
        courseAccessService.requireOwner(assignment.getCourse().getCourseId(), facultyUserId);

        if (req.getStatus() == null || req.getStatus().isBlank()) {
            throw new BadRequestException("Status is required (APPROVED or REJECTED)");
        }

        String normalizedStatus = req.getStatus().trim().toUpperCase();
        if (!normalizedStatus.equals("APPROVED") && !normalizedStatus.equals("REJECTED")) {
            throw new BadRequestException("Status must be APPROVED or REJECTED");
        }

        if (normalizedStatus.equals("APPROVED")) {
            if (req.getMarksObtained() == null) {
                throw new BadRequestException("marksObtained is required when status is APPROVED");
            }
            if (req.getMarksObtained() < 0 || req.getMarksObtained() > assignment.getMaxMarks()) {
                throw new BadRequestException("marksObtained must be between 0 and " + assignment.getMaxMarks());
            }
            submission.setStatus("APPROVED");
            submission.setMarksObtained(req.getMarksObtained());
            submission.setFeedback(req.getFeedback() != null ? req.getFeedback().trim() : null);
        } else {
            if (req.getFeedback() == null || req.getFeedback().isBlank()) {
                throw new BadRequestException("Feedback is required when status is REJECTED");
            }
            submission.setStatus("REJECTED");
            submission.setMarksObtained(null);
            submission.setFeedback(req.getFeedback().trim());
        }

        submission.setGradedAt(LocalDateTime.now());
        Submission saved = submissionRepository.save(submission);
        return toResponse(saved);
    }

    private SubmissionResponse toResponse(Submission s) {
        SubmissionResponse resp = new SubmissionResponse();
        resp.setSubmissionId(s.getSubmissionId());
        resp.setId(s.getSubmissionId());
        if (s.getAssignment() != null) {
            resp.setAssignmentId(s.getAssignment().getAssignmentId());
            resp.setAssignmentTitle(s.getAssignment().getTitle());
            resp.setMaxMarks(s.getAssignment().getMaxMarks());
            if (s.getAssignment().getCourse() != null) {
                resp.setCourseId(s.getAssignment().getCourse().getCourseId());
                resp.setCourseName(s.getAssignment().getCourse().getCourseName());
            }
        }
        if (s.getStudent() != null) {
            resp.setStudentId(s.getStudent().getUserId());
            resp.setStudentName(s.getStudent().getName());
            resp.setStudentEmail(s.getStudent().getEmail());
        }
        resp.setSubmissionText(s.getSubmissionText());
        resp.setFileUrl(s.getFileUrl());
        resp.setStatus(s.getStatus());
        resp.setMarksObtained(s.getMarksObtained());
        resp.setFeedback(s.getFeedback());
        resp.setSubmittedAt(s.getSubmittedAt());
        resp.setGradedAt(s.getGradedAt());

        boolean isLate = s.getSubmittedAt() != null && s.getAssignment() != null && s.getAssignment().getDueDate() != null &&
                s.getSubmittedAt().isAfter(s.getAssignment().getDueDate());
        resp.setIsLate(isLate);

        return resp;
    }
}
