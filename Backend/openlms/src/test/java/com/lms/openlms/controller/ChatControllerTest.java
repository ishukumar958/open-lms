package com.lms.openlms.controller;

import com.lms.openlms.dto.ChatDtos;
import com.lms.openlms.dto.CourseDto;
import com.lms.openlms.security.AuthUser;
import com.lms.openlms.service.ChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private ChatService chatService;

    @InjectMocks
    private ChatController chatController;

    private AuthUser facultyUser;
    private AuthUser studentUser;

    @BeforeEach
    void setUp() {
        facultyUser = new AuthUser(10L, "priya@geu.edu", "FACULTY");
        studentUser = new AuthUser(20L, "rahul@geu.edu", "STUDENT");
    }

    @Test
    void createGroup_CallsService_ReturnsCreated() {
        ChatDtos.CreateGroupRequest req = new ChatDtos.CreateGroupRequest();
        req.setGroupName("Algorithms Study Group");
        req.setCourseId(100L);

        ChatDtos.GroupResponse expectedResponse = new ChatDtos.GroupResponse();
        expectedResponse.setGroupId(1L);
        expectedResponse.setGroupName("Algorithms Study Group");

        when(chatService.createGroup(eq(10L), any(ChatDtos.CreateGroupRequest.class))).thenReturn(expectedResponse);

        ResponseEntity<ChatDtos.GroupResponse> response = chatController.createGroup(facultyUser, req);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1L, response.getBody().getGroupId());
        verify(chatService).createGroup(10L, req);
    }

    @Test
    void getMyGroups_CallsService_ReturnsList() {
        ChatDtos.GroupResponse grp = new ChatDtos.GroupResponse();
        grp.setGroupId(1L);
        when(chatService.getGroupsForUser(studentUser)).thenReturn(List.of(grp));

        ResponseEntity<List<ChatDtos.GroupResponse>> response = chatController.getMyGroups(studentUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        verify(chatService).getGroupsForUser(studentUser);
    }

    @Test
    void sendMessage_CallsService_ReturnsCreated() {
        ChatDtos.SendMessageRequest req = new ChatDtos.SendMessageRequest("Hello group!", "TEXT");
        ChatDtos.MessageResponse msgResponse = new ChatDtos.MessageResponse();
        msgResponse.setMessageId(55L);
        msgResponse.setMessageContent("Hello group!");

        when(chatService.sendMessage(eq(1L), eq(studentUser), any(ChatDtos.SendMessageRequest.class)))
                .thenReturn(msgResponse);

        ResponseEntity<ChatDtos.MessageResponse> response = chatController.sendMessage(1L, req, studentUser);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(55L, response.getBody().getMessageId());
        verify(chatService).sendMessage(1L, studentUser, req);
    }

    @Test
    void pinMessage_CallsService_ReturnsOk() {
        ChatDtos.PinMessageRequest pinReq = new ChatDtos.PinMessageRequest(true);
        ChatDtos.MessageResponse msgResponse = new ChatDtos.MessageResponse();
        msgResponse.setMessageId(10L);
        msgResponse.setIsPinned(true);

        when(chatService.pinMessage(1L, 10L, 10L, true)).thenReturn(msgResponse);

        ResponseEntity<ChatDtos.MessageResponse> response = chatController.pinMessage(1L, 10L, pinReq, facultyUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isPinned());
        verify(chatService).pinMessage(1L, 10L, 10L, true);
    }

    @Test
    void removeMember_CallsService_ReturnsNoContent() {
        doNothing().when(chatService).removeMember(1L, 10L, 20L);

        ResponseEntity<Void> response = chatController.removeMember(1L, 20L, facultyUser);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(chatService).removeMember(1L, 10L, 20L);
    }

    @Test
    void getCourseEnrolledStudents_CallsService_ReturnsList() {
        CourseDto.StudentItem studentItem = new CourseDto.StudentItem(20L, "Rahul Sharma", "rahul@geu.edu");
        when(chatService.getCourseEnrolledStudents(100L, 10L)).thenReturn(List.of(studentItem));

        ResponseEntity<List<CourseDto.StudentItem>> response = chatController.getCourseEnrolledStudents(100L, facultyUser);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        assertEquals("Rahul Sharma", response.getBody().get(0).getName());
    }
}
