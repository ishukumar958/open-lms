package com.lms.openlms.repository;

import com.lms.openlms.entity.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {

    List<ChatGroup> findByTeacherUserIdAndStatusNotOrderByUpdatedAtDesc(Long teacherId, String excludedStatus);

    List<ChatGroup> findByCourseCourseIdAndStatusNotOrderByUpdatedAtDesc(Long courseId, String excludedStatus);

    @Query("SELECT DISTINCT cg FROM ChatGroup cg " +
           "JOIN ChatGroupMember cgm ON cg.groupId = cgm.group.groupId " +
           "WHERE cgm.student.userId = :studentId " +
           "AND cg.status <> :excludedStatus " +
           "ORDER BY cg.updatedAt DESC")
    List<ChatGroup> findGroupsByStudentUserId(@Param("studentId") Long studentId,
                                             @Param("excludedStatus") String excludedStatus);

    boolean existsByGroupIdAndTeacherUserId(Long groupId, Long teacherId);
}
