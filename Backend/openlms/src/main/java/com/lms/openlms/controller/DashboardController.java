package com.lms.openlms.controller;

import com.lms.openlms.dto.DashboardDto.ProfessorDashboardResponse;
import com.lms.openlms.dto.DashboardDto.StudentDashboardResponse;
import com.lms.openlms.security.AuthUser;
import com.lms.openlms.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // D1 — GET /dashboard/student (STUDENT) -> 200
    @GetMapping("/api/v1/dashboard/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentDashboardResponse> getStudentDashboard(
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(dashboardService.getStudentDashboard(user.userId()));
    }

    // D2 — GET /dashboard/professor (FACULTY) -> 200
    @GetMapping("/api/v1/dashboard/professor")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ProfessorDashboardResponse> getProfessorDashboard(
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(dashboardService.getProfessorDashboard(user.userId()));
    }
}
