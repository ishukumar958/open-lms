package com.lms.openlms.security;

public record AuthUser(Long userId, String email, String role) {}
