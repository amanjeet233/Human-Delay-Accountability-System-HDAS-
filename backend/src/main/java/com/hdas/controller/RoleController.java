package com.hdas.controller;

import com.hdas.domain.user.Role;
import com.hdas.dto.CreateRoleRequest;
import com.hdas.dto.UpdateRoleRequest;
import com.hdas.service.RoleService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {
    
    private final RoleService roleService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> getRole(@PathVariable UUID id) {
        return roleService.getRoleById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> createRole(@Valid @RequestBody CreateRoleRequest request, HttpServletRequest httpRequest) {
        Role role = roleService.createRole(request, httpRequest);
        return ResponseEntity.ok(role);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Role> updateRole(@PathVariable UUID id, @Valid @RequestBody UpdateRoleRequest request, HttpServletRequest httpRequest) {
        Role role = roleService.updateRole(id, request, httpRequest);
        return ResponseEntity.ok(role);
    }
}
