package com.hdas.controller;

import com.hdas.domain.user.User;
import com.hdas.dto.profile.SelfProfileResponse;
import com.hdas.dto.profile.SelfProfileUpdateRequest;
import com.hdas.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class SelfProfileController {

    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SelfProfileResponse> getMe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        String fullName = (String.join(" ", Optional.ofNullable(user.getFirstName()).orElse(""), Optional.ofNullable(user.getLastName()).orElse(""))).trim();
        String primaryRole = (user.getRoles() != null && !user.getRoles().isEmpty()) ? user.getRoles().iterator().next().getName() : "CITIZEN";
        SelfProfileResponse resp = SelfProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(fullName)
                .email(user.getEmail())
                .department(user.getDepartment())
                .role(primaryRole)
                .build();
        return ResponseEntity.ok(resp);
    }

    @PutMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SelfProfileResponse> updateMe(@Valid @RequestBody SelfProfileUpdateRequest req) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(401).build();
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).build();
        }

        // Email uniqueness check (if changing)
        if (req.getEmail() != null && !req.getEmail().equalsIgnoreCase(Optional.ofNullable(user.getEmail()).orElse(""))) {
            if (userRepository.existsByEmail(req.getEmail())) {
                // If email exists and belongs to someone else, reject
                Optional<User> owner = userRepository.findByEmail(req.getEmail());
                if (owner.isPresent() && !owner.get().getUsername().equals(user.getUsername())) {
                    return ResponseEntity.status(409).build();
                }
            }
        }

        // Split full name
        String firstName = "";
        String lastName = "";
        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            String[] parts = req.getFullName().trim().split("\\s+", 2);
            firstName = parts[0];
            lastName = parts.length > 1 ? parts[1] : "";
        }

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(req.getEmail());
        user.setDepartment(Optional.ofNullable(req.getDepartment()).orElse(null));
        userRepository.save(java.util.Objects.requireNonNull(user));

        String fullName = (String.join(" ", Optional.ofNullable(user.getFirstName()).orElse(""), Optional.ofNullable(user.getLastName()).orElse(""))).trim();
        String primaryRole = (user.getRoles() != null && !user.getRoles().isEmpty()) ? user.getRoles().iterator().next().getName() : "CITIZEN";
        SelfProfileResponse resp = SelfProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(fullName)
                .email(user.getEmail())
                .department(user.getDepartment())
                .role(primaryRole)
                .build();
        return ResponseEntity.ok(resp);
    }
}
