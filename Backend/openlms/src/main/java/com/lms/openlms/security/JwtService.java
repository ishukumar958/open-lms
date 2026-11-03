package com.lms.openlms.security;

import com.lms.openlms.entity.User;
import com.lms.openlms.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Locale;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret:c3VwZXJzZWNyZXRqd3RrZXlmb3JvcGVubG1zZGV2ZWxvcG1lbnQyMDI2}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "STUDENT";
        if ("PROFESSOR".equalsIgnoreCase(roleName) || "FACULTY".equalsIgnoreCase(roleName)) {
            roleName = "FACULTY";
        } else {
            roleName = "STUDENT";
        }

        long now = System.currentTimeMillis();
        return Jwts.builder()
                .subject(String.valueOf(user.getUserId()))
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("role", roleName)
                .issuedAt(new Date(now))
                .expiration(new Date(now + expirationMs))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("Invalid or expired JWT token");
        }
    }
}
