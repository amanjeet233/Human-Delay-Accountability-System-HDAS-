package com.hdas.controller;

import com.hdas.dto.AuthRequest;
import com.hdas.dto.AuthResponse;
import com.hdas.dto.RegisterRequest;
import com.hdas.dto.ChangePasswordRequest;
import com.hdas.domain.user.Role;
import com.hdas.domain.user.User;
import com.hdas.repository.RoleRepository;
import com.hdas.repository.UserRepository;
import com.hdas.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@jakarta.validation.Valid @RequestBody RegisterRequest request) {
        // Validate inputs
        if (request.getUsername() == null || request.getUsername().isBlank() ||
            request.getEmail() == null || request.getEmail().isBlank() ||
            request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(409).build();
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(409).build();
        }

        // Split full name into first and last
        String firstName = "";
        String lastName = "";
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            String[] parts = request.getFullName().trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        // Assign CITIZEN role by default
        Role citizen = roleRepository.findByName("CITIZEN")
            .orElseThrow(() -> new RuntimeException("CITIZEN role not seeded"));

        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .firstName(firstName)
            .lastName(lastName)
            .department(null)
            .active(false)
            .status(com.hdas.domain.user.UserStatus.PENDING)
            .roles(java.util.Set.of(citizen))
            .build();

        userRepository.save(java.util.Objects.requireNonNull(user));
        User saved = userRepository.findByUsername(user.getUsername()).orElseThrow();

        // Return basic auth response (do NOT auto-login here to keep login flow explicit)
        AuthResponse response = AuthResponse.builder()
            .username(saved.getUsername())
            .email(saved.getEmail())
            .role("CITIZEN")
            .build();
        return ResponseEntity.status(201).body(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request, HttpServletRequest httpRequest) {
        log.info("Authentication attempt for user: {}", request.getUsername());
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                SecurityContextHolder.getContext());

            AuthResponse response = authService.buildAuthResponse(request.getUsername());
            log.info("Authentication successful for user: {} with role: {}", request.getUsername(), response.getRole());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", request.getUsername(), e);
            return ResponseEntity.status(401).body(AuthResponse.builder()
                .username(null)
                .email(null)
                .build());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        AuthResponse response = authService.buildAuthResponse(username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@jakarta.validation.Valid @RequestBody ChangePasswordRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        // Verify old password
        if (request.getOldPassword() == null || request.getOldPassword().isBlank() ||
            request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        boolean matches = passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash());
        if (!matches) {
            return ResponseEntity.status(400).build();
        }
        // Update to new bcrypt hash
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Invalidate current session to force re-login
        SecurityContextHolder.clearContext();
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok().build();
    }
    
    // Simple health check endpoint
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "HDAS - Human Delay Accountability System");
        response.put("version", "1.0.0");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}
