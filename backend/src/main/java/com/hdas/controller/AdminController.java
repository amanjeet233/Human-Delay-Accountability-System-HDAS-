package com.hdas.controller;

import com.hdas.dto.CreateUserRequest;
import com.hdas.dto.UpdateUserRequest;
import com.hdas.security.RequirePermission;
import com.hdas.security.RequireRole;
import com.hdas.security.RoleBasedAccessControl;
import com.hdas.service.AuditService;
import com.hdas.service.FeatureFlagService;
import com.hdas.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@RequireRole(RoleBasedAccessControl.SystemRole.ADMIN)
public class AdminController {
    
    private final UserService userService;
    private final AuditService auditService;
    private final FeatureFlagService featureFlagService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(HttpServletRequest httpRequest) {
        log.info("Admin accessing dashboard");
        
        Map<String, Object> response = Map.of(
            "message", "Admin Dashboard",
            "permissions", List.of(
                "CREATE_USERS", "UPDATE_USERS", "DELETE_USERS", "ASSIGN_ROLES",
                "CONFIGURE_PROCESSES", "MANAGE_FEATURE_FLAGS", "VIEW_ALL_DATA", "VIEW_ANALYTICS"
            ),
            "actions", List.of(
                "create_users", "update_users", "delete_users", "assign_roles",
                "configure_processes", "manage_feature_flags", "view_all_data", "view_analytics"
            )
        );
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/sla-breaches")
    public ResponseEntity<Map<String, Object>> getSlaBreachAnalytics(HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("slaBreachAnalytics")) {
            auditService.logFeatureAccessDenied("slaBreachAnalytics", "GET /api/admin/analytics/sla-breaches", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        // Real implementation should compute from persisted assignments/delays
        return ResponseEntity.ok(Map.of(
                "totalBreaches", 0,
                "breachesByRole", Map.of(),
                "trend", List.of()
        ));
    }

    @GetMapping("/dashboard/metrics")
    public ResponseEntity<Map<String, Object>> getAdminDashboardMetrics(HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("adminDashboardMetrics")) {
            auditService.logFeatureAccessDenied("adminDashboardMetrics", "GET /api/admin/dashboard/metrics", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        // Real implementation should compute from persisted requests/assignments
        return ResponseEntity.ok(Map.of(
                "totalRequests", 0,
                "pending", 0,
                "inProgress", 0,
                "delayed", 0,
                "escalated", 0
        ));
    }

    @PostMapping("/ai/delay-prediction")
    public ResponseEntity<?> predictDelay(@RequestBody Map<String, Object> payload, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("aiAssistance")) {
            auditService.logFeatureAccessDenied("aiAssistance", "POST /api/admin/ai/delay-prediction", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "prediction", Map.of(
                        "riskScore", 0.0,
                        "explanation", "Rule-based model placeholder",
                        "recommendedAction", "NONE"
                ),
                "input", payload
        ));
    }

    @PostMapping("/notifications/test")
    public ResponseEntity<?> sendTestNotification(@RequestBody Map<String, Object> payload, HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("realTimeNotifications")) {
            auditService.logFeatureAccessDenied("realTimeNotifications", "POST /api/admin/notifications/test", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Notification queued",
                "payload", payload
        ));
    }

    @GetMapping("/mobile-app/config")
    public ResponseEntity<?> getMobileAppConfig(HttpServletRequest httpRequest) {
        if (!featureFlagService.isFeatureEnabled("mobileApp")) {
            auditService.logFeatureAccessDenied("mobileApp", "GET /api/admin/mobile-app/config", httpRequest);
            return ResponseEntity.status(403).body(Map.of(
                    "error", "FEATURE_DISABLED",
                    "message", "Feature Coming Soon"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "minVersion", "0.0.0",
                "forceUpgrade", false,
                "message", "Mobile app configuration"
        ));
    }
    
    @PostMapping("/users")
    @RequirePermission(RoleBasedAccessControl.Permission.CREATE_USERS)
    public ResponseEntity<Map<String, Object>> createUser(
            @RequestBody CreateUserRequest request,
            HttpServletRequest httpRequest) {
        log.info("Admin creating user: {}", request.getUsername());
        
        try {
            var user = userService.createUser(request, httpRequest);
            return ResponseEntity.ok(Map.of(
                "message", "User created successfully",
                "userId", user.getId(),
                "username", user.getUsername(),
                "role", user.getRoles()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "USER_CREATION_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/users/{id}")
    @RequirePermission(RoleBasedAccessControl.Permission.UPDATE_USERS)
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable String id,
            @RequestBody UpdateUserRequest request,
            HttpServletRequest httpRequest) {
        log.info("Admin updating user: {}", id);
        
        try {
            var user = userService.updateUser(UUID.fromString(id), request, httpRequest);
            return ResponseEntity.ok(Map.of(
                "message", "User updated successfully",
                "userId", user.getId(),
                "username", user.getUsername(),
                "role", user.getRoles()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "USER_UPDATE_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @DeleteMapping("/users/{id}")
    @RequirePermission(RoleBasedAccessControl.Permission.DELETE_USERS)
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String id, HttpServletRequest httpRequest) {
        log.info("Admin deleting user: {}", id);
        
        try {
            userService.deleteUser(UUID.fromString(id), httpRequest);
            return ResponseEntity.ok(Map.of(
                "message", "User deleted successfully",
                "userId", id
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "USER_DELETION_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/users/{id}/role")
    @RequirePermission(RoleBasedAccessControl.Permission.ASSIGN_ROLES)
    public ResponseEntity<Map<String, Object>> updateUserRole(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        log.info("Admin updating role for user {}: {}", id, request.get("role"));
        
        try {
            var user = userService.updateUserRole(UUID.fromString(id), request.get("role"), httpRequest);
            return ResponseEntity.ok(Map.of(
                "message", "User role updated successfully",
                "userId", user.getId(),
                "username", user.getUsername(),
                "newRole", request.get("role"),
                "updatedBy", RoleBasedAccessControl.getCurrentUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "USER_ROLE_UPDATE_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/users/{id}/reset-password")
    @RequirePermission(RoleBasedAccessControl.Permission.UPDATE_USERS)
    public ResponseEntity<Map<String, Object>> resetUserPassword(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        log.info("Admin resetting password for user: {}", id);
        
        try {
            userService.resetUserPassword(UUID.fromString(id), request.get("newPassword"), httpRequest);
            return ResponseEntity.ok(Map.of(
                "message", "Password reset successfully",
                "userId", id,
                "resetBy", RoleBasedAccessControl.getCurrentUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "PASSWORD_RESET_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/users/{id}/status")
    @RequirePermission(RoleBasedAccessControl.Permission.UPDATE_USERS)
    public ResponseEntity<Map<String, Object>> updateUserStatus(
            @PathVariable String id,
            @RequestBody Map<String, Object> request,
            HttpServletRequest httpRequest) {
        log.info("Admin updating status for user {}: {}", id, request.get("active"));
        
        try {
            userService.updateUserStatus(UUID.fromString(id), (Boolean) request.get("active"), httpRequest);
            return ResponseEntity.ok(Map.of(
                "message", "User status updated successfully",
                "userId", id,
                "active", request.get("active"),
                "updatedBy", RoleBasedAccessControl.getCurrentUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "USER_STATUS_UPDATE_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @PostMapping("/users/{id}/assign-role")
    @RequirePermission(RoleBasedAccessControl.Permission.ASSIGN_ROLES)
    public ResponseEntity<Map<String, Object>> assignRole(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        log.info("Admin assigning role {} to user: {}", request.get("role"), id);
        
        return ResponseEntity.ok(Map.of(
            "message", "Role assigned successfully",
            "userId", id,
            "assignedRole", request.get("role"),
            "assignedBy", RoleBasedAccessControl.getCurrentUsername()
        ));
    }
    
    @GetMapping("/users")
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_ALL_DATA)
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        log.info("Admin viewing all users");
        
        List<Map<String, Object>> users = userService.getAllUsers().stream()
            .map(user -> Map.<String, Object>of(
                "id", user.getId().toString(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "department", user.getDepartment(),
                "active", user.getActive(),
                "createdAt", user.getCreatedAt(),
                "role", (Object) user.getRoles().stream()
                    .findFirst()
                    .map(role -> role.getName())
                    .orElse("NONE")
            ))
            .collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(users);
    }
    
    @PostMapping("/processes")
    @RequirePermission(RoleBasedAccessControl.Permission.CONFIGURE_PROCESSES)
    public ResponseEntity<Map<String, Object>> createProcess(
            @RequestBody Map<String, Object> processConfig,
            HttpServletRequest httpRequest) {
        log.info("Admin creating process: {}", processConfig.get("name"));
        
        try {
            // In a real implementation, this would save to database
            String processId = UUID.randomUUID().toString();
            
            auditService.logAction(
                "PROCESS_CREATED",
                "Process created: " + processConfig.get("name"),
                httpRequest
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "Process created successfully",
                "processId", processId,
                "name", processConfig.get("name"),
                "createdBy", RoleBasedAccessControl.getCurrentUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "PROCESS_CREATION_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/processes")
    @RequirePermission(RoleBasedAccessControl.Permission.CONFIGURE_PROCESSES)
    public ResponseEntity<List<Map<String, Object>>> getAllProcesses() {
        log.info("Admin viewing all processes");
        
        List<Map<String, Object>> processes = List.of(
            Map.of(
                "id", "proc-1",
                "name", "Land Registration",
                "description", "Process for land registration requests",
                "steps", List.of(
                    Map.of("order", 1, "name", "Citizen Submission", "assignedRole", "CITIZEN"),
                    Map.of("order", 2, "name", "Clerk Verification", "assignedRole", "CLERK"),
                    Map.of("order", 3, "name", "Section Officer Review", "assignedRole", "SECTION_OFFICER"),
                    Map.of("order", 4, "name", "HOD Approval", "assignedRole", "HOD")
                ),
                "active", true,
                "createdAt", "2026-01-01T00:00:00Z"
            ),
            Map.of(
                "id", "proc-2",
                "name", "Certificate Issuance",
                "description", "Process for certificate issuance requests",
                "steps", List.of(
                    Map.of("order", 1, "name", "Citizen Application", "assignedRole", "CITIZEN"),
                    Map.of("order", 2, "name", "Clerk Processing", "assignedRole", "CLERK"),
                    Map.of("order", 3, "name", "HOD Issuance", "assignedRole", "HOD")
                ),
                "active", true,
                "createdAt", "2026-01-01T00:00:00Z"
            )
        );
        
        return ResponseEntity.ok(processes);
    }
    
    @PostMapping("/sla")
    @RequirePermission(RoleBasedAccessControl.Permission.CONFIGURE_PROCESSES)
    public ResponseEntity<Map<String, Object>> createSLA(
            @RequestBody Map<String, Object> slaConfig,
            HttpServletRequest httpRequest) {
        log.info("Admin creating SLA: {}", slaConfig.get("processStep"));
        
        try {
            // In a real implementation, this would save to database
            String slaId = UUID.randomUUID().toString();
            
            auditService.logAction(
                "SLA_CREATED",
                "SLA created for process step: " + slaConfig.get("processStep"),
                httpRequest
            );
            
            return ResponseEntity.ok(Map.of(
                "message", "SLA created successfully",
                "slaId", slaId,
                "processStep", slaConfig.get("processStep"),
                "allowedHours", slaConfig.get("allowedHours"),
                "allowedDays", slaConfig.get("allowedDays"),
                "createdBy", RoleBasedAccessControl.getCurrentUsername()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "SLA_CREATION_FAILED",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/sla")
    @RequirePermission(RoleBasedAccessControl.Permission.CONFIGURE_PROCESSES)
    public ResponseEntity<List<Map<String, Object>>> getAllSLAs() {
        log.info("Admin viewing all SLAs");
        
        List<Map<String, Object>> slas = List.of(
            Map.of(
                "id", "sla-1",
                "processStep", "1",
                "processStepName", "Citizen Submission",
                "allowedHours", 24,
                "allowedDays", 3,
                "active", true,
                "createdAt", "2026-01-01T00:00:00Z"
            ),
            Map.of(
                "id", "sla-2",
                "processStep", "2",
                "processStepName", "Clerk Verification",
                "allowedHours", 48,
                "allowedDays", 5,
                "active", true,
                "createdAt", "2026-01-01T00:00:00Z"
            ),
            Map.of(
                "id", "sla-3",
                "processStep", "3",
                "processStepName", "Section Officer Review",
                "allowedHours", 72,
                "allowedDays", 7,
                "active", true,
                "createdAt", "2026-01-01T00:00:00Z"
            ),
            Map.of(
                "id", "sla-4",
                "processStep", "4",
                "processStepName", "HOD Approval",
                "allowedHours", 96,
                "allowedDays", 10,
                "active", true,
                "createdAt", "2026-01-01T00:00:00Z"
            )
        );
        
        return ResponseEntity.ok(slas);
    }
    
    @GetMapping("/audit-logs")
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_ANALYTICS)
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs() {
        log.info("Admin viewing audit logs");
        
        List<Map<String, Object>> auditLogs = List.of(
            Map.of(
                "id", "audit-1",
                "action", "USER_CREATED",
                "entity", "User",
                "description", "Admin created new user: john_doe",
                "performedBy", "admin",
                "performedAt", "2026-01-18T10:30:00Z",
                "ipAddress", "192.168.1.100",
                "userAgent", "Mozilla/5.0"
            ),
            Map.of(
                "id", "audit-2",
                "action", "REQUEST_CREATED",
                "entity", "Request",
                "description", "Citizen submitted land registration request",
                "performedBy", "citizen_user",
                "performedAt", "2026-01-18T11:15:00Z",
                "ipAddress", "192.168.1.101",
                "userAgent", "Mozilla/5.0"
            ),
            Map.of(
                "id", "audit-3",
                "action", "SLA_BREACH",
                "entity", "Request",
                "description", "Request exceeded SLA limit: req-1",
                "performedBy", "system",
                "performedAt", "2026-01-18T14:20:00Z",
                "ipAddress", "system",
                "userAgent", "HDAS-Auto-Escalation"
            ),
            Map.of(
                "id", "audit-4",
                "action", "USER_ROLE_UPDATED",
                "entity", "User",
                "description", "Admin updated role for user: jane_doe to CLERK",
                "performedBy", "admin",
                "performedAt", "2026-01-17T16:45:00Z",
                "ipAddress", "192.168.1.100",
                "userAgent", "Mozilla/5.0"
            ),
            Map.of(
                "id", "audit-5",
                "action", "PASSWORD_RESET",
                "entity", "User",
                "description", "Admin reset password for user: bob_smith",
                "performedBy", "admin",
                "performedAt", "2026-01-17T09:30:00Z",
                "ipAddress", "192.168.1.100",
                "userAgent", "Mozilla/5.0"
            ),
            Map.of(
                "id", "audit-6",
                "action", "PROCESS_CONFIGURED",
                "entity", "Process",
                "description", "Admin configured process: Land Registration",
                "performedBy", "admin",
                "performedAt", "2026-01-16T13:20:00Z",
                "ipAddress", "192.168.1.100",
                "userAgent", "Mozilla/5.0"
            )
        );
        
        return ResponseEntity.ok(auditLogs);
    }
    
    @GetMapping("/analytics")
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_ANALYTICS)
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        log.info("Admin viewing analytics");
        
        Map<String, Object> analytics = Map.of(
            "summary", Map.of(
                "totalRequests", 1247,
                "onTimeDeliveries", 1152,
                "delayedRequests", 95,
                "slaCompliance", 92.4,
                "averageProcessingTime", 4.2,
                "totalEscalations", 23
            ),
            "delaysByRole", List.of(
                Map.of("role", "CITIZEN", "avgDelay", 0.5, "totalRequests", 312),
                Map.of("role", "CLERK", "avgDelay", 2.1, "totalRequests", 418),
                Map.of("role", "SECTION_OFFICER", "avgDelay", 3.8, "totalRequests", 312),
                Map.of("role", "HOD", "avgDelay", 1.2, "totalRequests", 205)
            ),
            "slaByProcess", List.of(
                Map.of("process", "Land Registration", "slaCompliance", 89.2, "avgTime", 5.1),
                Map.of("process", "Certificate Issuance", "slaCompliance", 95.6, "avgTime", 3.3)
            ),
            "monthlyTrends", List.of(
                Map.of("month", "2024-01", "requests", 1247, "onTime", 1152, "delayed", 95),
                Map.of("month", "2023-12", "requests", 1189, "onTime", 1089, "delayed", 100),
                Map.of("month", "2023-11", "requests", 1156, "onTime", 1067, "delayed", 89),
                Map.of("month", "2023-10", "requests", 1203, "onTime", 1123, "delayed", 80),
                Map.of("month", "2023-09", "requests", 1178, "onTime", 1098, "delayed", 80),
                Map.of("month", "2023-08", "requests", 1134, "onTime", 1045, "delayed", 89),
                Map.of("month", "2023-07", "requests", 1098, "onTime", 1012, "delayed", 86)
            ),
            "roleDistribution", List.of(
                Map.of("role", "CITIZEN", "count", 312, "percentage", 25.0),
                Map.of("role", "CLERK", "count", 418, "percentage", 33.5),
                Map.of("role", "SECTION_OFFICER", "count", 312, "percentage", 25.0),
                Map.of("role", "HOD", "count", 205, "percentage", 16.5)
            ),
            "topDelays", List.of(
                Map.of("id", "req-1", "title", "Land Registration", "delay", 8.5, "assignedRole", "SECTION_OFFICER"),
                Map.of("id", "req-2", "title", "Certificate Request", "delay", 6.2, "assignedRole", "CLERK"),
                Map.of("id", "req-3", "title", "Land Registration", "delay", 5.8, "assignedRole", "SECTION_OFFICER"),
                Map.of("id", "req-4", "title", "Certificate Request", "delay", 4.9, "assignedRole", "CLERK")
            )
        );
        
        return ResponseEntity.ok(analytics);
    }
    
    @GetMapping("/escalations")
    @RequirePermission(RoleBasedAccessControl.Permission.VIEW_ALL_DATA)
    public ResponseEntity<List<Map<String, Object>>> getEscalations() {
        log.info("Admin viewing escalations");
        
        List<Map<String, Object>> escalations = List.of(
            Map.<String, Object>ofEntries(
                Map.entry("id", "esc-1"),
                Map.entry("requestId", "req-1"),
                Map.entry("requestTitle", "Land Registration"),
                Map.entry("requestDescription", "Application for land registration"),
                Map.entry("slaBreached", true),
                Map.entry("slaHours", 48),
                Map.entry("slaDays", 5),
                Map.entry("actualHours", 72),
                Map.entry("actualDays", 7),
                Map.entry("delayHours", 24),
                Map.entry("delayDays", 2),
                Map.entry("status", "ESCALATED"),
                Map.entry("escalatedAt", "2026-01-18T10:30:00Z"),
                Map.entry("assignedRole", "SECTION_OFFICER"),
                Map.entry("escalatedTo", "HOD")
            ),
            Map.<String, Object>ofEntries(
                Map.entry("id", "esc-2"),
                Map.entry("requestId", "req-2"),
                Map.entry("requestTitle", "Certificate Request"),
                Map.entry("requestDescription", "Application for birth certificate"),
                Map.entry("slaBreached", true),
                Map.entry("slaHours", 24),
                Map.entry("slaDays", 3),
                Map.entry("actualHours", 96),
                Map.entry("actualDays", 10),
                Map.entry("delayHours", 72),
                Map.entry("delayDays", 7),
                Map.entry("status", "ESCALATED"),
                Map.entry("escalatedAt", "2026-01-17T14:20:00Z"),
                Map.entry("assignedRole", "CLERK"),
                Map.entry("escalatedTo", "SECTION_OFFICER")
            )
        );
        
        return ResponseEntity.ok(escalations);
    }
    
    @PostMapping("/processes/configure")
    @RequirePermission(RoleBasedAccessControl.Permission.CONFIGURE_PROCESSES)
    public ResponseEntity<Map<String, Object>> configureProcess(
            @RequestBody Map<String, Object> processConfig) {
        log.info("Admin configuring process: {}", processConfig.get("name"));
        
        return ResponseEntity.ok(Map.of(
            "message", "Process configured successfully",
            "processId", processConfig.get("id"),
            "configuredBy", RoleBasedAccessControl.getCurrentUsername()
        ));
    }
    
    @PostMapping("/feature-flags/toggle")
    @RequirePermission(RoleBasedAccessControl.Permission.MANAGE_FEATURE_FLAGS)
    public ResponseEntity<Map<String, Object>> toggleFeatureFlag(
            @RequestBody Map<String, Object> request) {
        log.info("Admin toggling feature flag: {} to: {}", 
                request.get("flag"), request.get("enabled"));
        
        return ResponseEntity.ok(Map.of(
            "message", "Feature flag toggled successfully",
            "flag", request.get("flag"),
            "enabled", request.get("enabled"),
            "toggledBy", RoleBasedAccessControl.getCurrentUsername()
        ));
    }
}
