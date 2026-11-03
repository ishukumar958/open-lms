package com.lms.openlms.controller;

import com.lms.openlms.dto.ResourceDto;
import com.lms.openlms.security.AuthUser;
import com.lms.openlms.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // R1 — POST /courses/{courseId}/resources (owner) -> 201
    @PostMapping("/api/v1/courses/{courseId}/resources")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ResourceDto.ResourceResponse> createResource(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody ResourceDto.CreateResourceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.createResource(courseId, user.userId(), request));
    }

    // R2 — GET /courses/{courseId}/resources (member) -> 200
    @GetMapping("/api/v1/courses/{courseId}/resources")
    public ResponseEntity<List<ResourceDto.ResourceResponse>> listResources(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(resourceService.listResources(courseId, user));
    }

    // R3 — DELETE /resources/{resourceId} (owner) -> 204
    @DeleteMapping("/api/v1/resources/{resourceId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Void> deleteResource(
            @PathVariable Long resourceId,
            @AuthenticationPrincipal AuthUser user) {
        resourceService.deleteResource(resourceId, user.userId());
        return ResponseEntity.noContent().build();
    }
}
