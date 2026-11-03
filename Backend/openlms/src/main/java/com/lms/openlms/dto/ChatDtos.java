package com.lms.openlms.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

public class ChatDtos {

    public static class CreateGroupRequest {
        @NotBlank(message = "Group name is required")
        @Size(max = 150, message = "Group name cannot exceed 150 characters")
        private String groupName;

        private String description;

        @NotNull(message = "Course ID is required")
        private Long courseId;

        private List<Long> studentIds;

        private String groupImage;

        public CreateGroupRequest() {}

        public String getGroupName() {
            return groupName;
        }

        public void setGroupName(String groupName) {
            this.groupName = groupName;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public Long getCourseId() {
            return courseId;
        }

        public void setCourseId(Long courseId) {
            this.courseId = courseId;
        }

        public List<Long> getStudentIds() {
            return studentIds;
        }

        public void setStudentIds(List<Long> studentIds) {
            this.studentIds = studentIds;
        }

        public String getGroupImage() {
            return groupImage;
        }

        public void setGroupImage(String groupImage) {
            this.groupImage = groupImage;
        }
    }

    public static class UpdateGroupRequest {
        @NotBlank(message = "Group name is required")
        @Size(max = 150, message = "Group name cannot exceed 150 characters")
        private String groupName;

        private String description;

        private String groupImage;

        private String status;

        public UpdateGroupRequest() {}

        public String getGroupName() {
            return groupName;
        }

