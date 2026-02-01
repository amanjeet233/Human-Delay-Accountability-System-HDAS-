package com.hdas.service;

import com.hdas.domain.user.User;
import com.hdas.dto.AuthResponse;
import com.hdas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    // No hardcoded users: all authentication must use database + BCrypt
    
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public AuthResponse buildAuthResponse(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Extract user's roles and determine primary role with precedence
        Set<String> userRoles = user.getRoles().stream()
            .map(role -> role.getName())
            .collect(Collectors.toSet());

        // Normalize primary role selection: prefer ADMIN if present, else pick a sensible highest privilege
        String primaryRole =
            userRoles.contains("ADMIN") ? "ADMIN" :
            userRoles.contains("HOD") ? "HOD" :
            userRoles.contains("SECTION_OFFICER") ? "SECTION_OFFICER" :
            userRoles.contains("AUDITOR") ? "AUDITOR" :
            userRoles.contains("CLERK") ? "CLERK" :
            userRoles.stream().findFirst().orElse("CITIZEN");

        return AuthResponse.builder()
            .username(user.getUsername())
            .email(user.getEmail())
            .role(primaryRole)
            .mustChangePassword(Boolean.TRUE.equals(user.getMustChangePassword()))
            .build();
    }
}
