package com.lms.openlms.controller;

import com.lms.openlms.dto.GradebookDto.GradebookResponse;
import com.lms.openlms.dto.GradebookDto.StudentGradesResponse;
import com.lms.openlms.security.AuthUser;
import com.lms.openlms.service.GradebookService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/courses/{courseId}")
public class GradebookController {

    private final GradebookService gradebookService;

    public GradebookController(GradebookService gradebookService) {
        this.gradebookService = gradebookService;
    }

    // G1 — GET /courses/{courseId}/gradebook (FACULTY owner or admin only) -> 200
    @GetMapping("/gradebook")
    public ResponseEntity<GradebookResponse> getCourseGradebook(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(gradebookService.getCourseGradebook(courseId, user));
    }

    // G2 — GET /courses/{courseId}/grades/me (enrolled student only) -> 200
    @GetMapping("/grades/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentGradesResponse> getMyCourseGrades(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(gradebookService.getMyCourseGrades(courseId, user.userId()));
    }
}
