package com.lms.openlms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long courseId;

    @Column(name = "course_name", nullable = false, length = 150)
    private String courseName;

    @Column(name = "course_code", nullable = false, unique = true, length = 50)
    private String courseCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "professor_id", nullable = false)
    private User professor;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "section", nullable = false, length = 50)
    private String section = "Section 01";

    public Course() {}

    public Course(Long courseId, String courseName, String courseCode, User professor) {
        this.courseId = courseId;
        this.courseName = courseName;
        this.courseCode = courseCode;
        this.professor = professor;
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

    public void setId(Long id) {
        this.courseId = id;
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

    public User getProfessor() {
        return professor;
    }

    public void setProfessor(User professor) {
        this.professor = professor;
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
