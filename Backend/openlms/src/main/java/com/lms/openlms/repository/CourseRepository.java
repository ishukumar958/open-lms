package com.lms.openlms.repository;

import com.lms.openlms.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCourseCode(String courseCode);
    Optional<Course> findByCourseCodeIgnoreCase(String courseCode);
    boolean existsByCourseCode(String courseCode);
    List<Course> findByProfessorUserId(Long professorId);
    List<Course> findByProfessorUserIdOrderByCourseNameAsc(Long professorId);
}
