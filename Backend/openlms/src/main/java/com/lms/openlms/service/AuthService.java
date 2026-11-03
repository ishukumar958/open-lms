package com.lms.openlms.service;

import com.lms.openlms.dto.AuthDtos;
import com.lms.openlms.entity.Role;
import com.lms.openlms.entity.User;
import com.lms.openlms.exception.BadRequestException;
import com.lms.openlms.exception.ConflictException;
import com.lms.openlms.exception.ForbiddenException;
import com.lms.openlms.exception.ResourceNotFoundException;
import com.lms.openlms.exception.UnauthorizedException;
import com.lms.openlms.repository.RoleRepository;
import com.lms.openlms.repository.UserRepository;
import com.lms.openlms.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthDtos.AuthResponse register(AuthDtos.RegisterRequest request) {
        String name = request.getName() != null ? request.getName().trim() : "";
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase(Locale.ROOT) : "";
        String password = request.getPassword();
        String inputRole = request.getRoleName() != null ? request.getRoleName().trim().toUpperCase(Locale.ROOT) : "STUDENT";

        String normalizedRole;
        if ("PROFESSOR".equals(inputRole) || "FACULTY".equals(inputRole) || "TEACHER".equals(inputRole)) {
            normalizedRole = "FACULTY";
        } else if ("STUDENT".equals(inputRole)) {
            normalizedRole = "STUDENT";
        } else {
            throw new BadRequestException("Role must be STUDENT or FACULTY");
        }

        if (userRepository.findByEmail(email).isPresent()) {
            throw new ConflictException("Email already registered");
        }

        Role role = roleRepository.findByRoleNameIgnoreCase(normalizedRole)
                .orElseThrow(() -> new BadRequestException("Role not configured"));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);
        String token = jwtService.generateToken(savedUser);

        return new AuthDtos.AuthResponse(
                savedUser.getUserId(),
                savedUser.getName(),
                savedUser.getEmail(),
                role.getRoleName().toUpperCase(Locale.ROOT),
                role.getRoleId(),
                token,
                savedUser.getIsActive()
        );
    }

    public AuthDtos.AuthResponse login(AuthDtos.LoginRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase(Locale.ROOT) : "";
        String password = request.getPassword();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (password == null || !passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ForbiddenException("Account disabled");
        }

        String token = jwtService.generateToken(user);
        Role role = user.getRole();
        String roleName = role != null ? role.getRoleName().toUpperCase(Locale.ROOT) : "STUDENT";
        Long roleId = role != null ? role.getRoleId() : null;

        return new AuthDtos.AuthResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                roleName,
                roleId,
                token,
                user.getIsActive()
        );
    }

    @Transactional(readOnly = true)
    public AuthDtos.UserResponse getMe(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Role role = user.getRole();
        String roleName = role != null ? role.getRoleName().toUpperCase(Locale.ROOT) : "STUDENT";
        Long roleId = role != null ? role.getRoleId() : null;

        return new AuthDtos.UserResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                roleName,
                roleId,
                user.getIsActive()
        );
    }

    public AuthDtos.AuthResponse googleLogin(AuthDtos.GoogleLoginRequest request) {
        String email = null;
        String name = null;

        try {
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(8000);
            requestFactory.setReadTimeout(8000);
            RestTemplate restTemplate = new RestTemplate(requestFactory);
            if (request.getCredential() != null && !request.getCredential().trim().isEmpty()) {
                String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getCredential().trim();
                Map<?, ?> response = restTemplate.getForObject(url, Map.class);
                if (response != null && response.containsKey("email")) {
                    email = (String) response.get("email");
                    name = (String) response.get("name");
                }
            } else if (request.getAccessToken() != null && !request.getAccessToken().trim().isEmpty()) {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(request.getAccessToken().trim());
                HttpEntity<Void> entity = new HttpEntity<>(headers);
                ResponseEntity<Map> response = restTemplate.exchange(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        HttpMethod.GET,
                        entity,
                        Map.class
                );
                if (response.getBody() != null && response.getBody().containsKey("email")) {
                    email = (String) response.getBody().get("email");
                    name = (String) response.getBody().get("name");
                }
            }
        } catch (Exception e) {
            throw new UnauthorizedException("Google authentication failed: " + e.getMessage());
        }

        if (email == null || email.trim().isEmpty()) {
            throw new UnauthorizedException("Could not retrieve verified email from Google");
        }

        email = email.trim().toLowerCase(Locale.ROOT);
        if (name == null || name.trim().isEmpty()) {
            name = email.split("@")[0];
        }

        String inputRole = request.getRoleName() != null ? request.getRoleName().trim().toUpperCase(Locale.ROOT) : "";
        String normalizedRole = ("PROFESSOR".equals(inputRole) || "FACULTY".equals(inputRole) || "TEACHER".equals(inputRole))
                ? "FACULTY"
                : ("STUDENT".equals(inputRole) ? "STUDENT" : null);

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            String roleToAssign = (normalizedRole != null) ? normalizedRole : "STUDENT";
            Role role = roleRepository.findByRoleNameIgnoreCase(roleToAssign)
                    .orElseThrow(() -> new BadRequestException("Role not configured"));

            user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            user.setRole(role);
            user.setIsActive(true);
            user = userRepository.save(user);
        } else {
            if (!Boolean.TRUE.equals(user.getIsActive())) {
                throw new ForbiddenException("Account disabled");
            }

            // If signing up from Teacher/Faculty space, explicitly ensure user role is FACULTY
            if ("FACULTY".equals(normalizedRole)) {
                Role facultyRole = roleRepository.findByRoleNameIgnoreCase("FACULTY")
                        .orElseThrow(() -> new BadRequestException("Role not configured"));
                user.setRole(facultyRole);
                user = userRepository.save(user);
            } else if ("STUDENT".equals(normalizedRole) && user.getRole() == null) {
                Role studentRole = roleRepository.findByRoleNameIgnoreCase("STUDENT")
                        .orElseThrow(() -> new BadRequestException("Role not configured"));
                user.setRole(studentRole);
                user = userRepository.save(user);
            }
        }

        String token = jwtService.generateToken(user);
        Role role = user.getRole();
        String roleName = role != null ? role.getRoleName().toUpperCase(Locale.ROOT) : "STUDENT";
        Long roleId = role != null ? role.getRoleId() : null;

        return new AuthDtos.AuthResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                roleName,
                roleId,
                token,
                user.getIsActive()
        );
    }
}
