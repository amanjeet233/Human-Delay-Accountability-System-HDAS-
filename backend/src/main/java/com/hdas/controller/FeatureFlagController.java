package com.hdas.controller;

import com.hdas.model.FeatureFlag;
import com.hdas.service.FeatureFlagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/feature-flags")
@RequiredArgsConstructor
@Slf4j
public class FeatureFlagController {
    
    private final FeatureFlagService featureFlagService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeatureFlag>> getAllFeatureFlags() {
        return ResponseEntity.ok(featureFlagService.getAllFeatureFlags());
    }
    
    @GetMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeatureFlag> getFeatureFlag(@PathVariable String name) {
        return featureFlagService.getFeatureFlag(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/enabled/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Boolean> isFeatureEnabled(@PathVariable String name) {
        return ResponseEntity.ok(featureFlagService.isFeatureEnabled(name));
    }
    
    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeatureFlag>> getFeatureFlagsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(featureFlagService.getFeatureFlagsByCategory(category));
    }
    
    @GetMapping("/enabled")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeatureFlag>> getEnabledFeatureFlags() {
        return ResponseEntity.ok(featureFlagService.getEnabledFeatureFlags());
    }
    
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeatureFlag>> getFeatureFlagsForRole(@PathVariable String role) {
        return ResponseEntity.ok(featureFlagService.getFeatureFlagsForRole(role));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeatureFlag> createFeatureFlag(@RequestBody FeatureFlag featureFlag) {
        FeatureFlag created = featureFlagService.createFeatureFlag(featureFlag);
        return ResponseEntity.ok(created);
    }
    
    @PutMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeatureFlag> updateFeatureFlag(
            @PathVariable String name, 
            @RequestBody FeatureFlag update) {
        FeatureFlag updated = featureFlagService.updateFeatureFlag(name, update);
        return ResponseEntity.ok(updated);
    }
    
    @PutMapping("/{name}/enable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> enableFeatureFlag(
            @PathVariable String name,
            @RequestParam String updatedBy) {
        featureFlagService.enableFeatureFlag(name, updatedBy);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{name}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> disableFeatureFlag(
            @PathVariable String name,
            @RequestParam String updatedBy) {
        featureFlagService.disableFeatureFlag(name, updatedBy);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{name}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeatureFlag(@PathVariable String name) {
        featureFlagService.deleteFeatureFlag(name);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/initialize")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> initializeDefaultFeatureFlags() {
        featureFlagService.initializeDefaultFeatureFlags();
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/check/{name}")
    public ResponseEntity<Boolean> checkFeatureAccess(
            @PathVariable String name,
            @RequestParam List<String> userRoles) {
        boolean canAccess = featureFlagService.canAccessFeature(name, userRoles);
        return ResponseEntity.ok(canAccess);
    }
}
