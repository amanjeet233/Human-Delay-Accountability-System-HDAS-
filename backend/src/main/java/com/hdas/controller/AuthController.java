package com.hdas.controller;

import com.hdas.dto.AuthRequest;
import com.hdas.dto.AuthResponse;
import com.hdas.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        log.info("Authentication attempt for user: {}", request.getUsername());
        try {
            AuthResponse response = authService.authenticate(request);
            log.info("Authentication successful for user: {} with roles: {}", request.getUsername(), response.getRoles());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", request.getUsername(), e);
            return ResponseEntity.status(401).body(AuthResponse.builder()
                .token(null)
                .username(null)
                .email(null)
                .roles(Set.of())
                .permissions(Set.of())
                .build());
        }
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
