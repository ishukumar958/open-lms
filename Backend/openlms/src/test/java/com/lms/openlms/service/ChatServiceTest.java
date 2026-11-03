package com.lms.openlms.service;

import com.lms.openlms.dto.ChatDtos;
import com.lms.openlms.entity.ChatGroup;
import com.lms.openlms.entity.ChatGroupMember;
import com.lms.openlms.entity.ChatMessage;
import com.lms.openlms.entity.Course;
import com.lms.openlms.entity.Role;
import com.lms.openlms.entity.User;
import com.lms.openlms.exception.BadRequestException;
import com.lms.openlms.exception.ForbiddenException;
import com.lms.openlms.repository.ChatGroupMemberRepository;
import com.lms.openlms.repository.ChatGroupRepository;
import com.lms.openlms.repository.ChatMessageRepository;
import com.lms.openlms.repository.CourseRepository;
import com.lms.openlms.repository.EnrollmentRepository;
import com.lms.openlms.repository.UserRepository;
import com.lms.openlms.security.AuthUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private ChatGroupRepository chatGroupRepository;

    @Mock
    private ChatGroupMemberRepository chatGroupMemberRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseAccessService courseAccessService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatService chatService;

    private User teacher;
    private User student1;
    private User student2;
    private Course course;
    private ChatGroup group;

    @BeforeEach
    void setUp() {
        Role facultyRole = new Role(2L, "FACULTY");
        Role studentRole = new Role(1L, "STUDENT");

        teacher = new User(10L, "Prof. Sharma", "priya@geu.edu", "hash", facultyRole, true);
        student1 = new User(20L, "Rahul", "rahul@geu.edu", "hash", studentRole, true);
        student2 = new User(21L, "Neha", "neha@geu.edu", "hash", studentRole, true);

        course = new Course(100L, "Algorithms", "CS-301", teacher);

        group = new ChatGroup("DSA Group", "Study Group", course, teacher, null);
        group.setGroupId(1L);
    }

    @Test
    void createGroup_WithEnrolledStudents_Success() {
        ChatDtos.CreateGroupRequest req = new ChatDtos.CreateGroupRequest();
        req.setGroupName("DSA Group");
        req.setDescription("Study Group");
        req.setCourseId(100L);
        req.setStudentIds(List.of(20L));

        when(userRepository.findById(10L)).thenReturn(Optional.of(teacher));
        when(courseAccessService.requireOwner(100L, 10L)).thenReturn(course);
        when(enrollmentRepository.existsByCourseCourseIdAndStudentUserId(100L, 20L)).thenReturn(true);
        when(userRepository.findById(20L)).thenReturn(Optional.of(student1));
        when(chatGroupRepository.save(any(ChatGroup.class))).thenAnswer(i -> {
            ChatGroup g = i.getArgument(0);
            g.setGroupId(1L);
            return g;
        });

        ChatDtos.GroupResponse res = chatService.createGroup(10L, req);

        assertNotNull(res);
        assertEquals("DSA Group", res.getGroupName());
        verify(chatGroupMemberRepository).save(any(ChatGroupMember.class));
        verify(chatMessageRepository).save(any(ChatMessage.class));
    }

    @Test
    void createGroup_WithUnenrolledStudent_ThrowsBadRequest() {
        ChatDtos.CreateGroupRequest req = new ChatDtos.CreateGroupRequest();
        req.setGroupName("DSA Group");
        req.setCourseId(100L);
        req.setStudentIds(List.of(999L));

        when(userRepository.findById(10L)).thenReturn(Optional.of(teacher));
        when(courseAccessService.requireOwner(100L, 10L)).thenReturn(course);
        when(chatGroupRepository.save(any(ChatGroup.class))).thenReturn(group);
        when(enrollmentRepository.existsByCourseCourseIdAndStudentUserId(100L, 999L)).thenReturn(false);

        assertThrows(BadRequestException.class, () -> chatService.createGroup(10L, req));
    }

    @Test
    void requireAccess_EnrolledStudent_Success() {
        AuthUser studentAuth = new AuthUser(20L, "rahul@geu.edu", "STUDENT");
        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(chatGroupMemberRepository.existsByGroupGroupIdAndStudentUserId(1L, 20L)).thenReturn(true);

        ChatGroup result = chatService.requireAccess(1L, studentAuth);
        assertNotNull(result);
    }

    @Test
    void requireAccess_NonMemberStudent_ThrowsForbidden() {
        AuthUser strangerAuth = new AuthUser(99L, "stranger@geu.edu", "STUDENT");
        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(chatGroupMemberRepository.existsByGroupGroupIdAndStudentUserId(1L, 99L)).thenReturn(false);

        assertThrows(ForbiddenException.class, () -> chatService.requireAccess(1L, strangerAuth));
    }

    @Test
    void sendMessage_EnrolledStudent_Success() {
        AuthUser studentAuth = new AuthUser(20L, "rahul@geu.edu", "STUDENT");
        ChatDtos.SendMessageRequest req = new ChatDtos.SendMessageRequest("Hello Professor", "TEXT");

        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(chatGroupMemberRepository.existsByGroupGroupIdAndStudentUserId(1L, 20L)).thenReturn(true);
        when(userRepository.findById(20L)).thenReturn(Optional.of(student1));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(i -> {
            ChatMessage m = i.getArgument(0);
            m.setMessageId(101L);
            return m;
        });

        ChatDtos.MessageResponse res = chatService.sendMessage(1L, studentAuth, req);

        assertNotNull(res);
        assertEquals("Hello Professor", res.getMessageContent());
        assertEquals(20L, res.getSenderId());
        assertFalse(res.isTeacherSender());
    }

    @Test
    void pinMessage_ByTeacher_Success() {
        ChatMessage message = new ChatMessage(group, student1, "Important notice", "TEXT");
        message.setMessageId(50L);

        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(chatMessageRepository.findById(50L)).thenReturn(Optional.of(message));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(message);

        ChatDtos.MessageResponse res = chatService.pinMessage(1L, 50L, 10L, true);

        assertNotNull(res);
        assertTrue(res.isPinned());
    }

    @Test
    void removeMember_ByTeacher_DeletesMember() {
        ChatGroupMember member = new ChatGroupMember(group, student1);
        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(group));
        when(chatGroupMemberRepository.findByGroupGroupIdAndStudentUserId(1L, 20L)).thenReturn(Optional.of(member));

        chatService.removeMember(1L, 10L, 20L);

        verify(chatGroupMemberRepository).delete(member);
        verify(chatMessageRepository).save(any(ChatMessage.class)); // System message saved
    }
}
