package com.lms.openlms.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class ResourceDto {

    public static class CreateResourceRequest {
        @NotBlank(message = "Title is required")
        @Size(min = 2, max = 150, message = "Title must be between 2 and 150 characters")
        private String title;

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        private String description;

        @NotBlank(message = "File URL is required")
        @Size(max = 500, message = "File URL must not exceed 500 characters")
        @Pattern(regexp = "^https?://.*$", message = "File URL must be an http or https URL")
        private String fileUrl;

        public CreateResourceRequest() {}

        public CreateResourceRequest(String title, String description, String fileUrl) {
            this.title = title;
            this.description = description;
            this.fileUrl = fileUrl;
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

        public String getFileUrl() {
            return fileUrl;
        }

        public void setFileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ResourceResponse {
        private Long resourceId;
        private Long courseId;
        private String title;
        private String description;
        private String fileUrl;
        private Long uploadedById;
        private String uploadedByName;
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime uploadedAt;

        public ResourceResponse() {}

        public ResourceResponse(Long resourceId, Long courseId, String title, String description,
                                String fileUrl, Long uploadedById, String uploadedByName, LocalDateTime uploadedAt) {
            this.resourceId = resourceId;
            this.courseId = courseId;
            this.title = title;
            this.description = description;
            this.fileUrl = fileUrl;
            this.uploadedById = uploadedById;
            this.uploadedByName = uploadedByName;
            this.uploadedAt = uploadedAt;
        }

        public Long getResourceId() {
            return resourceId;
        }

        public void setResourceId(Long resourceId) {
            this.resourceId = resourceId;
        }

        public Long getId() {
            return resourceId;
        }

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
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

        public String getFileUrl() {
            return fileUrl;
        }

        public void setFileUrl(String fileUrl) {
            this.fileUrl = fileUrl;
        }

        public Long getUploadedById() {
            return uploadedById;
        }

        public void setUploadedById(Long uploadedById) {
            this.uploadedById = uploadedById;
        }

        public String getUploadedByName() {
            return uploadedByName;
        }

        public void setUploadedByName(String uploadedByName) {
            this.uploadedByName = uploadedByName;
        }

        public LocalDateTime getUploadedAt() {
            return uploadedAt;
        }

        public void setUploadedAt(LocalDateTime uploadedAt) {
            this.uploadedAt = uploadedAt;
        }
    }
}
