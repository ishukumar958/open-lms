package com.lms.openlms.controller;

import com.lms.openlms.dto.AssignmentDto;
import com.lms.openlms.security.AuthUser;
import com.lms.openlms.service.AssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping("/api/v1/courses/{courseId}/assignments")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<AssignmentDto.AssignmentResponse> createAssignment(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody AssignmentDto.CreateAssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assignmentService.createAssignment(courseId, user.userId(), request));
    }

    // AS2 — GET /courses/{courseId}/assignments (member) -> 200
    @GetMapping("/api/v1/courses/{courseId}/assignments")
    public ResponseEntity<List<AssignmentDto.AssignmentResponse>> listCourseAssignments(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(assignmentService.listCourseAssignments(courseId, user));
    }

    // AS3 — GET /assignments/my (STUDENT) -> 200
    @GetMapping("/api/v1/assignments/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<AssignmentDto.AssignmentResponse>> listMyAssignments(
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(assignmentService.listMyAssignments(user.userId(), user));
    }

    // AS4 — GET /assignments/{assignmentId} (member) -> 200
    @GetMapping("/api/v1/assignments/{assignmentId}")
    public ResponseEntity<AssignmentDto.AssignmentResponse> getAssignment(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(assignmentService.getAssignment(assignmentId, user));
    }

    // AS5 — PUT /assignments/{assignmentId} (owner) -> 200
    @PutMapping("/api/v1/assignments/{assignmentId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<AssignmentDto.AssignmentResponse> updateAssignment(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody AssignmentDto.UpdateAssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.updateAssignment(assignmentId, user.userId(), request));
    }

    // AS6 — DELETE /assignments/{assignmentId} (owner) -> 204
    @DeleteMapping("/api/v1/assignments/{assignmentId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal AuthUser user) {
        assignmentService.deleteAssignment(assignmentId, user.userId());
        return ResponseEntity.noContent().build();
    }
}