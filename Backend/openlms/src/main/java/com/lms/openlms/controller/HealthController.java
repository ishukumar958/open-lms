package com.lms.openlms.controller;

import com.cloudinary.Cloudinary;
import com.lms.openlms.repository.*;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AssignmentRepository assignmentRepository;
    private final QuizRepository quizRepository;
    private final SubmissionRepository submissionRepository;
    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:${CLOUDINARY_CLOUD_NAME:}}")
    private String cloudinaryCloudName;

    public HealthController(JdbcTemplate jdbcTemplate,
                            UserRepository userRepository,
                            CourseRepository courseRepository,
                            AssignmentRepository assignmentRepository,
                            QuizRepository quizRepository,
                            SubmissionRepository submissionRepository,
                            ObjectProvider<Cloudinary> cloudinaryProvider) {
        this.jdbcTemplate = jdbcTemplate;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.assignmentRepository = assignmentRepository;
        this.quizRepository = quizRepository;
        this.submissionRepository = submissionRepository;
        this.cloudinary = cloudinaryProvider.getIfAvailable();
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "open-lms-backend");
        response.put("version", "1.0.0");

        // 1. Database check
        Map<String, Object> dbHealth = new LinkedHashMap<>();
        long start = System.currentTimeMillis();
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            long latency = System.currentTimeMillis() - start;
            dbHealth.put("status", result != null && result == 1 ? "UP" : "DOWN");
            dbHealth.put("latencyMs", latency);

            Map<String, Long> counts = new LinkedHashMap<>();
            counts.put("users", userRepository.count());
            counts.put("courses", courseRepository.count());
            counts.put("assignments", assignmentRepository.count());
            counts.put("quizzes", quizRepository.count());
            counts.put("submissions", submissionRepository.count());
            dbHealth.put("counts", counts);
        } catch (Exception e) {
            dbHealth.put("status", "DOWN");
            dbHealth.put("error", e.getMessage());
        }
        response.put("database", dbHealth);

        // 2. Cloudinary check
        Map<String, Object> cloudHealth = new LinkedHashMap<>();
        boolean cloudConfigured = cloudinary != null && cloudinaryCloudName != null && !cloudinaryCloudName.trim().isEmpty();
        cloudHealth.put("configured", cloudConfigured);
        if (cloudConfigured) {
            String maskedName = cloudinaryCloudName.length() > 3
                    ? cloudinaryCloudName.substring(0, 3) + "***"
                    : "***";
            cloudHealth.put("cloudName", maskedName);
            cloudHealth.put("status", "READY");
        } else {
            cloudHealth.put("status", "UNCONFIGURED");
        }
        response.put("fileStorage", cloudHealth);

        // 3. Registered API modules
        Map<String, String> apis = new LinkedHashMap<>();
        apis.put("auth", "/api/v1/auth [register, login, me]");
        apis.put("courses", "/api/v1/courses [CRUD, join, leave, roster]");
        apis.put("assignments", "/api/v1/assignments [CRUD, my, list]");
        apis.put("submissions", "/api/v1/submissions [submit, grading queue, grade]");
        apis.put("quizzes", "/api/v1/quizzes [CRUD, start, submit, attempts]");
        apis.put("resources", "/api/v1/courses/{id}/resources [upload, list, delete]");
        apis.put("dashboard", "/api/v1/dashboard [student, professor]");
        apis.put("gradebook", "/api/v1/courses/{id}/gradebook [full matrix, student view]");
        apis.put("files", "/api/v1/files/upload [multipart Cloudinary upload]");
        response.put("endpoints", apis);

        return ResponseEntity.ok(response);
    }
}
