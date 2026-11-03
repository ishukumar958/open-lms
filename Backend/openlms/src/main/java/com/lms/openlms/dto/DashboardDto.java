package com.lms.openlms.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DashboardDto {

    public static class StudentStats {
        private Integer enrolledCourses;
        private Integer dueThisWeek;
        private Integer pendingAssignments;
        private Double averageGradePercent;

        public StudentStats() {}

        public StudentStats(Integer enrolledCourses, Integer dueThisWeek, Integer pendingAssignments, Double averageGradePercent) {
            this.enrolledCourses = enrolledCourses;
            this.dueThisWeek = dueThisWeek;
            this.pendingAssignments = pendingAssignments;
            this.averageGradePercent = averageGradePercent;
        }

        public Integer getEnrolledCourses() { return enrolledCourses; }
        public void setEnrolledCourses(Integer enrolledCourses) { this.enrolledCourses = enrolledCourses; }
        public Integer getDueThisWeek() { return dueThisWeek; }
        public void setDueThisWeek(Integer dueThisWeek) { this.dueThisWeek = dueThisWeek; }
        public Integer getPendingAssignments() { return pendingAssignments; }
        public void setPendingAssignments(Integer pendingAssignments) { this.pendingAssignments = pendingAssignments; }
        public Double getAverageGradePercent() { return averageGradePercent; }
        public void setAverageGradePercent(Double averageGradePercent) { this.averageGradePercent = averageGradePercent; }
    }

    public static class StudentCourseItem {
        private Long courseId;
        private String courseName;
        private String courseCode;
        private String professorName;
        private Integer totalAssignments;
        private Integer completedAssignments;
        private Integer progressPercent;

        public StudentCourseItem() {}

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
        public String getProfessorName() { return professorName; }
        public void setProfessorName(String professorName) { this.professorName = professorName; }
        public Integer getTotalAssignments() { return totalAssignments; }
        public void setTotalAssignments(Integer totalAssignments) { this.totalAssignments = totalAssignments; }
        public Integer getCompletedAssignments() { return completedAssignments; }
        public void setCompletedAssignments(Integer completedAssignments) { this.completedAssignments = completedAssignments; }
        public Integer getProgressPercent() { return progressPercent; }
        public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }
    }

    public static class UpcomingDeadlineItem {
        private Long assignmentId;
        private String title;
        private Long courseId;
        private String courseName;
        private LocalDateTime dueDate;
        private String status;

        public UpcomingDeadlineItem() {}

        public Long getAssignmentId() { return assignmentId; }
        public void setAssignmentId(Long assignmentId) { this.assignmentId = assignmentId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public LocalDateTime getDueDate() { return dueDate; }
        public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class StudentDashboardResponse {
        private StudentStats stats;
        private List<StudentCourseItem> courses;
        private List<UpcomingDeadlineItem> upcomingDeadlines;

        public StudentDashboardResponse() {}

        public StudentStats getStats() { return stats; }
        public void setStats(StudentStats stats) { this.stats = stats; }
        public List<StudentCourseItem> getCourses() { return courses; }
        public void setCourses(List<StudentCourseItem> courses) { this.courses = courses; }
        public List<UpcomingDeadlineItem> getUpcomingDeadlines() { return upcomingDeadlines; }
        public void setUpcomingDeadlines(List<UpcomingDeadlineItem> upcomingDeadlines) { this.upcomingDeadlines = upcomingDeadlines; }
    }

    public static class ProfessorStats {
        private Integer activeCourses;
        private Integer totalStudents;
        private Integer pendingGrading;
        private Integer quizzesActive;

        public ProfessorStats() {}

        public ProfessorStats(Integer activeCourses, Integer totalStudents, Integer pendingGrading, Integer quizzesActive) {
            this.activeCourses = activeCourses;
            this.totalStudents = totalStudents;
            this.pendingGrading = pendingGrading;
            this.quizzesActive = quizzesActive;
        }

        public Integer getActiveCourses() { return activeCourses; }
        public void setActiveCourses(Integer activeCourses) { this.activeCourses = activeCourses; }
        public Integer getTotalStudents() { return totalStudents; }
        public void setTotalStudents(Integer totalStudents) { this.totalStudents = totalStudents; }
        public Integer getPendingGrading() { return pendingGrading; }
        public void setPendingGrading(Integer pendingGrading) { this.pendingGrading = pendingGrading; }
        public Integer getQuizzesActive() { return quizzesActive; }
        public void setQuizzesActive(Integer quizzesActive) { this.quizzesActive = quizzesActive; }
    }

    public static class ProfessorCourseItem {
        private Long courseId;
        private String courseName;
        private String courseCode;
        private String section;
        private Integer enrollmentCount;
        private Integer assignmentCount;
        private Integer pendingSubmissions;

        public ProfessorCourseItem() {}

        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }
        public Integer getEnrollmentCount() { return enrollmentCount; }
        public void setEnrollmentCount(Integer enrollmentCount) { this.enrollmentCount = enrollmentCount; }
        public Integer getAssignmentCount() { return assignmentCount; }
        public void setAssignmentCount(Integer assignmentCount) { this.assignmentCount = assignmentCount; }
        public Integer getPendingSubmissions() { return pendingSubmissions; }
        public void setPendingSubmissions(Integer pendingSubmissions) { this.pendingSubmissions = pendingSubmissions; }
    }

    public static class RecentSubmissionItem {
        private Long submissionId;
        private String studentName;
        private String assignmentTitle;
        private String courseName;
        private LocalDateTime submittedAt;
        private String status;

        public RecentSubmissionItem() {}

        public RecentSubmissionItem(Long submissionId, String studentName, String assignmentTitle, String courseName, LocalDateTime submittedAt, String status) {
            this.submissionId = submissionId;
            this.studentName = studentName;
            this.assignmentTitle = assignmentTitle;
            this.courseName = courseName;
            this.submittedAt = submittedAt;
            this.status = status;
        }

        public Long getSubmissionId() { return submissionId; }
        public void setSubmissionId(Long submissionId) { this.submissionId = submissionId; }
        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }
        public String getAssignmentTitle() { return assignmentTitle; }
        public void setAssignmentTitle(String assignmentTitle) { this.assignmentTitle = assignmentTitle; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public LocalDateTime getSubmittedAt() { return submittedAt; }
        public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ProfessorDashboardResponse {
        private ProfessorStats stats;
        private List<ProfessorCourseItem> courses;
        private List<RecentSubmissionItem> recentSubmissions;

        public ProfessorDashboardResponse() {}

        public ProfessorStats getStats() { return stats; }
        public void setStats(ProfessorStats stats) { this.stats = stats; }
        public List<ProfessorCourseItem> getCourses() { return courses; }
        public void setCourses(List<ProfessorCourseItem> courses) { this.courses = courses; }
        public List<RecentSubmissionItem> getRecentSubmissions() { return recentSubmissions; }
        public void setRecentSubmissions(List<RecentSubmissionItem> recentSubmissions) { this.recentSubmissions = recentSubmissions; }
    }
}
