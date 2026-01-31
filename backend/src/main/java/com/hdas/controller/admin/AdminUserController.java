package com.hdas.controller.admin;

import com.hdas.domain.user.Role;
import com.hdas.domain.user.User;
import com.hdas.dto.admin.ResetPasswordRequest;
import com.hdas.dto.admin.RoleAssignmentRequest;
import com.hdas.dto.admin.UserStatusPatchRequest;
import com.hdas.repository.RoleRepository;
import com.hdas.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionRegistry sessionRegistry;
    public AdminUserController(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, SessionRegistry sessionRegistry) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionRegistry = sessionRegistry;
    }

    // Note: create/list/update endpoints exist in AdminController; avoid duplicate mappings here.

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> patchStatus(@PathVariable @NonNull UUID id, @Valid @RequestBody UserStatusPatchRequest req) {
        User user = userRepository.findById(java.util.Objects.requireNonNull(id)).orElseThrow();
        user.setActive(req.getActive());
        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetPassword(@PathVariable @NonNull UUID id, @Valid @RequestBody ResetPasswordRequest req) {
        User user = userRepository.findById(java.util.Objects.requireNonNull(id)).orElseThrow();
        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        // Expire all active sessions for this user to force re-login
        try {
            List<Object> principals = sessionRegistry.getAllPrincipals();
            for (Object principal : principals) {
                String principalName = null;
                if (principal instanceof UserDetails) {
                    principalName = ((UserDetails) principal).getUsername();
                } else {
                    principalName = principal.toString();
                }
                if (user.getUsername().equals(principalName)) {
                    List<SessionInformation> sessions = sessionRegistry.getAllSessions(principal, false);
                    for (SessionInformation si : sessions) {
                        si.expireNow();
                    }
                }
            }
        } catch (Exception ignored) {
            // If session registry isn't tracking this principal, reset will still enforce new password on next auth
        }
        return ResponseEntity.ok().build();
    }

        @PostMapping("/{id}/role")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<com.hdas.dto.admin.UserSummaryResponse> assignRole(
            @PathVariable @NonNull UUID id,
            @Valid @RequestBody RoleAssignmentRequest req
        ) {
        User user = userRepository.findById(java.util.Objects.requireNonNull(id)).orElseThrow();

        // Prevent self-assignment of role
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth != null ? auth.getName() : null;
        if (currentUsername != null && currentUsername.equals(user.getUsername())) {
            return ResponseEntity.status(403).body(
                com.hdas.dto.admin.UserSummaryResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRoles() != null && !user.getRoles().isEmpty() ? user.getRoles().iterator().next().getName() : "CITIZEN")
                    .active(Boolean.TRUE.equals(user.getActive()))
                    .build()
            );
        }

        Role role = roleRepository.findByName(req.getRole())
            .orElseThrow(() -> new RuntimeException("Role not found: " + req.getRole()));

        java.util.Set<Role> newRoles = new java.util.HashSet<>();
        newRoles.add(role);
        user.setRoles(newRoles);
        userRepository.save(user);

        String primaryRole = user.getRoles() != null && !user.getRoles().isEmpty()
            ? user.getRoles().iterator().next().getName()
            : "CITIZEN";
        return ResponseEntity.ok(
            com.hdas.dto.admin.UserSummaryResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(primaryRole)
                .active(Boolean.TRUE.equals(user.getActive()))
                .build()
        );
        }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<com.hdas.dto.admin.UserSummaryResponse>> getAllUsersSimple() {
        java.util.List<User> users = userRepository.findAll();
        java.util.List<com.hdas.dto.admin.UserSummaryResponse> result = users.stream().map(u -> {
            String primaryRole = u.getRoles() != null && !u.getRoles().isEmpty()
                    ? u.getRoles().iterator().next().getName()
                    : "CITIZEN";
            return com.hdas.dto.admin.UserSummaryResponse.builder()
                    .id(u.getId())
                    .username(u.getUsername())
                    .email(u.getEmail())
                    .role(primaryRole)
                    .active(Boolean.TRUE.equals(u.getActive()))
                    .build();
        }).toList();
        return ResponseEntity.ok(result);
    }
}
