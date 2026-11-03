package com.lms.openlms.repository;

import com.lms.openlms.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByQuizQuizId(Long quizId);
    List<QuizAttempt> findByQuizQuizIdOrderByAttemptIdDesc(Long quizId);
    List<QuizAttempt> findByStudentUserId(Long studentId);
    List<QuizAttempt> findByStudentUserIdAndQuizQuizIdIn(Long studentId, List<Long> quizIds);
    Optional<QuizAttempt> findByQuizQuizIdAndStudentUserId(Long quizId, Long studentId);
    List<QuizAttempt> findByQuizCourseCourseId(Long courseId);
    boolean existsByQuizQuizId(Long quizId);
}
