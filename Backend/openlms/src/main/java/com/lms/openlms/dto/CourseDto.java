package com.lms.openlms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CourseDto {

    public static class CreateCourseRequest {
        @NotBlank(message = "Course name is required")
        @Size(min = 2, max = 150, message = "Course name must be between 2 and 150 characters")
        private String courseName;

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        private String description;

        @Size(max = 50, message = "Section must not exceed 50 characters")
        private String section;

        public CreateCourseRequest() {}

        public CreateCourseRequest(String courseName, String description, String section) {
            this.courseName = courseName;
            this.description = description;
            this.section = section;
        }

        public String getCourseName() {
            return courseName;
        }

        public void setCourseName(String courseName) {
            this.courseName = courseName;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getSection() {
            return section;
        }

        public void setSection(String section) {
            this.section = section;
        }
    }

    public static class UpdateCourseRequest {
        @NotBlank(message = "Course name is required")
        @Size(min = 2, max = 150, message = "Course name must be between 2 and 150 characters")
        private String courseName;

        @Size(max = 2000, message = "Description must not exceed 2000 characters")
        private String description;

        @Size(max = 50, message = "Section must not exceed 50 characters")
        private String section;

        public UpdateCourseRequest() {}

        public UpdateCourseRequest(String courseName, String description, String section) {
            this.courseName = courseName;
            this.description = description;
            this.section = section;
        }

        public String getCourseName() {
            return courseName;
        }

        public void setCourseName(String courseName) {
            this.courseName = courseName;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getSection() {
            return section;
        }

        public void setSection(String section) {
            this.section = section;
        }
    }

    public static class JoinCourseRequest {
        @NotBlank(message = "Course code is required")
        private String courseCode;

        public JoinCourseRequest() {}

        public JoinCourseRequest(String courseCode) {
            this.courseCode = courseCode;
        }

        public String getCourseCode() {
            return courseCode;
        }

        public void setCourseCode(String courseCode) {
            this.courseCode = courseCode;
        }
    }

    public static class CourseResponse {
        private Long courseId;
        private String courseName;
        private String courseCode;
        private String description;
        private String section;
        private Long professorId;
        private String professorName;
        private long enrollmentCount;

        public CourseResponse() {}

        public CourseResponse(Long courseId, String courseName, String courseCode, String description,
                              String section, Long professorId, String professorName, long enrollmentCount) {
            this.courseId = courseId;
            this.courseName = courseName;
            this.courseCode = courseCode;
            this.description = description;
            this.section = section;
            this.professorId = professorId;
            this.professorName = professorName;
            this.enrollmentCount = enrollmentCount;
        }

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }

        public Long getId() {
            return courseId;
        }

        public String getCourseName() {
            return courseName;
        }

        public void setCourseName(String courseName) {
            this.courseName = courseName;
        }

        public String getCourseCode() {
            return courseCode;
        }

        public void setCourseCode(String courseCode) {
            this.courseCode = courseCode;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getSection() {
            return section;
        }

        public void setSection(String section) {
            this.section = section;
        }

        public Long getProfessorId() {
            return professorId;
        }

        public void setProfessorId(Long professorId) {
            this.professorId = professorId;
        }

        public String getProfessorName() {
            return professorName;
        }

        public void setProfessorName(String professorName) {
            this.professorName = professorName;
        }

        public long getEnrollmentCount() {
            return enrollmentCount;
        }

        public void setEnrollmentCount(long enrollmentCount) {
            this.enrollmentCount = enrollmentCount;
        }
    }

    public static class StudentItem {
        private Long userId;
        private String name;
        private String email;

        public StudentItem() {}

        public StudentItem(Long userId, String name, String email) {
            this.userId = userId;
            this.name = name;
            this.email = email;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }
}
