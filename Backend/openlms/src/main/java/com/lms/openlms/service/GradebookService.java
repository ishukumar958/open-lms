package com.lms.openlms.service;

import com.lms.openlms.dto.GradebookDto.*;
import com.lms.openlms.entity.*;
import com.lms.openlms.exception.ForbiddenException;
import com.lms.openlms.exception.ResourceNotFoundException;
import com.lms.openlms.repository.*;
import com.lms.openlms.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class GradebookService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public GradebookService(
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            QuizRepository quizRepository,
            QuizAttemptRepository quizAttemptRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
    }

    // G1 — GET /courses/{courseId}/gradebook (owner or admin) -> 200
    public GradebookResponse getCourseGradebook(Long courseId, AuthUser user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if ("STUDENT".equalsIgnoreCase(user.role())) {
            throw new ForbiddenException("Students cannot view course gradebook");
        }

        // Non-owner faculty -> 404 per contract section 2.6
        if ("FACULTY".equalsIgnoreCase(user.role()) && !course.getProfessor().getUserId().equals(user.userId())) {
            throw new ResourceNotFoundException("Course not found");
        }

        List<Assignment> assignments = assignmentRepository.findByCourseCourseIdOrderByDueDateAsc(courseId);
        List<Quiz> quizzes = quizRepository.findByCourseCourseIdOrderByQuizIdDesc(courseId);
        List<Enrollment> enrollments = enrollmentRepository.findByCourseCourseId(courseId);

        // Fetch submissions & quiz attempts in bulk to prevent N+1
        List<Submission> submissions = submissionRepository.findByAssignmentCourseCourseId(courseId);
        List<QuizAttempt> attempts = quizAttemptRepository.findByQuizCourseCourseId(courseId);

        // Map studentId -> (assignmentId -> Submission) for APPROVED submissions
        Map<Long, Map<Long, Submission>> studentSubmissions = new HashMap<>();
        for (Submission s : submissions) {
            if ("APPROVED".equalsIgnoreCase(s.getStatus())) {
                studentSubmissions
                        .computeIfAbsent(s.getStudent().getUserId(), k -> new HashMap<>())
                        .put(s.getAssignment().getAssignmentId(), s);
            }
        }

        // Map studentId -> (quizId -> QuizAttempt) for SUBMITTED attempts
        Map<Long, Map<Long, QuizAttempt>> studentAttempts = new HashMap<>();
        for (QuizAttempt qa : attempts) {
            if ("SUBMITTED".equalsIgnoreCase(qa.getStatus())) {
                Map<Long, QuizAttempt> qMap = studentAttempts.computeIfAbsent(qa.getStudent().getUserId(), k -> new HashMap<>());
                QuizAttempt existing = qMap.get(qa.getQuiz().getQuizId());
                if (existing == null || (qa.getScore() != null && (existing.getScore() == null || qa.getScore() > existing.getScore()))) {
                    qMap.put(qa.getQuiz().getQuizId(), qa);
                }
            }
        }

        List<GradebookRow> rows = new ArrayList<>();
        for (Enrollment enrollment : enrollments) {
            User student = enrollment.getStudent();
            Long sId = student.getUserId();

            Map<String, Integer> assignmentMarks = new LinkedHashMap<>();
            Map<String, Integer> quizScores = new LinkedHashMap<>();
            int totalObtained = 0;
            int totalMax = 0;
            boolean hasAnyResult = false;

            Map<Long, Submission> subMap = studentSubmissions.getOrDefault(sId, Collections.emptyMap());
            for (Assignment a : assignments) {
                Submission sub = subMap.get(a.getAssignmentId());
                if (sub != null && sub.getMarksObtained() != null) {
                    assignmentMarks.put(String.valueOf(a.getAssignmentId()), sub.getMarksObtained());
                    totalObtained += sub.getMarksObtained();
                    totalMax += (a.getMaxMarks() != null ? a.getMaxMarks() : 0);
                    hasAnyResult = true;
                }
            }

            Map<Long, QuizAttempt> attMap = studentAttempts.getOrDefault(sId, Collections.emptyMap());
            for (Quiz q : quizzes) {
                QuizAttempt qa = attMap.get(q.getQuizId());
                if (qa != null && qa.getScore() != null) {
                    quizScores.put(String.valueOf(q.getQuizId()), qa.getScore());
                    totalObtained += qa.getScore();
                    totalMax += (q.getTotalMarks() != null ? q.getTotalMarks() : 0);
                    hasAnyResult = true;
                }
            }

            Double percentage = null;
            if (hasAnyResult && totalMax > 0) {
                percentage = Math.round(((double) totalObtained / totalMax) * 1000.0) / 10.0;
            }

            rows.add(new GradebookRow(
                    sId,
                    student.getName(),
                    student.getEmail(),
                    assignmentMarks,
                    quizScores,
                    hasAnyResult ? totalObtained : 0,
                    hasAnyResult ? totalMax : 0,
                    percentage
            ));
        }

        List<GradebookAssignmentItem> assignmentItems = assignments.stream()
                .map(a -> new GradebookAssignmentItem(a.getAssignmentId(), a.getTitle(), a.getMaxMarks()))
                .collect(Collectors.toList());

        List<GradebookQuizItem> quizItems = quizzes.stream()
                .map(q -> new GradebookQuizItem(q.getQuizId(), q.getTitle(), q.getTotalMarks()))
                .collect(Collectors.toList());

        return new GradebookResponse(courseId, assignmentItems, quizItems, rows);
    }

    // G2 — GET /courses/{courseId}/grades/me (STUDENT, enrolled) -> 200
    public StudentGradesResponse getMyCourseGrades(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (!enrollmentRepository.existsByCourseCourseIdAndStudentUserId(courseId, studentId)) {
            throw new ForbiddenException("Not enrolled in course");
        }

        List<Assignment> assignments = assignmentRepository.findByCourseCourseIdOrderByDueDateAsc(courseId);
        List<Quiz> quizzes = quizRepository.findByCourseCourseIdOrderByQuizIdDesc(courseId);

        List<Submission> submissions = submissionRepository.findByAssignmentCourseCourseId(courseId).stream()
                .filter(s -> s.getStudent().getUserId().equals(studentId))
                .collect(Collectors.toList());

        Map<Long, Submission> subMap = submissions.stream()
                .collect(Collectors.toMap(s -> s.getAssignment().getAssignmentId(), Function.identity(), (s1, s2) -> s1));

        List<QuizAttempt> attempts = quizAttemptRepository.findByStudentUserId(studentId).stream()
                .filter(qa -> qa.getQuiz().getCourse().getCourseId().equals(courseId))
                .collect(Collectors.toList());

        Map<Long, QuizAttempt> attMap = attempts.stream()
                .collect(Collectors.toMap(qa -> qa.getQuiz().getQuizId(), Function.identity(), (a1, a2) -> a1));

        int totalObtained = 0;
        int totalMax = 0;
        boolean hasAnyResult = false;
        LocalDateTime now = LocalDateTime.now();

        List<StudentGradeAssignmentItem> assignmentItems = new ArrayList<>();
        for (Assignment a : assignments) {
            Submission sub = subMap.get(a.getAssignmentId());
            String status;
            Integer marks = null;
            String feedback = null;

            if (sub != null) {
                status = sub.getStatus();
                marks = sub.getMarksObtained();
                feedback = sub.getFeedback();
                if ("APPROVED".equalsIgnoreCase(status) && marks != null) {
                    totalObtained += marks;
                    totalMax += (a.getMaxMarks() != null ? a.getMaxMarks() : 0);
                    hasAnyResult = true;
                }
            } else {
                status = (a.getDueDate() != null && now.isAfter(a.getDueDate())) ? "OVERDUE" : "PENDING";
            }

            assignmentItems.add(new StudentGradeAssignmentItem(
                    a.getAssignmentId(),
                    a.getTitle(),
                    a.getMaxMarks(),
                    status,
                    marks,
                    feedback
            ));
        }

        List<StudentGradeQuizItem> quizItems = new ArrayList<>();
        for (Quiz q : quizzes) {
            QuizAttempt qa = attMap.get(q.getQuizId());
            String status = null;
            Integer score = null;

            if (qa != null) {
                status = qa.getStatus();
                score = qa.getScore();
                if ("SUBMITTED".equalsIgnoreCase(status) && score != null) {
                    totalObtained += score;
                    totalMax += (q.getTotalMarks() != null ? q.getTotalMarks() : 0);
                    hasAnyResult = true;
                }
            }

            quizItems.add(new StudentGradeQuizItem(
                    q.getQuizId(),
                    q.getTitle(),
                    q.getTotalMarks(),
                    score,
                    status,
                    qa != null ? qa.getSubmittedAt() : null
            ));
        }

        Double percentage = null;
        if (hasAnyResult && totalMax > 0) {
            percentage = Math.round(((double) totalObtained / totalMax) * 1000.0) / 10.0;
        }

        return new StudentGradesResponse(
                courseId,
                assignmentItems,
                quizItems,
                hasAnyResult ? totalObtained : 0,
                hasAnyResult ? totalMax : 0,
                percentage
        );
    }
}
