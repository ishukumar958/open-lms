package com.lms.openlms.repository;

import com.lms.openlms.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCourseCourseId(Long courseId);
    List<Quiz> findByCourseCourseIdOrderByQuizIdDesc(Long courseId);
    List<Quiz> findByCourseCourseIdIn(List<Long> courseIds);
    List<Quiz> findByCreatedByUserId(Long createdById);
}
