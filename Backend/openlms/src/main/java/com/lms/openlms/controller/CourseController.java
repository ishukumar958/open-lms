package com.lms.openlms.controller;

import com.lms.openlms.dto.CourseDto;
import com.lms.openlms.security.AuthUser;
import com.lms.openlms.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<CourseDto.CourseResponse> createCourse(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody CourseDto.CreateCourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.createCourse(user.userId(), request));
    }

    @GetMapping("/my")
    public ResponseEntity<List<CourseDto.CourseResponse>> listMyCourses(
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(courseService.listMyCourses(user));
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDto.CourseResponse> getCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(courseService.getCourse(courseId, user));
    }

    @PutMapping("/{courseId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<CourseDto.CourseResponse> updateCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody CourseDto.UpdateCourseRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, user.userId(), request));
    }

    @PostMapping("/join")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CourseDto.CourseResponse> joinCourse(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody CourseDto.JoinCourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.joinCourse(user.userId(), request));
    }

    @GetMapping("/{courseId}/students")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<CourseDto.StudentItem>> listCourseStudents(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(courseService.listCourseStudents(courseId, user.userId()));
    }

    @DeleteMapping("/{courseId}/students/{studentId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Void> removeStudent(
            @PathVariable Long courseId,
            @PathVariable Long studentId,
            @AuthenticationPrincipal AuthUser user) {
        courseService.removeStudent(courseId, studentId, user.userId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{courseId}/enrollment")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> leaveCourse(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user) {
        courseService.leaveCourse(courseId, user.userId());
        return ResponseEntity.noContent().build();
    }
}
