package com.hdas.security;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
public class RoleBasedAccessControl {
    private final com.hdas.repository.RoleRepository roleRepository;

    public RoleBasedAccessControl(com.hdas.repository.RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
    
    public enum SystemRole {
        CITIZEN("CITIZEN"),
        CLERK("CLERK"),
        SECTION_OFFICER("SECTION_OFFICER"),
        HOD("HOD"),
        ADMIN("ADMIN"),
        AUDITOR("AUDITOR");
        
        private final String roleName;
        
        SystemRole(String roleName) {
            this.roleName = roleName;
        }
        
        public String getRoleName() {
            return roleName;
        }
        
        public static SystemRole fromString(String roleName) {
            return Arrays.stream(values())
                    .filter(role -> role.roleName.equals(roleName))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Unknown role: " + roleName));
        }
    }
    
    public enum Permission {
        // Citizen Permissions
        CREATE_REQUEST("CREATE_REQUEST"),
        UPLOAD_DOCUMENTS("UPLOAD_DOCUMENTS"),
        VIEW_OWN_REQUESTS("VIEW_OWN_REQUESTS"),
        
        // Clerk Permissions
        VIEW_ASSIGNED_REQUESTS("VIEW_ASSIGNED_REQUESTS"),
        VERIFY_REQUEST("VERIFY_REQUEST"),
        FORWARD_REQUEST("FORWARD_REQUEST"),
        ADD_DELAY_REASON("ADD_DELAY_REASON"),
        
        // Section Officer Permissions
        APPROVE_REQUEST("APPROVE_REQUEST"),
        REJECT_REQUEST("REJECT_REQUEST"),
        VIEW_ESCALATION_ALERTS("VIEW_ESCALATION_ALERTS"),
        
        // HOD Permissions
        FINAL_APPROVE("FINAL_APPROVE"),
        FINAL_REJECT("FINAL_REJECT"),
        HANDLE_ESCALATIONS("HANDLE_ESCALATIONS"),
        VIEW_DEPARTMENT_SUMMARY("VIEW_DEPARTMENT_SUMMARY"),
        
        // Admin Permissions (Full Authority)
        CREATE_USERS("CREATE_USERS"),
        UPDATE_USERS("UPDATE_USERS"),
        DELETE_USERS("DELETE_USERS"),
        ASSIGN_ROLES("ASSIGN_ROLES"),
        CONFIGURE_PROCESSES("CONFIGURE_PROCESSES"),
        MANAGE_FEATURE_FLAGS("MANAGE_FEATURE_FLAGS"),
        VIEW_ALL_DATA("VIEW_ALL_DATA"),
        VIEW_ANALYTICS("VIEW_ANALYTICS"),
        
        // Auditor Permissions (Read-only)
        VIEW_AUDIT_LOGS("VIEW_AUDIT_LOGS"),
        VIEW_DELAY_REPORTS("VIEW_DELAY_REPORTS"),
        EXPORT_DATA("EXPORT_DATA");
        
        private final String permissionName;
        
        Permission(String permissionName) {
            this.permissionName = permissionName;
        }
        
        public String getPermissionName() {
            return permissionName;
        }
    }
    
    // Role-Permission mapping now sourced from DB via Role entity
    private List<String> getPermissionCodesForRoleName(String roleName) {
        return roleRepository.findByName(roleName)
                .map(r -> new java.util.ArrayList<>(r.getPermissions()))
                .orElseGet(java.util.ArrayList::new);
    }
    
    public boolean hasPermission(Authentication authentication, Permission permission) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Set<String> userRoles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .collect(Collectors.toSet());
        
        for (String roleName : userRoles) {
            try {
                // Fetch permissions from DB for each role
                List<String> codes = getPermissionCodesForRoleName(roleName);
                if (codes.contains(permission.getPermissionName())) {
                    return true;
                }
            } catch (IllegalArgumentException e) {
                log.warn("Unknown role found: {}", roleName);
            }
        }
        
        return false;
    }
    
    public static boolean hasAnyRole(Authentication authentication, SystemRole... roles) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        Set<String> userRoles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .collect(Collectors.toSet());
        
        return Arrays.stream(roles)
                .anyMatch(role -> userRoles.contains(role.getRoleName()));
    }
    
    public static SystemRole getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        
        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .findFirst()
                .map(roleName -> {
                    try {
                        return SystemRole.fromString(roleName);
                    } catch (IllegalArgumentException e) {
                        log.warn("Unknown role found: {}", roleName);
                        return null;
                    }
                })
                .orElse(null);
    }
    
    public static String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }
    
    public static boolean canAccessDashboard(SystemRole requiredRole) {
        SystemRole currentUserRole = getCurrentUserRole();
        return currentUserRole != null && currentUserRole == requiredRole;
    }
}
