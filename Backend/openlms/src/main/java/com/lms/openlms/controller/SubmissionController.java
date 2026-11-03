package com.lms.openlms.controller;

import com.lms.openlms.dto.SubmissionDto.GradeRequest;
import com.lms.openlms.dto.SubmissionDto.SubmissionResponse;
import com.lms.openlms.dto.SubmissionDto.SubmitRequest;
import com.lms.openlms.security.AuthUser;
import com.lms.openlms.service.SubmissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    // S1 — POST /assignments/{assignmentId}/submissions (STUDENT) -> 201 first time, 200 on resubmit
    @PostMapping("/api/v1/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> submitAssignment(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal AuthUser user,
            @RequestBody SubmitRequest request) {
        SubmissionService.SubmitResult result = submissionService.submit(assignmentId, request, user.userId());
        HttpStatus status = result.isCreated() ? HttpStatus.CREATED : HttpStatus.OK;
        return ResponseEntity.status(status).body(result.getResponse());
    }

    // S2 — GET /assignments/{assignmentId}/submissions/me (STUDENT) -> 200
    @GetMapping("/api/v1/assignments/{assignmentId}/submissions/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionResponse> getMySubmission(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(submissionService.getMySubmissionForAssignment(assignmentId, user.userId()));
    }

    // S3 — GET /assignments/{assignmentId}/submissions (owner) -> 200
    @GetMapping("/api/v1/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<SubmissionResponse>> listSubmissionsForAssignment(
            @PathVariable Long assignmentId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(submissionService.getSubmissionsForAssignment(assignmentId, user.userId()));
    }

    // S4 — GET /submissions/my (STUDENT) -> 200
    @GetMapping("/api/v1/submissions/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<SubmissionResponse>> listMySubmissions(
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(submissionService.getMySubmissions(user.userId()));
    }

    // S5 — GET /submissions (FACULTY) -> 200
    @GetMapping("/api/v1/submissions")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<SubmissionResponse>> listGradingQueue(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long assignmentId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(submissionService.getGradingQueue(user.userId(), status, courseId, assignmentId));
    }

    // S6 — PATCH /submissions/{submissionId}/grade (owner) -> 200
    @PatchMapping("/api/v1/submissions/{submissionId}/grade")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<SubmissionResponse> gradeSubmission(
            @PathVariable Long submissionId,
            @AuthenticationPrincipal AuthUser user,
            @RequestBody GradeRequest request) {
        return ResponseEntity.ok(submissionService.grade(submissionId, request, user.userId()));
    }
}