        public void setGroupName(String groupName) {
            this.groupName = groupName;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getGroupImage() {
            return groupImage;
        }

        public void setGroupImage(String groupImage) {
            this.groupImage = groupImage;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }

    public static class AddMembersRequest {
        @NotNull(message = "Student IDs cannot be null")
        @NotEmpty(message = "At least one student must be selected")
        private List<Long> studentIds;

        public AddMembersRequest() {}

        public List<Long> getStudentIds() {
            return studentIds;
        }

        public void setStudentIds(List<Long> studentIds) {
            this.studentIds = studentIds;
        }
    }

    public static class SendMessageRequest {
        @NotBlank(message = "Message content cannot be blank")
        private String messageContent;

        private String messageType; // TEXT, ANNOUNCEMENT

        public SendMessageRequest() {}

        public SendMessageRequest(String messageContent, String messageType) {
            this.messageContent = messageContent;
            this.messageType = messageType;
        }

        public String getMessageContent() {
            return messageContent;
        }

        public void setMessageContent(String messageContent) {
            this.messageContent = messageContent;
        }

        public String getMessageType() {
            return messageType;
        }

        public void setMessageType(String messageType) {
            this.messageType = messageType;
        }
    }

    public static class PinMessageRequest {
        private Boolean pinned;

        public PinMessageRequest() {}

        public PinMessageRequest(Boolean pinned) {
            this.pinned = pinned;
        }

        public Boolean getPinned() {
            return pinned;
        }

        public void setPinned(Boolean pinned) {
            this.pinned = pinned;
        }
    }

    public static class LastMessageSummary {
        private Long messageId;
        private Long senderId;
        private String senderName;
        private String senderRole;
        private String messageContent;
        private LocalDateTime createdAt;

        public LastMessageSummary() {}

        public LastMessageSummary(Long messageId, Long senderId, String senderName, String senderRole, String messageContent, LocalDateTime createdAt) {
            this.messageId = messageId;
            this.senderId = senderId;
            this.senderName = senderName;
            this.senderRole = senderRole;
            this.messageContent = messageContent;
            this.createdAt = createdAt;
        }

        public Long getMessageId() { return messageId; }
        public void setMessageId(Long messageId) { this.messageId = messageId; }
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        public String getSenderRole() { return senderRole; }
        public void setSenderRole(String senderRole) { this.senderRole = senderRole; }
        public String getMessageContent() { return messageContent; }
        public void setMessageContent(String messageContent) { this.messageContent = messageContent; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class GroupResponse {
        private Long groupId;
        private String groupName;
        private String description;
        private String groupImage;
        private String status;
        private Long courseId;
        private String courseName;
        private String courseCode;
        private String section;
        private Long teacherId;
        private String teacherName;
        private long memberCount;
        private long unreadCount;
        private LastMessageSummary lastMessage;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private boolean isTeacherOwner;

        public GroupResponse() {}

        public Long getGroupId() { return groupId; }
        public void setGroupId(Long groupId) { this.groupId = groupId; }
        public String getGroupName() { return groupName; }
        public void setGroupName(String groupName) { this.groupName = groupName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getGroupImage() { return groupImage; }
        public void setGroupImage(String groupImage) { this.groupImage = groupImage; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }
        public String getCourseName() { return courseName; }
        public void setCourseName(String courseName) { this.courseName = courseName; }
        public String getCourseCode() { return courseCode; }
        public void setCourseCode(String courseCode) { this.courseCode = courseCode; }
        public String getSection() { return section; }
        public void setSection(String section) { this.section = section; }
        public Long getTeacherId() { return teacherId; }
        public void setTeacherId(Long teacherId) { this.teacherId = teacherId; }
        public String getTeacherName() { return teacherName; }
        public void setTeacherName(String teacherName) { this.teacherName = teacherName; }
        public long getMemberCount() { return memberCount; }
        public void setMemberCount(long memberCount) { this.memberCount = memberCount; }
        public long getUnreadCount() { return unreadCount; }
        public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
        public LastMessageSummary getLastMessage() { return lastMessage; }
        public void setLastMessage(LastMessageSummary lastMessage) { this.lastMessage = lastMessage; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
        public boolean isTeacherOwner() { return isTeacherOwner; }
        public void setTeacherOwner(boolean teacherOwner) { this.isTeacherOwner = teacherOwner; }
    }

    public static class GroupMemberResponse {
        private Long userId;
        private String name;
        private String email;
        private String role;
        private boolean isTeacher;
        private LocalDateTime joinedAt;

        public GroupMemberResponse() {}

        public GroupMemberResponse(Long userId, String name, String email, String role, boolean isTeacher, LocalDateTime joinedAt) {
            this.userId = userId;
            this.name = name;
            this.email = email;
            this.role = role;
            this.isTeacher = isTeacher;
            this.joinedAt = joinedAt;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public boolean isTeacher() { return isTeacher; }
        public void setTeacher(boolean teacher) { this.isTeacher = teacher; }
        public LocalDateTime getJoinedAt() { return joinedAt; }
        public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
    }

    public static class MessageResponse {
        private Long messageId;
        private Long groupId;
        private Long senderId;
        private String senderName;
        private String senderRole;
        private boolean isTeacherSender;
        private String messageContent;
        private String messageType;
        private boolean isPinned;
        private LocalDateTime pinnedAt;
        private String pinnedByName;
        private LocalDateTime createdAt;

        public MessageResponse() {}

        public Long getMessageId() { return messageId; }
        public void setMessageId(Long messageId) { this.messageId = messageId; }
        public Long getGroupId() { return groupId; }
        public void setGroupId(Long groupId) { this.groupId = groupId; }
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        public String getSenderRole() { return senderRole; }
        public void setSenderRole(String senderRole) { this.senderRole = senderRole; }
        public boolean isTeacherSender() { return isTeacherSender; }
        public void setTeacherSender(boolean teacherSender) { this.isTeacherSender = teacherSender; }
        public String getMessageContent() { return messageContent; }
        public void setMessageContent(String messageContent) { this.messageContent = messageContent; }
        public String getMessageType() { return messageType; }
        public void setMessageType(String messageType) { this.messageType = messageType; }
        public boolean isPinned() { return isPinned; }
        public void setPinned(boolean pinned) { this.isPinned = pinned; }
        public void setIsPinned(boolean isPinned) { this.isPinned = isPinned; }
        public LocalDateTime getPinnedAt() { return pinnedAt; }
        public void setPinnedAt(LocalDateTime pinnedAt) { this.pinnedAt = pinnedAt; }
        public String getPinnedByName() { return pinnedByName; }
        public void setPinnedByName(String pinnedByName) { this.pinnedByName = pinnedByName; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class TypingNotification {
        private Long groupId;
        private Long userId;
        private String userName;
        private boolean isTyping;

        public TypingNotification() {}

        public TypingNotification(Long groupId, Long userId, String userName, boolean isTyping) {
            this.groupId = groupId;
            this.userId = userId;
            this.userName = userName;
            this.isTyping = isTyping;
        }

        public Long getGroupId() { return groupId; }
        public void setGroupId(Long groupId) { this.groupId = groupId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public boolean isTyping() { return isTyping; }
        public void setTyping(boolean typing) { this.isTyping = typing; }
    }
}
