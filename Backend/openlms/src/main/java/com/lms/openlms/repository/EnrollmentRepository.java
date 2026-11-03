package com.lms.openlms.repository;

import com.lms.openlms.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudentUserId(Long studentId);
    List<Enrollment> findByStudentUserIdOrderByCourseCourseNameAsc(Long studentId);
    List<Enrollment> findByCourseCourseId(Long courseId);
    Optional<Enrollment> findByCourseCourseIdAndStudentUserId(Long courseId, Long studentId);
    boolean existsByCourseCourseIdAndStudentUserId(Long courseId, Long studentId);
    long countByCourseCourseId(Long courseId);
    void deleteByCourseCourseIdAndStudentUserId(Long courseId, Long studentId);
}
