package com.lms.openlms.repository;

import com.lms.openlms.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByGroupGroupIdAndDeletedAtIsNullOrderByCreatedAtAsc(Long groupId);

    List<ChatMessage> findByGroupGroupIdAndDeletedAtIsNullOrderByCreatedAtDesc(Long groupId, Pageable pageable);

    List<ChatMessage> findByGroupGroupIdAndIsPinnedTrueAndDeletedAtIsNullOrderByPinnedAtDesc(Long groupId);

    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.group.groupId = :groupId AND m.deletedAt IS NULL AND m.createdAt > :afterTime")
    long countUnreadMessages(@Param("groupId") Long groupId, @Param("afterTime") LocalDateTime afterTime);

    @Query("SELECT m FROM ChatMessage m WHERE m.group.groupId = :groupId AND m.deletedAt IS NULL ORDER BY m.createdAt DESC LIMIT 1")
    Optional<ChatMessage> findLatestMessage(@Param("groupId") Long groupId);

    @Modifying
    @Query("DELETE FROM ChatMessage m WHERE m.group.groupId = :groupId")
    void deleteByGroupId(@Param("groupId") Long groupId);
}
