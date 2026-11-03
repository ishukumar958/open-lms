package com.lms.openlms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public class AssignmentDto {

    public static class CreateAssignmentRequest {
        @NotBlank(message = "Title is required")
        @Size(min = 2, max = 150, message = "Title must be between 2 and 150 characters")
        private String title;

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        private String description;

        @NotNull(message = "Due date is required")
        @Future(message = "Due date must be in the future")
        @JsonDeserialize(using = com.lms.openlms.config.FlexibleDateTimeDeserializer.class)
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime dueDate;

        @NotNull(message = "Max marks is required")
        @Min(value = 1, message = "Max marks must be at least 1")
        @Max(value = 1000, message = "Max marks cannot exceed 1000")
        private Integer maxMarks;

        @Size(max = 500, message = "Attachment URL must not exceed 500 characters")
        @Pattern(regexp = "^(https?://.*)?$", message = "Attachment URL must be http or https")
        private String attachmentUrl;

        public CreateAssignmentRequest() {}

        public CreateAssignmentRequest(String title, String description, LocalDateTime dueDate, Integer maxMarks, String attachmentUrl) {
            this.title = title;
            this.description = description;
            this.dueDate = dueDate;
            this.maxMarks = maxMarks;
            this.attachmentUrl = attachmentUrl;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDateTime getDueDate() {
            return dueDate;
        }

        public void setDueDate(LocalDateTime dueDate) {
            this.dueDate = dueDate;
        }

        public Integer getMaxMarks() {
            return maxMarks;
        }

        public void setMaxMarks(Integer maxMarks) {
            this.maxMarks = maxMarks;
        }

        public String getAttachmentUrl() {
            return attachmentUrl;
        }

        public void setAttachmentUrl(String attachmentUrl) {
            this.attachmentUrl = attachmentUrl;
        }
    }

    public static class UpdateAssignmentRequest {
        @NotBlank(message = "Title is required")
        @Size(min = 2, max = 150, message = "Title must be between 2 and 150 characters")
        private String title;

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        private String description;

        @NotNull(message = "Due date is required")
        @JsonDeserialize(using = com.lms.openlms.config.FlexibleDateTimeDeserializer.class)
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime dueDate;

        @NotNull(message = "Max marks is required")
        @Min(value = 1, message = "Max marks must be at least 1")
        @Max(value = 1000, message = "Max marks cannot exceed 1000")
        private Integer maxMarks;

        @Size(max = 500, message = "Attachment URL must not exceed 500 characters")
        @Pattern(regexp = "^(https?://.*)?$", message = "Attachment URL must be http or https")
        private String attachmentUrl;

        public UpdateAssignmentRequest() {}

        public UpdateAssignmentRequest(String title, String description, LocalDateTime dueDate, Integer maxMarks, String attachmentUrl) {
            this.title = title;
            this.description = description;
            this.dueDate = dueDate;
            this.maxMarks = maxMarks;
            this.attachmentUrl = attachmentUrl;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDateTime getDueDate() {
            return dueDate;
        }

        public void setDueDate(LocalDateTime dueDate) {
            this.dueDate = dueDate;
        }

        public Integer getMaxMarks() {
            return maxMarks;
        }

        public void setMaxMarks(Integer maxMarks) {
            this.maxMarks = maxMarks;
        }

        public String getAttachmentUrl() {
            return attachmentUrl;
        }

        public void setAttachmentUrl(String attachmentUrl) {
            this.attachmentUrl = attachmentUrl;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AssignmentResponse {
        private Long assignmentId;
        private Long courseId;
        private String courseName;
        private String title;
        private String description;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime dueDate;
        private Integer maxMarks;
        private String attachmentUrl;
        private Long createdById;
        private String createdByName;
        private Long submissionCount;
        private String myStatus;
        private MySubmissionSummary mySubmission;

        public AssignmentResponse() {}

        public Long getAssignmentId() {
            return assignmentId;
        }

        public void setAssignmentId(Long assignmentId) {
            this.assignmentId = assignmentId;
        }

        public Long getId() {
            return assignmentId;
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

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public LocalDateTime getDueDate() {
            return dueDate;
        }

        public void setDueDate(LocalDateTime dueDate) {
            this.dueDate = dueDate;
        }

        public Integer getMaxMarks() {
            return maxMarks;
        }

        public void setMaxMarks(Integer maxMarks) {
            this.maxMarks = maxMarks;
        }

        public String getAttachmentUrl() {
            return attachmentUrl;
        }

        public void setAttachmentUrl(String attachmentUrl) {
            this.attachmentUrl = attachmentUrl;
        }

        public Long getCreatedById() {
            return createdById;
        }

        public void setCreatedById(Long createdById) {
            this.createdById = createdById;
        }

        public String getCreatedByName() {
            return createdByName;
        }

        public void setCreatedByName(String createdByName) {
            this.createdByName = createdByName;
        }

        public Long getSubmissionCount() {
            return submissionCount;
        }

        public void setSubmissionCount(Long submissionCount) {
            this.submissionCount = submissionCount;
        }

        public String getMyStatus() {
            return myStatus;
        }

        public void setMyStatus(String myStatus) {
            this.myStatus = myStatus;
        }

        public MySubmissionSummary getMySubmission() {
            return mySubmission;
        }

        public void setMySubmission(MySubmissionSummary mySubmission) {
            this.mySubmission = mySubmission;
        }
    }

    public static class MySubmissionSummary {
        private Long submissionId;
        private String status;
        private Integer marksObtained;
        private Boolean isLate;

        public MySubmissionSummary() {}

        public MySubmissionSummary(Long submissionId, String status, Integer marksObtained, Boolean isLate) {
            this.submissionId = submissionId;
            this.status = status;
            this.marksObtained = marksObtained;
            this.isLate = isLate;
        }

        public Long getSubmissionId() {
            return submissionId;
        }

        public void setSubmissionId(Long submissionId) {
            this.submissionId = submissionId;
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

        public Boolean getIsLate() {
            return isLate;
        }

        public void setIsLate(Boolean isLate) {
            this.isLate = isLate;
        }
    }
}
