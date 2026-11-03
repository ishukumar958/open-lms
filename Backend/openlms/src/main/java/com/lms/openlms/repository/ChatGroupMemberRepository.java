package com.lms.openlms.repository;

import com.lms.openlms.entity.ChatGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatGroupMemberRepository extends JpaRepository<ChatGroupMember, Long> {

    List<ChatGroupMember> findByGroupGroupId(Long groupId);

    Optional<ChatGroupMember> findByGroupGroupIdAndStudentUserId(Long groupId, Long studentId);

    boolean existsByGroupGroupIdAndStudentUserId(Long groupId, Long studentId);

    long countByGroupGroupId(Long groupId);

    void deleteByGroupGroupIdAndStudentUserId(Long groupId, Long studentId);

    @Modifying
    @Query("DELETE FROM ChatGroupMember m WHERE m.group.groupId = :groupId")
    void deleteByGroupId(@Param("groupId") Long groupId);
}

