package com.hdas.service;

import com.hdas.domain.user.Role;
import com.hdas.dto.CreateRoleRequest;
import com.hdas.dto.UpdateRoleRequest;
import com.hdas.repository.RoleRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleService {
    
    private final RoleRepository roleRepository;
    private final AuditService auditService;
    
    @Transactional
    public Role createRole(CreateRoleRequest request, HttpServletRequest httpRequest) {
        if (roleRepository.existsByName(request.getName())) {
            throw new RuntimeException("Role name already exists");
        }
        
        Role role = Role.builder()
            .name(request.getName())
            .description(request.getDescription())
            .permissions(request.getPermissions() != null ? new HashSet<>(request.getPermissions()) : new HashSet<>())
            .active(request.getActive() != null ? request.getActive() : true)
            .build();
        
        role = roleRepository.save(role);
        
        auditService.logWithRequest("CREATE_ROLE", "Role", role.getId(),
            null, role.getName(), "Role created: " + role.getName(), httpRequest);
        
        return role;
    }
    
    @Transactional
    public Role updateRole(UUID id, UpdateRoleRequest request, HttpServletRequest httpRequest) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Role not found"));
        
        String oldValue = role.getName() + "|" + role.getActive();
        
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getPermissions() != null) {
            role.setPermissions(new HashSet<>(request.getPermissions()));
        }
        if (request.getActive() != null) {
            role.setActive(request.getActive());
        }
        
        role = roleRepository.save(role);
        
        String newValue = role.getName() + "|" + role.getActive();
        auditService.logWithRequest("UPDATE_ROLE", "Role", id,
            oldValue, newValue, "Role updated: " + role.getName(), httpRequest);
        
        return role;
    }
}
