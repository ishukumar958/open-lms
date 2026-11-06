package com.lms.openlms.service;

import com.lms.openlms.dto.ChatDtos;
import com.lms.openlms.dto.CourseDto;
import com.lms.openlms.entity.ChatGroup;
import com.lms.openlms.entity.ChatGroupMember;
import com.lms.openlms.entity.ChatMessage;
import com.lms.openlms.entity.Course;
import com.lms.openlms.entity.User;
import com.lms.openlms.exception.BadRequestException;
import com.lms.openlms.exception.ForbiddenException;
import com.lms.openlms.exception.ResourceNotFoundException;
import com.lms.openlms.repository.ChatGroupMemberRepository;
import com.lms.openlms.repository.ChatGroupRepository;
import com.lms.openlms.repository.ChatMessageRepository;
import com.lms.openlms.repository.CourseRepository;
import com.lms.openlms.repository.EnrollmentRepository;
import com.lms.openlms.repository.UserRepository;
import com.lms.openlms.security.AuthUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class ChatService {

    private final ChatGroupRepository chatGroupRepository;
    private final ChatGroupMemberRepository chatGroupMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final CourseAccessService courseAccessService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ChatService(ChatGroupRepository chatGroupRepository,
                       ChatGroupMemberRepository chatGroupMemberRepository,
                       ChatMessageRepository chatMessageRepository,
                       CourseRepository courseRepository,
                       EnrollmentRepository enrollmentRepository,
                       UserRepository userRepository,
                       CourseAccessService courseAccessService,
                       @Autowired(required = false) SimpMessagingTemplate messagingTemplate) {
        this.chatGroupRepository = chatGroupRepository;
        this.chatGroupMemberRepository = chatGroupMemberRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.courseAccessService = courseAccessService;
        this.messagingTemplate = messagingTemplate;
    }

    // -------------------------------------------------------------
    // TEACHER: Group Management
    // -------------------------------------------------------------

    public ChatDtos.GroupResponse createGroup(Long teacherId, ChatDtos.CreateGroupRequest request) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Validate teacher owns the course
        Course course = courseAccessService.requireOwner(request.getCourseId(), teacherId);

        ChatGroup group = new ChatGroup();
        group.setGroupName(request.getGroupName().trim());
        group.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        group.setCourse(course);
        group.setTeacher(teacher);
        group.setGroupImage(request.getGroupImage());
        group.setStatus("ACTIVE");

        ChatGroup savedGroup = chatGroupRepository.save(group);

        // Add enrolled students
        List<Long> studentIds = request.getStudentIds() != null ? request.getStudentIds() : Collections.emptyList();
        int addedCount = 0;
        for (Long studentId : studentIds) {
            if (!enrollmentRepository.existsByCourseCourseIdAndStudentUserId(course.getCourseId(), studentId)) {
                throw new BadRequestException("Student with ID " + studentId + " is not enrolled in course " + course.getCourseName());
            }

            User student = userRepository.findById(studentId).orElse(null);
            if (student != null) {
                ChatGroupMember member = new ChatGroupMember(savedGroup, student);
                chatGroupMemberRepository.save(member);
                addedCount++;
            }
        }

        // Create initial system message
        ChatMessage welcomeMsg = new ChatMessage(
                savedGroup,
                teacher,
                "Group created by " + teacher.getName() + " for course " + course.getCourseName() + ".",
                "SYSTEM"
        );
        chatMessageRepository.save(welcomeMsg);

        ChatDtos.GroupResponse response = toGroupResponse(savedGroup, teacherId, true);
        broadcastGroupUpdate(savedGroup.getGroupId(), "GROUP_CREATED", response);
        return response;
    }

    public ChatDtos.GroupResponse updateGroup(Long groupId, Long teacherId, ChatDtos.UpdateGroupRequest request) {
        ChatGroup group = requireTeacherOwner(groupId, teacherId);

        group.setGroupName(request.getGroupName().trim());
        if (request.getDescription() != null) {
            group.setDescription(request.getDescription().trim());
        }
        if (request.getGroupImage() != null) {
            group.setGroupImage(request.getGroupImage());
        }
        if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
            String status = request.getStatus().trim().toUpperCase(Locale.ROOT);
            if (List.of("ACTIVE", "ARCHIVED", "DELETED").contains(status)) {
                group.setStatus(status);
            }
        }
        group.setUpdatedAt(LocalDateTime.now());

        ChatGroup updated = chatGroupRepository.save(group);
        ChatDtos.GroupResponse response = toGroupResponse(updated, teacherId, true);
        broadcastGroupUpdate(groupId, "GROUP_UPDATED", response);
        return response;
    }

    public void deleteOrArchiveGroup(Long groupId, Long teacherId, boolean hardDelete) {
        ChatGroup group = requireTeacherOwner(groupId, teacherId);

        if (hardDelete) {
            chatMessageRepository.deleteByGroupId(groupId);
            chatGroupMemberRepository.deleteByGroupId(groupId);
            chatGroupRepository.delete(group);
        } else {
            group.setStatus("ARCHIVED");
            group.setUpdatedAt(LocalDateTime.now());
            chatGroupRepository.save(group);
        }

        broadcastGroupUpdate(groupId, "GROUP_DELETED", Map.of("groupId", groupId));
    }

    public List<ChatDtos.GroupMemberResponse> addMembers(Long groupId, Long teacherId, ChatDtos.AddMembersRequest request) {
        ChatGroup group = requireTeacherOwner(groupId, teacherId);
        Long courseId = group.getCourse().getCourseId();

        List<String> addedNames = new ArrayList<>();
        for (Long studentId : request.getStudentIds()) {
            if (!enrollmentRepository.existsByCourseCourseIdAndStudentUserId(courseId, studentId)) {
                throw new BadRequestException("Student with ID " + studentId + " is not enrolled in course " + group.getCourse().getCourseName());
            }

            if (!chatGroupMemberRepository.existsByGroupGroupIdAndStudentUserId(groupId, studentId)) {
                User student = userRepository.findById(studentId).orElse(null);
                if (student != null) {
                    ChatGroupMember member = new ChatGroupMember(group, student);
                    chatGroupMemberRepository.save(member);
                    addedNames.add(student.getName());
                }
            }
        }

        if (!addedNames.isEmpty()) {
            ChatMessage systemMsg = new ChatMessage(
                    group,
                    group.getTeacher(),
                    String.join(", ", addedNames) + " added to the group.",
                    "SYSTEM"
            );
            chatMessageRepository.save(systemMsg);
            broadcastMessage(toMessageResponse(systemMsg));
        }

        return getGroupMembers(groupId, new AuthUser(teacherId, group.getTeacher().getEmail(), "FACULTY"));
    }

    public void removeMember(Long groupId, Long teacherId, Long studentId) {
        ChatGroup group = requireTeacherOwner(groupId, teacherId);

        ChatGroupMember member = chatGroupMemberRepository.findByGroupGroupIdAndStudentUserId(groupId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student is not a member of this group"));

        String studentName = member.getStudent().getName();
        chatGroupMemberRepository.delete(member);

        ChatMessage systemMsg = new ChatMessage(
                group,
                group.getTeacher(),
                studentName + " was removed from the group.",
                "SYSTEM"
        );
        chatMessageRepository.save(systemMsg);
        broadcastMessage(toMessageResponse(systemMsg));
    }

    public ChatDtos.MessageResponse pinMessage(Long groupId, Long messageId, Long teacherId, boolean pin) {
        ChatGroup group = requireTeacherOwner(groupId, teacherId);
        User teacher = group.getTeacher();

        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getGroup().getGroupId().equals(groupId)) {
            throw new BadRequestException("Message does not belong to this group");
        }

        message.setIsPinned(pin);
        if (pin) {
            message.setPinnedAt(LocalDateTime.now());
            message.setPinnedBy(teacher);
        } else {
            message.setPinnedAt(null);
            message.setPinnedBy(null);
        }

        ChatMessage updated = chatMessageRepository.save(message);
        ChatDtos.MessageResponse response = toMessageResponse(updated);
        broadcastGroupUpdate(groupId, pin ? "MESSAGE_PINNED" : "MESSAGE_UNPINNED", response);
        return response;
    }

    @Transactional(readOnly = true)
    public List<CourseDto.StudentItem> getCourseEnrolledStudents(Long courseId, Long teacherId) {
        courseAccessService.requireOwner(courseId, teacherId);
        return enrollmentRepository.findByCourseCourseId(courseId).stream()
                .map(e -> e.getStudent())
                .filter(Objects::nonNull)
                .map(s -> new CourseDto.StudentItem(s.getUserId(), s.getName(), s.getEmail()))
                .sorted(Comparator.comparing(CourseDto.StudentItem::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    // -------------------------------------------------------------
    // SHARED / ROLE-AWARE: Query Groups & Messages
    // -------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ChatDtos.GroupResponse> getGroupsForUser(AuthUser user) {
        boolean isTeacher = "FACULTY".equalsIgnoreCase(user.role()) || "PROFESSOR".equalsIgnoreCase(user.role());

        if (isTeacher) {
            List<ChatGroup> teacherGroups = chatGroupRepository.findByTeacherUserIdAndStatusNotOrderByUpdatedAtDesc(
                    user.userId(), "DELETED"
            );
            return teacherGroups.stream()
                    .map(g -> toGroupResponse(g, user.userId(), true))
                    .toList();
        } else {
            List<ChatGroup> studentGroups = chatGroupRepository.findGroupsByStudentUserId(user.userId(), "DELETED");
            return studentGroups.stream()
                    .map(g -> toGroupResponse(g, user.userId(), false))
                    .toList();
        }
    }

    @Transactional(readOnly = true)
    public ChatDtos.GroupResponse getGroupDetails(Long groupId, AuthUser user) {
        ChatGroup group = requireAccess(groupId, user);
        boolean isTeacher = "FACULTY".equalsIgnoreCase(user.role()) || "PROFESSOR".equalsIgnoreCase(user.role());
        return toGroupResponse(group, user.userId(), isTeacher);
    }

    @Transactional(readOnly = true)
    public List<ChatDtos.GroupMemberResponse> getGroupMembers(Long groupId, AuthUser user) {
        ChatGroup group = requireAccess(groupId, user);

        List<ChatDtos.GroupMemberResponse> members = new ArrayList<>();
        // Teacher always leads the member list
        User teacher = group.getTeacher();
        members.add(new ChatDtos.GroupMemberResponse(
                teacher.getUserId(),
                teacher.getName(),
                teacher.getEmail(),
                "FACULTY",
                true,
                group.getCreatedAt()
        ));

        // Enrolled student members
        List<ChatGroupMember> groupMembers = chatGroupMemberRepository.findByGroupGroupId(groupId);
        for (ChatGroupMember gm : groupMembers) {
            User s = gm.getStudent();
            if (s != null) {
                members.add(new ChatDtos.GroupMemberResponse(
                        s.getUserId(),
                        s.getName(),
                        s.getEmail(),
                        "STUDENT",
                        false,
                        gm.getJoinedAt()
                ));
            }
        }

        return members;
    }

    @Transactional(readOnly = true)
    public List<ChatDtos.MessageResponse> getGroupMessages(Long groupId, AuthUser user) {
        requireAccess(groupId, user);
        List<ChatMessage> messages = chatMessageRepository.findByGroupGroupIdAndDeletedAtIsNullOrderByCreatedAtAsc(groupId);
        return messages.stream().map(this::toMessageResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ChatDtos.MessageResponse> getPinnedMessages(Long groupId, AuthUser user) {
        requireAccess(groupId, user);
        List<ChatMessage> pinned = chatMessageRepository.findByGroupGroupIdAndIsPinnedTrueAndDeletedAtIsNullOrderByPinnedAtDesc(groupId);
        return pinned.stream().map(this::toMessageResponse).toList();
    }

    public ChatDtos.MessageResponse sendMessage(Long groupId, AuthUser authUser, ChatDtos.SendMessageRequest request) {
        ChatGroup group = requireAccess(groupId, authUser);

        if ("ARCHIVED".equalsIgnoreCase(group.getStatus())) {
            throw new BadRequestException("This group has been archived and is read-only.");
        }

        User sender = userRepository.findById(authUser.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isTeacherSender = group.getTeacher().getUserId().equals(authUser.userId());
        String type = (request.getMessageType() != null && isTeacherSender)
                ? request.getMessageType().trim().toUpperCase(Locale.ROOT)
                : "TEXT";

        ChatMessage message = new ChatMessage(
                group,
                sender,
                request.getMessageContent().trim(),
                type
        );

        ChatMessage saved = chatMessageRepository.save(message);

        // Update group's last activity
        group.setUpdatedAt(LocalDateTime.now());
        chatGroupRepository.save(group);

        // If sender is student, update sender's last read timestamp
        if (!isTeacherSender) {
            chatGroupMemberRepository.findByGroupGroupIdAndStudentUserId(groupId, authUser.userId())
                    .ifPresent(m -> {
                        m.setLastReadAt(LocalDateTime.now());
                        chatGroupMemberRepository.save(m);
                    });
        }

        ChatDtos.MessageResponse response = toMessageResponse(saved);
        broadcastMessage(response);
        return response;
    }

    public void deleteMessage(Long groupId, Long messageId, Long deletingUserId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getGroup().getGroupId().equals(groupId)) {
            throw new BadRequestException("Message does not belong to this group");
        }

        if (!message.getSender().getUserId().equals(deletingUserId)) {
            throw new ForbiddenException("You can only delete your own messages");
        }

        chatMessageRepository.delete(message);
        broadcastGroupUpdate(groupId, "MESSAGE_DELETED", Map.of("messageId", messageId));
    }

    public void markGroupAsRead(Long groupId, Long studentId) {
        chatGroupMemberRepository.findByGroupGroupIdAndStudentUserId(groupId, studentId)
                .ifPresent(m -> {
                    m.setLastReadAt(LocalDateTime.now());
                    chatGroupMemberRepository.save(m);
                });
    }

    public void broadcastTyping(Long groupId, AuthUser user, boolean isTyping) {
        requireAccess(groupId, user);
        User sender = userRepository.findById(user.userId()).orElse(null);
        String name = sender != null ? sender.getName() : user.email();

        ChatDtos.TypingNotification notification = new ChatDtos.TypingNotification(groupId, user.userId(), name, isTyping);
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/groups." + groupId + ".typing", notification);
            } catch (Exception ignored) {}
        }
    }

    @Transactional
    public void deleteMessage(Long groupId, Long messageId, AuthUser user) {
        requireAccess(groupId, user);

        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (!message.getGroup().getGroupId().equals(groupId)) {
            throw new BadRequestException("Message does not belong to this group");
        }

        if (message.getDeletedAt() != null) {
            return;
        }

        boolean isTeacher = "FACULTY".equalsIgnoreCase(user.role()) || "PROFESSOR".equalsIgnoreCase(user.role());
        boolean isSender = message.getSender().getUserId().equals(user.userId());

        if (!isTeacher && !isSender) {
            throw new ForbiddenException("You can only delete your own messages");
        }

        message.setDeletedAt(LocalDateTime.now());
        chatMessageRepository.save(message);

        // Broadcast MESSAGE_DELETED to all group members
        Map<String, Object> payload = new HashMap<>();
        payload.put("messageId", messageId);
        payload.put("groupId", groupId);
        broadcastGroupUpdate(groupId, "MESSAGE_DELETED", payload);
    }

    // -------------------------------------------------------------
    // Helper Methods & Security Verification
    // -------------------------------------------------------------

    public ChatGroup requireTeacherOwner(Long groupId, Long teacherId) {
        ChatGroup group = chatGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if (!group.getTeacher().getUserId().equals(teacherId)) {
            throw new ForbiddenException("You do not have permission to manage this group");
        }

        return group;
    }

    public ChatGroup requireAccess(Long groupId, AuthUser user) {
        ChatGroup group = chatGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        if ("DELETED".equalsIgnoreCase(group.getStatus())) {
            throw new ResourceNotFoundException("Group not found");
        }

        boolean isTeacher = "FACULTY".equalsIgnoreCase(user.role()) || "PROFESSOR".equalsIgnoreCase(user.role());
        if (isTeacher) {
            if (!group.getTeacher().getUserId().equals(user.userId())) {
                throw new ForbiddenException("You do not have permission to access this group");
            }
        } else {
            boolean isMember = chatGroupMemberRepository.existsByGroupGroupIdAndStudentUserId(groupId, user.userId());
            if (!isMember) {
                throw new ForbiddenException("You are not an enrolled member of this group");
            }
        }

        return group;
    }

    private void broadcastMessage(ChatDtos.MessageResponse response) {
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/groups." + response.getGroupId(), response);
            } catch (Exception ignored) {}
        }
    }

    private void broadcastGroupUpdate(Long groupId, String eventType, Object payload) {
        if (messagingTemplate != null) {
            try {
                Map<String, Object> event = new HashMap<>();
                event.put("event", eventType);
                event.put("groupId", groupId);
                event.put("data", payload);
                messagingTemplate.convertAndSend("/topic/groups." + groupId, (Object) event);
            } catch (Exception ignored) {}
        }
    }

    private ChatDtos.GroupResponse toGroupResponse(ChatGroup group, Long currentUserId, boolean isTeacher) {
        long memberCount = chatGroupMemberRepository.countByGroupGroupId(group.getGroupId()) + 1; // +1 for teacher

        long unreadCount = 0;
        if (!isTeacher) {
            Optional<ChatGroupMember> memberOpt = chatGroupMemberRepository.findByGroupGroupIdAndStudentUserId(group.getGroupId(), currentUserId);
            if (memberOpt.isPresent()) {
                LocalDateTime lastRead = memberOpt.get().getLastReadAt();
                unreadCount = chatMessageRepository.countUnreadMessages(group.getGroupId(), lastRead != null ? lastRead : LocalDateTime.MIN);
            }
        }

        Optional<ChatMessage> latestMsgOpt = chatMessageRepository.findLatestMessage(group.getGroupId());
        ChatDtos.LastMessageSummary lastMsg = null;
        if (latestMsgOpt.isPresent()) {
            ChatMessage lm = latestMsgOpt.get();
            lastMsg = new ChatDtos.LastMessageSummary(
                    lm.getMessageId(),
                    lm.getSender().getUserId(),
                    lm.getSender().getName(),
                    lm.getSender().getRole() != null ? lm.getSender().getRole().getRoleName() : "USER",
                    lm.getMessageContent(),
                    lm.getCreatedAt()
            );
        }

        Course course = group.getCourse();
        User teacher = group.getTeacher();

        ChatDtos.GroupResponse res = new ChatDtos.GroupResponse();
        res.setGroupId(group.getGroupId());
        res.setGroupName(group.getGroupName());
        res.setDescription(group.getDescription());
        res.setGroupImage(group.getGroupImage());
        res.setStatus(group.getStatus());
        res.setCourseId(course != null ? course.getCourseId() : null);
        res.setCourseName(course != null ? course.getCourseName() : null);
        res.setCourseCode(course != null ? course.getCourseCode() : null);
        res.setSection(course != null ? course.getSection() : null);
        res.setTeacherId(teacher != null ? teacher.getUserId() : null);
        res.setTeacherName(teacher != null ? teacher.getName() : null);
        res.setMemberCount(memberCount);
        res.setUnreadCount(unreadCount);
        res.setLastMessage(lastMsg);
        res.setCreatedAt(group.getCreatedAt());
        res.setUpdatedAt(group.getUpdatedAt());
        res.setTeacherOwner(teacher != null && teacher.getUserId().equals(currentUserId));
        return res;
    }

    private ChatDtos.MessageResponse toMessageResponse(ChatMessage m) {
        User sender = m.getSender();
        ChatGroup group = m.getGroup();
        boolean isTeacherSender = group != null && group.getTeacher() != null &&
                sender != null && group.getTeacher().getUserId().equals(sender.getUserId());

        ChatDtos.MessageResponse r = new ChatDtos.MessageResponse();
        r.setMessageId(m.getMessageId());
        r.setGroupId(group != null ? group.getGroupId() : null);
        r.setSenderId(sender != null ? sender.getUserId() : null);
        r.setSenderName(sender != null ? sender.getName() : "Unknown");
        r.setSenderRole(isTeacherSender ? "FACULTY" : "STUDENT");
        r.setTeacherSender(isTeacherSender);
        r.setMessageContent(m.getMessageContent());
        r.setMessageType(m.getMessageType());
        r.setIsPinned(Boolean.TRUE.equals(m.getIsPinned()));
        r.setPinnedAt(m.getPinnedAt());
        r.setPinnedByName(m.getPinnedBy() != null ? m.getPinnedBy().getName() : null);
        r.setCreatedAt(m.getCreatedAt());
        return r;
    }
}
