package com.hdas.controller;

import com.hdas.domain.user.User;
import com.hdas.dto.CreateUserRequest;
import com.hdas.dto.UpdateUserRequest;
import com.hdas.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUser(@PathVariable @NonNull UUID id) {
        return userService.getUserById(Objects.requireNonNull(id))
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserRequest request, HttpServletRequest httpRequest) {
        User user = userService.createUser(request, httpRequest);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable @NonNull UUID id, @Valid @RequestBody UpdateUserRequest request, HttpServletRequest httpRequest) {
        User user = userService.updateUser(Objects.requireNonNull(id), request, httpRequest);
        return ResponseEntity.ok(user);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable @NonNull UUID id, HttpServletRequest httpRequest) {
        userService.deleteUser(Objects.requireNonNull(id), httpRequest);
        return ResponseEntity.noContent().build();
    }
}
