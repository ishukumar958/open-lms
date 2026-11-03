package com.lms.openlms.repository;

import com.lms.openlms.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByCourseCourseId(Long courseId);
    List<Resource> findByCourseCourseIdOrderByUploadedAtDesc(Long courseId);
    List<Resource> findByUploadedByUserId(Long uploadedById);
}
