package com.lms.openlms.controller;

import com.lms.openlms.dto.ChatDtos;
import com.lms.openlms.dto.CourseDto;
import com.lms.openlms.security.AuthUser;
import com.lms.openlms.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    // ---------------------------------------------------------
    // Teacher Group Management Endpoints
    // ---------------------------------------------------------

    @PostMapping("/groups")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ChatDtos.GroupResponse> createGroup(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody ChatDtos.CreateGroupRequest request) {
        ChatDtos.GroupResponse response = chatService.createGroup(user.userId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/groups/{groupId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ChatDtos.GroupResponse> updateGroup(
            @PathVariable Long groupId,
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody ChatDtos.UpdateGroupRequest request) {
        return ResponseEntity.ok(chatService.updateGroup(groupId, user.userId(), request));
    }

    @DeleteMapping("/groups/{groupId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Void> deleteGroup(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "false") boolean hardDelete,
            @AuthenticationPrincipal AuthUser user) {
        chatService.deleteOrArchiveGroup(groupId, user.userId(), hardDelete);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/groups/{groupId}/members")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<ChatDtos.GroupMemberResponse>> addMembers(
            @PathVariable Long groupId,
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody ChatDtos.AddMembersRequest request) {
        return ResponseEntity.ok(chatService.addMembers(groupId, user.userId(), request));
    }

    @DeleteMapping("/groups/{groupId}/members/{studentId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long groupId,
            @PathVariable Long studentId,
            @AuthenticationPrincipal AuthUser user) {
        chatService.removeMember(groupId, user.userId(), studentId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/groups/{groupId}/messages/{messageId}/pin")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ChatDtos.MessageResponse> pinMessage(
            @PathVariable Long groupId,
            @PathVariable Long messageId,
            @RequestBody(required = false) ChatDtos.PinMessageRequest request,
            @AuthenticationPrincipal AuthUser user) {
        boolean pin = request == null || request.getPinned() == null || request.getPinned();
        return ResponseEntity.ok(chatService.pinMessage(groupId, messageId, user.userId(), pin));
    }

    @GetMapping("/courses/{courseId}/students")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<CourseDto.StudentItem>> getCourseEnrolledStudents(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(chatService.getCourseEnrolledStudents(courseId, user.userId()));
    }

    // ---------------------------------------------------------
    // Shared / Role-Aware Endpoints (Teachers & Students)
    // ---------------------------------------------------------

    @GetMapping("/groups")
    public ResponseEntity<List<ChatDtos.GroupResponse>> getMyGroups(
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(chatService.getGroupsForUser(user));
    }

    @GetMapping("/groups/{groupId}")
    public ResponseEntity<ChatDtos.GroupResponse> getGroupDetails(
            @PathVariable Long groupId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(chatService.getGroupDetails(groupId, user));
    }

    @GetMapping("/groups/{groupId}/members")
    public ResponseEntity<List<ChatDtos.GroupMemberResponse>> getGroupMembers(
            @PathVariable Long groupId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(chatService.getGroupMembers(groupId, user));
    }

    @GetMapping("/groups/{groupId}/messages")
    public ResponseEntity<List<ChatDtos.MessageResponse>> getGroupMessages(
            @PathVariable Long groupId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(chatService.getGroupMessages(groupId, user));
    }

    @PostMapping("/groups/{groupId}/messages")
    public ResponseEntity<ChatDtos.MessageResponse> sendMessage(
            @PathVariable Long groupId,
            @Valid @RequestBody ChatDtos.SendMessageRequest request,
            @AuthenticationPrincipal AuthUser user) {
        ChatDtos.MessageResponse response = chatService.sendMessage(groupId, user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/groups/{groupId}/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable Long groupId,
            @PathVariable Long messageId,
            @AuthenticationPrincipal AuthUser user) {
        chatService.deleteMessage(groupId, messageId, user.userId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/groups/{groupId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long groupId,
            @AuthenticationPrincipal AuthUser user) {
        chatService.markGroupAsRead(groupId, user.userId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/groups/{groupId}/pinned")
    public ResponseEntity<List<ChatDtos.MessageResponse>> getPinnedMessages(
            @PathVariable Long groupId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(chatService.getPinnedMessages(groupId, user));
    }
}
