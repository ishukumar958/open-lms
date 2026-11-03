package com.lms.openlms.dto;

import java.time.LocalDateTime;

public class SubmissionDto {

    public static class SubmitRequest {
        private String submissionText;
        private String fileUrl;

        public SubmitRequest() {}

        public SubmitRequest(String submissionText, String fileUrl) {
            this.submissionText = submissionText;
            this.fileUrl = fileUrl;
        }

        public String getSubmissionText() {
            return submissionText;
        }

        public void setSubmissionText(String submissionText) {
            this.submissionText = submissionText;
        }

        public String getFileUrl() {
            return fileUrl;
        }

        public void setFileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
        }

        public String getAttachmentUrl() {
            return fileUrl;
        }

        public void setAttachmentUrl(String attachmentUrl) {
            this.fileUrl = attachmentUrl;
        }
    }

    public static class CreateSubmissionRequest {
        private Long assignmentId;
        private Long studentId;
        private String submissionText;
        private String fileUrl;
        private String status = "SUBMITTED";

        public CreateSubmissionRequest() {}

        public Long getAssignmentId() {
            return assignmentId;
        }

        public void setAssignmentId(Long assignmentId) {
            this.assignmentId = assignmentId;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getSubmissionText() {
            return submissionText;
        }

        public void setSubmissionText(String submissionText) {
            this.submissionText = submissionText;
        }

        public String getFileUrl() {
            return fileUrl;
        }

        public void setFileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class GradeRequest {
        private String status;
        private Integer marksObtained;
        private String feedback;

        public GradeRequest() {}

        public GradeRequest(String status, Integer marksObtained, String feedback) {
            this.status = status;
            this.marksObtained = marksObtained;
            this.feedback = feedback;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getMarksObtained() {
            return marksObtained;
        }

        public void setMarksObtained(Integer marksObtained) {
            this.marksObtained = marksObtained;
        }

        public Integer getMarks() {
            return marksObtained;
        }

        public void setMarks(Integer marks) {
            this.marksObtained = marks;
        }

        public String getFeedback() {
            return feedback;
        }

        public void setFeedback(String feedback) {
            this.feedback = feedback;
        }
    }

    public static class GradeSubmissionRequest extends GradeRequest {
        public GradeSubmissionRequest() {
            super();
        }
    }

    public static class SubmissionResponse {
        private Long submissionId;
        private Long assignmentId;
        private String assignmentTitle;
        private Long courseId;
        private String courseName;
        private Long studentId;
        private String studentName;
        private String studentEmail;
        private String submissionText;
        private String fileUrl;
        private String status;
        private Integer marksObtained;
        private Integer maxMarks;
        private String feedback;
        private LocalDateTime submittedAt;
        private LocalDateTime gradedAt;
        private Boolean isLate;

        public SubmissionResponse() {}

        public Long getSubmissionId() {
            return submissionId;
        }

        public void setSubmissionId(Long submissionId) {
            this.submissionId = submissionId;
        }

        public Long getId() {
            return submissionId;
        }

        public void setId(Long id) {
            this.submissionId = id;
        }

        public Long getAssignmentId() {
            return assignmentId;
        }

        public void setAssignmentId(Long assignmentId) {
            this.assignmentId = assignmentId;
        }

        public String getAssignmentTitle() {
            return assignmentTitle;
        }

        public void setAssignmentTitle(String assignmentTitle) {
            this.assignmentTitle = assignmentTitle;
        }

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }

        public String getCourseName() {
            return courseName;
        }

        public void setCourseName(String courseName) {
            this.courseName = courseName;
        }

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getStudentName() {
            return studentName;
        }

        public void setStudentName(String studentName) {
            this.studentName = studentName;
        }

        public String getStudentEmail() {
            return studentEmail;
        }

        public void setStudentEmail(String studentEmail) {
            this.studentEmail = studentEmail;
        }

        public String getSubmissionText() {
            return submissionText;
        }

        public void setSubmissionText(String submissionText) {
            this.submissionText = submissionText;
        }

        public String getFileUrl() {
            return fileUrl;
        }

        public void setFileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Integer getMarksObtained() {
            return marksObtained;
        }

        public void setMarksObtained(Integer marksObtained) {
            this.marksObtained = marksObtained;
        }

        public Integer getMaxMarks() {
            return maxMarks;
        }

        public void setMaxMarks(Integer maxMarks) {
            this.maxMarks = maxMarks;
        }

        public String getFeedback() {
            return feedback;
        }

        public void setFeedback(String feedback) {
            this.feedback = feedback;
        }

        public LocalDateTime getSubmittedAt() {
            return submittedAt;
        }

        public void setSubmittedAt(LocalDateTime submittedAt) {
            this.submittedAt = submittedAt;
        }

        public LocalDateTime getGradedAt() {
            return gradedAt;
        }

        public void setGradedAt(LocalDateTime gradedAt) {
            this.gradedAt = gradedAt;
        }

        public Boolean getIsLate() {
            return isLate;
        }

        public void setIsLate(Boolean isLate) {
            this.isLate = isLate;
        }
    }
}
