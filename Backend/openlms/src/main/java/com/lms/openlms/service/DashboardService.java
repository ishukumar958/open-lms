package com.lms.openlms.service;

import com.lms.openlms.dto.DashboardDto.*;
import com.lms.openlms.entity.*;
import com.lms.openlms.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public DashboardService(EnrollmentRepository enrollmentRepository,
                            CourseRepository courseRepository,
                            AssignmentRepository assignmentRepository,
                            SubmissionRepository submissionRepository,
                            QuizRepository quizRepository,
                            QuizAttemptRepository quizAttemptRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
    }

    // D1 — GET /dashboard/student (STUDENT) -> 200
    public StudentDashboardResponse getStudentDashboard(Long studentId) {
        List<Enrollment> enrollments = enrollmentRepository.findByStudentUserId(studentId);
        List<Course> enrolledCourses = enrollments.stream()
                .map(Enrollment::getCourse)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<Long> courseIds = enrolledCourses.stream()
                .map(Course::getCourseId)
                .collect(Collectors.toList());

        List<Assignment> assignments = courseIds.isEmpty()
                ? Collections.emptyList()
                : assignmentRepository.findByCourseCourseIdInOrderByDueDateAsc(courseIds);

        List<Submission> submissions = submissionRepository.findByStudentUserId(studentId);
        Map<Long, Submission> subByAssignmentId = submissions.stream()
                .filter(s -> s.getAssignment() != null)
                .collect(Collectors.toMap(s -> s.getAssignment().getAssignmentId(), s -> s, (s1, s2) -> s1));

        List<QuizAttempt> quizAttempts = quizAttemptRepository.findByStudentUserId(studentId);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime in7Days = now.plusDays(7);
        LocalDateTime in14Days = now.plusDays(14);

        int pendingCount = 0;
        int dueThisWeekCount = 0;

        for (Assignment a : assignments) {
            boolean hasSubmission = subByAssignmentId.containsKey(a.getAssignmentId());
            boolean notOverdue = a.getDueDate() != null && a.getDueDate().isAfter(now);
            if (!hasSubmission && notOverdue) {
                pendingCount++;
                if (a.getDueDate().isBefore(in7Days)) {
                    dueThisWeekCount++;
                }
            }
        }

        // Average grade percent calculation
        double totalEarned = 0.0;
        double totalPossible = 0.0;

        for (Submission s : submissions) {
            if ("APPROVED".equalsIgnoreCase(s.getStatus()) && s.getMarksObtained() != null && s.getAssignment() != null) {
                totalEarned += s.getMarksObtained();
                totalPossible += (s.getAssignment().getMaxMarks() != null ? s.getAssignment().getMaxMarks() : 0);
            }
        }

        for (QuizAttempt qa : quizAttempts) {
            if ("SUBMITTED".equalsIgnoreCase(qa.getStatus()) && qa.getScore() != null && qa.getQuiz() != null) {
                totalEarned += qa.getScore();
                totalPossible += (qa.getQuiz().getTotalMarks() != null ? qa.getQuiz().getTotalMarks() : 0);
            }
        }

        Double avgGrade = null;
        if (totalPossible > 0) {
            avgGrade = Math.round((totalEarned * 100.0 / totalPossible) * 10.0) / 10.0;
        }

        StudentStats stats = new StudentStats(
                enrolledCourses.size(),
                dueThisWeekCount,
                pendingCount,
                avgGrade
        );

        // Courses list
        List<StudentCourseItem> courseItems = new ArrayList<>();
        for (Course c : enrolledCourses) {
            List<Assignment> cAssigns = assignments.stream()
                    .filter(a -> a.getCourse() != null && a.getCourse().getCourseId().equals(c.getCourseId()))
                    .collect(Collectors.toList());

            int totalAssigns = cAssigns.size();
            int completedAssigns = (int) cAssigns.stream()
                    .filter(a -> subByAssignmentId.containsKey(a.getAssignmentId()))
                    .count();

            int progressPercent = totalAssigns == 0 ? 0 : (completedAssigns * 100 / totalAssigns);

            StudentCourseItem item = new StudentCourseItem();
            item.setCourseId(c.getCourseId());
            item.setCourseName(c.getCourseName());
            item.setCourseCode(c.getCourseCode());
            item.setProfessorName(c.getProfessor() != null ? c.getProfessor().getName() : null);
            item.setTotalAssignments(totalAssigns);
            item.setCompletedAssignments(completedAssigns);
            item.setProgressPercent(progressPercent);
            courseItems.add(item);
        }

        // Upcoming deadlines: not yet submitted, due within 14 days, soonest first, max 10
        List<UpcomingDeadlineItem> upcoming = assignments.stream()
                .filter(a -> !subByAssignmentId.containsKey(a.getAssignmentId())
                        && a.getDueDate() != null
                        && a.getDueDate().isAfter(now)
                        && a.getDueDate().isBefore(in14Days))
                .sorted(Comparator.comparing(Assignment::getDueDate))
                .limit(10)
                .map(a -> {
                    UpcomingDeadlineItem item = new UpcomingDeadlineItem();
                    item.setAssignmentId(a.getAssignmentId());
                    item.setTitle(a.getTitle());
                    if (a.getCourse() != null) {
                        item.setCourseId(a.getCourse().getCourseId());
                        item.setCourseName(a.getCourse().getCourseName());
                    }
                    item.setDueDate(a.getDueDate());
                    item.setStatus("PENDING");
                    return item;
                })
                .collect(Collectors.toList());

        StudentDashboardResponse resp = new StudentDashboardResponse();
        resp.setStats(stats);
        resp.setCourses(courseItems);
        resp.setUpcomingDeadlines(upcoming);
        return resp;
    }

    // D2 — GET /dashboard/professor (FACULTY) -> 200
    public ProfessorDashboardResponse getProfessorDashboard(Long facultyUserId) {
        List<Course> courses = courseRepository.findByProfessorUserId(facultyUserId);
        List<Submission> allSubmissions = submissionRepository.findGradingQueue(facultyUserId, null, null, null);
        List<Quiz> quizzes = quizRepository.findByCreatedByUserId(facultyUserId);

        int activeCourses = courses.size();
        int pendingGrading = (int) allSubmissions.stream()
                .filter(s -> "SUBMITTED".equalsIgnoreCase(s.getStatus()))
                .count();

        int totalStudents = 0;
        List<ProfessorCourseItem> courseItems = new ArrayList<>();

        for (Course c : courses) {
            int enrollCount = (int) enrollmentRepository.countByCourseCourseId(c.getCourseId());
            totalStudents += enrollCount;

            List<Assignment> cAssigns = assignmentRepository.findByCourseCourseId(c.getCourseId());
            int cPendingSubmissions = (int) allSubmissions.stream()
                    .filter(s -> s.getAssignment() != null
                            && s.getAssignment().getCourse() != null
                            && s.getAssignment().getCourse().getCourseId().equals(c.getCourseId())
                            && "SUBMITTED".equalsIgnoreCase(s.getStatus()))
                    .count();

            ProfessorCourseItem item = new ProfessorCourseItem();
            item.setCourseId(c.getCourseId());
            item.setCourseName(c.getCourseName());
            item.setCourseCode(c.getCourseCode());
            item.setSection(c.getSection());
            item.setEnrollmentCount(enrollCount);
            item.setAssignmentCount(cAssigns.size());
            item.setPendingSubmissions(cPendingSubmissions);
            courseItems.add(item);
        }

        ProfessorStats stats = new ProfessorStats(
                activeCourses,
                totalStudents,
                pendingGrading,
                quizzes.size()
        );

        // Recent 10 submissions across courses, newest first
        List<RecentSubmissionItem> recent = allSubmissions.stream()
                .sorted((s1, s2) -> {
                    if (s1.getSubmittedAt() == null && s2.getSubmittedAt() == null) return 0;
                    if (s1.getSubmittedAt() == null) return 1;
                    if (s2.getSubmittedAt() == null) return -1;
                    return s2.getSubmittedAt().compareTo(s1.getSubmittedAt());
                })
                .limit(10)
                .map(s -> new RecentSubmissionItem(
                        s.getSubmissionId(),
                        s.getStudent() != null ? s.getStudent().getName() : null,
                        s.getAssignment() != null ? s.getAssignment().getTitle() : null,
                        (s.getAssignment() != null && s.getAssignment().getCourse() != null)
                                ? s.getAssignment().getCourse().getCourseName() : null,
                        s.getSubmittedAt(),
                        s.getStatus()
                ))
                .collect(Collectors.toList());

        ProfessorDashboardResponse resp = new ProfessorDashboardResponse();
        resp.setStats(stats);
        resp.setCourses(courseItems);
        resp.setRecentSubmissions(recent);
        return resp;
    }
}
