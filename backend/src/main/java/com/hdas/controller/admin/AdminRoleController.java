package com.hdas.controller.admin;

import com.hdas.domain.user.Role;
import com.hdas.domain.user.User;
import com.hdas.dto.admin.RoleAssignRequest;
import com.hdas.repository.RoleRepository;
import com.hdas.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminRoleController {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    public AdminRoleController(RoleRepository roleRepository, UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getRoles() {
        return ResponseEntity.ok(roleRepository.findAll());
    }

    @GetMapping("/permissions")
    public ResponseEntity<List<String>> getPermissions() {
        // Permissions are dynamic strings from role entity's permissions set
        Set<String> perms = new HashSet<>();
        for (Role r : roleRepository.findAll()) {
            perms.addAll(r.getPermissions());
        }
        return ResponseEntity.ok(new ArrayList<>(perms));
    }

    @PostMapping("/roles/assign")
    public ResponseEntity<User> assignRoles(@Valid @RequestBody RoleAssignRequest req) {
        User user = userRepository.findById(req.getUserId()).orElseThrow();
        Set<Role> roles = new HashSet<>();
        for (String roleName : req.getRoles()) {
            roleRepository.findByName(roleName).ifPresent(roles::add);
        }
        user.setRoles(roles);
        return ResponseEntity.ok(userRepository.save(user));
    }
}
