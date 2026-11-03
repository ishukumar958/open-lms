package com.lms.openlms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "UP");
        res.put("service", "Open LMS Backend API");
        res.put("version", "1.0.0");
        res.put("timestamp", LocalDateTime.now().toString());
        res.put("healthCheck", "/api/v1/health");
        res.put("message", "Open LMS backend is running successfully");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "UP");
        res.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(res);
    }
}

