package com.hdas.service;

import com.hdas.domain.user.User;
import com.hdas.domain.user.Role;
import com.hdas.dto.CreateUserRequest;
import com.hdas.dto.UpdateUserRequest;
import com.hdas.repository.RoleRepository;
import com.hdas.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    
    @Transactional
    public User createUser(CreateUserRequest request, HttpServletRequest httpRequest) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        
        Set<Role> roles = new HashSet<>();
        if (request.getRoleIds() != null) {
            roles = request.getRoleIds().stream()
                .map(roleId -> roleRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleId)))
                .collect(Collectors.toSet());
        }
        
        User user = User.builder()
            .username(request.getUsername())
            .email(request.getEmail())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .department(request.getDepartment())
            .active(request.getActive() != null ? request.getActive() : true)
            .roles(new HashSet<>(roles))
            .build();
        
        user = userRepository.save(user);
        
        auditService.logWithRequest("CREATE_USER", "User", user.getId(),
            null, user.getUsername(), "User created: " + user.getUsername(), httpRequest);
        
        return user;
    }
    
    @Transactional
    public User updateUser(UUID id, UpdateUserRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        String oldValue = user.getEmail() + "|" + user.getActive();
        
        if (request.getEmail() != null) {
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getDepartment() != null) {
            user.setDepartment(request.getDepartment());
        }
        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }
        if (request.getRoleIds() != null) {
            Set<Role> roles = request.getRoleIds().stream()
                .map(roleId -> roleRepository.findById(roleId)
                    .orElseThrow(() -> new RuntimeException("Role not found: " + roleId)))
                .collect(Collectors.toSet());
            user.setRoles(new HashSet<>(roles));
        }
        
        user = userRepository.save(user);
        
        String newValue = user.getEmail() + "|" + user.getActive();
        auditService.logWithRequest("UPDATE_USER", "User", id,
            oldValue, newValue, "User updated: " + user.getUsername(), httpRequest);
        
        return user;
    }
    
    @Transactional
    public User updateUserRole(UUID userId, String roleName, HttpServletRequest httpRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
        
        user.getRoles().clear();
        user.getRoles().add(role);
        
        User updatedUser = userRepository.save(user);
        
        auditService.logAction(
            "USER_ROLE_UPDATED",
            "User role updated to " + roleName + " for user " + user.getUsername(),
            httpRequest
        );
        
        return updatedUser;
    }
    
    @Transactional
    public void resetUserPassword(UUID userId, String newPassword, HttpServletRequest httpRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        auditService.logAction(
            "PASSWORD_RESET",
            "Password reset for user " + user.getUsername(),
            httpRequest
        );
    }
    
    @Transactional
    public void updateUserStatus(UUID userId, Boolean active, HttpServletRequest httpRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        user.setActive(active);
        userRepository.save(user);
        
        auditService.logAction(
            "USER_STATUS_UPDATED",
            "User status updated to " + active + " for user " + user.getUsername(),
            httpRequest
        );
    }
    
    @Transactional
    public void deleteUser(UUID userId, HttpServletRequest httpRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Soft delete - set active to false
        user.setActive(false);
        userRepository.save(user);
        
        auditService.logWithRequest("DELETE_USER", "User", userId,
            "active=true", "active=false", "User deactivated: " + user.getUsername(), httpRequest);
    }
    
    public long getUserCount() {
        return userRepository.count();
    }
    
    public long getRoleCount() {
        return roleRepository.count();
    }
    
    public User createUser(User user) {
        return userRepository.save(user);
    }
    
    public Role createRole(Role role) {
        return roleRepository.save(role);
    }
}
