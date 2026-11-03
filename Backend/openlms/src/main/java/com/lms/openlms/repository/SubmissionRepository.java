package com.lms.openlms.repository;

import com.lms.openlms.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignmentAssignmentId(Long assignmentId);
    List<Submission> findByAssignmentAssignmentIdOrderBySubmittedAtDesc(Long assignmentId);
    List<Submission> findByStudentUserId(Long studentId);
    List<Submission> findByStudentUserIdOrderBySubmittedAtDesc(Long studentId);
    Optional<Submission> findByAssignmentAssignmentIdAndStudentUserId(Long assignmentId, Long studentId);
    List<Submission> findByAssignmentCourseCourseId(Long courseId);
    long countByAssignmentAssignmentId(Long assignmentId);
    boolean existsByAssignmentAssignmentId(Long assignmentId);

    @Query("SELECT s FROM Submission s " +
           "JOIN s.assignment a " +
           "JOIN a.course c " +
           "WHERE c.professor.userId = :professorUserId " +
           "AND (:status IS NULL OR s.status = :status) " +
           "AND (:courseId IS NULL OR c.courseId = :courseId) " +
           "AND (:assignmentId IS NULL OR a.assignmentId = :assignmentId) " +
           "ORDER BY s.submittedAt ASC")
    List<Submission> findGradingQueue(
            @Param("professorUserId") Long professorUserId,
            @Param("status") String status,
            @Param("courseId") Long courseId,
            @Param("assignmentId") Long assignmentId);
}
