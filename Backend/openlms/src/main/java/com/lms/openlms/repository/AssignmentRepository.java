package com.lms.openlms.repository;

import com.lms.openlms.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourseCourseId(Long courseId);
    List<Assignment> findByCourseCourseIdOrderByDueDateAsc(Long courseId);
    List<Assignment> findByCreatedByUserId(Long createdById);
    List<Assignment> findByCourseCourseIdInOrderByDueDateAsc(List<Long> courseIds);
}
