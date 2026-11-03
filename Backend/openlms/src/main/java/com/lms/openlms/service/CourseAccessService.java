package com.lms.openlms.service;

import com.lms.openlms.entity.Course;
import com.lms.openlms.exception.ResourceNotFoundException;
import com.lms.openlms.repository.CourseRepository;
import com.lms.openlms.repository.EnrollmentRepository;
import com.lms.openlms.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CourseAccessService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseAccessService(CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public Course requireOwner(Long courseId, Long facultyUserId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (course.getProfessor() == null || !course.getProfessor().getUserId().equals(facultyUserId)) {
            throw new ResourceNotFoundException("Course not found");
        }

        return course;
    }

    public Course requireMemberOrOwner(Long courseId, AuthUser user) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if ("FACULTY".equalsIgnoreCase(user.role()) || "PROFESSOR".equalsIgnoreCase(user.role())) {
            if (course.getProfessor() == null || !course.getProfessor().getUserId().equals(user.userId())) {
                throw new ResourceNotFoundException("Course not found");
            }
        } else {
            if (!isEnrolled(courseId, user.userId())) {
                throw new ResourceNotFoundException("Course not found");
            }
        }

        return course;
    }

    public boolean isEnrolled(Long courseId, Long studentId) {
        return enrollmentRepository.existsByCourseCourseIdAndStudentUserId(courseId, studentId);
    }

    public void requireStudentEnrolled(Long courseId, Long studentId) {
        if (!isEnrolled(courseId, studentId)) {
            throw new ResourceNotFoundException("Course not found");
        }
    }
}
