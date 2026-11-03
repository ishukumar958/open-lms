package com.lms.openlms.controller;

import com.lms.openlms.dto.QuizDto.*;
import com.lms.openlms.security.AuthUser;
import com.lms.openlms.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // Q1 — POST /courses/{courseId}/quizzes (owner) -> 201
    @PostMapping("/api/v1/courses/{courseId}/quizzes")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<QuizResponse> createQuiz(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user,
            @RequestBody CreateQuizRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quizService.createQuiz(courseId, user.userId(), request));
    }

    // Q2 — GET /courses/{courseId}/quizzes (member) -> 200
    @GetMapping("/api/v1/courses/{courseId}/quizzes")
    public ResponseEntity<List<QuizResponse>> listCourseQuizzes(
            @PathVariable Long courseId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(quizService.listCourseQuizzes(courseId, user));
    }

    // Q3 — GET /quizzes/{quizId} (member) -> 200
    @GetMapping("/api/v1/quizzes/{quizId}")
    public ResponseEntity<QuizResponse> getQuiz(
            @PathVariable Long quizId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(quizService.getQuiz(quizId, user));
    }

    // Q4 — DELETE /quizzes/{quizId} (owner) -> 204
    @DeleteMapping("/api/v1/quizzes/{quizId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<Void> deleteQuiz(
            @PathVariable Long quizId,
            @AuthenticationPrincipal AuthUser user) {
        quizService.deleteQuiz(quizId, user.userId());
        return ResponseEntity.noContent().build();
    }

    // Q5 — POST /quizzes/{quizId}/attempts/start (STUDENT) -> 200
    @PostMapping("/api/v1/quizzes/{quizId}/attempts/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StartAttemptResponse> startAttempt(
            @PathVariable Long quizId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(quizService.startAttempt(quizId, user.userId()));
    }

    // Q6 — POST /quizzes/{quizId}/attempts/submit (STUDENT) -> 200
    @PostMapping("/api/v1/quizzes/{quizId}/attempts/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AttemptResultResponse> submitAttempt(
            @PathVariable Long quizId,
            @AuthenticationPrincipal AuthUser user,
            @RequestBody SubmitAttemptRequest request) {
        return ResponseEntity.ok(quizService.submitAttempt(quizId, user.userId(), request));
    }

    // Q7 — GET /quizzes/{quizId}/attempts/me (STUDENT) -> 200
    @GetMapping("/api/v1/quizzes/{quizId}/attempts/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<AttemptResultResponse> getMyAttempt(
            @PathVariable Long quizId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(quizService.getMyAttempt(quizId, user.userId()));
    }

    // Q8 — GET /quizzes/{quizId}/attempts (owner) -> 200
    @GetMapping("/api/v1/quizzes/{quizId}/attempts")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<List<QuizAttemptListItem>> listQuizAttempts(
            @PathVariable Long quizId,
            @AuthenticationPrincipal AuthUser user) {
        return ResponseEntity.ok(quizService.listQuizAttempts(quizId, user.userId()));
    }
}
