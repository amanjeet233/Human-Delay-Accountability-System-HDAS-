package com.hdas.service;

import com.hdas.domain.user.User;
import com.hdas.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * UserDetailsService implementation for HDAS
 * 
 * Critical: ROLE_ Prefix Handling
 * - Database stores roles WITHOUT prefix (e.g., "ADMIN", "CLERK", "CITIZEN")
 * - This service ADDS "ROLE_" prefix during authentication (line 53)
 * - Spring Security requires ROLE_ prefix for hasRole() checks
 * - Security config uses hasRole("ADMIN") which internally checks for "ROLE_ADMIN"
 * 
 * Authentication Flow:
 * 1. User logs in with username/password
 * 2. DaoAuthenticationProvider calls loadUserByUsername()
 * 3. We fetch user from database and build authorities
 * 4. Roles converted: "ADMIN" -> "ROLE_ADMIN", "CLERK" -> "ROLE_CLERK"
 * 5. UserDetails returned with BCrypt password hash for verification
 * 6. Password verified, session created with authorities
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Loading user details for authentication attempt: {}", username);
        
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> {
                log.error("Authentication failed - User not found in database: {}", username);
                return new UsernameNotFoundException("User not found: " + username);
            });
        
        // Check if user is active
        if (!user.getActive()) {
            log.error("Authentication failed - User account is inactive: {} (active={})", username, user.getActive());
            throw new UsernameNotFoundException("User account is disabled: " + username);
        }
        
        // Check user status
        if (user.getStatus() != com.hdas.domain.user.UserStatus.ACTIVE) {
            log.error("Authentication failed - User status is not ACTIVE: {} (status={})", username, user.getStatus());
            throw new UsernameNotFoundException("User account status is invalid: " + username);
        }
        
        // Check if user has roles
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            log.error("Authentication failed - User has no roles assigned: {}", username);
            throw new UsernameNotFoundException("User has no roles assigned: " + username);
        }
        
        Collection<? extends GrantedAuthority> authorities = getAuthorities(user);
        log.info("User {} loaded successfully with {} authorities and {} roles", 
            username, authorities.size(), user.getRoles().size());
        
        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getUsername())
            .password(user.getPasswordHash()) // BCrypt hash from database
            .authorities(authorities)
            .accountExpired(false)
            .accountLocked(false)
            .credentialsExpired(false)
            .disabled(!user.getActive())
            .build();
    }
    
    /**
     * Builds authorities from user's roles and permissions
     * CRITICAL: Adds ROLE_ prefix to role names
     */
    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        Set<SimpleGrantedAuthority> authorities = new java.util.HashSet<>();
        
        // Add role-based authorities with ROLE_ prefix
        // Database has "ADMIN" -> We create "ROLE_ADMIN"
        user.getRoles().stream()
            .filter(role -> role.getActive())
            .forEach(role -> {
                String authority = "ROLE_" + role.getName();
                authorities.add(new SimpleGrantedAuthority(authority));
                log.trace("Added authority: {}", authority);
            });
        
        // Collect role names and permissions for derived authorities
        Set<String> roleNames = user.getRoles().stream()
            .filter(role -> role.getActive())
            .map(role -> role.getName())
            .collect(Collectors.toSet());

        Set<String> permissions = user.getRoles().stream()
            .filter(role -> role.getActive())
            .flatMap(role -> role.getPermissions().stream())
            .collect(Collectors.toSet());

        // Add permission-based authorities (no ROLE_ prefix for permissions)
        permissions.forEach(permission -> authorities.add(new SimpleGrantedAuthority(permission)));

        // Add derived CRUD authorities based on permissions
        addDerivedAuthorities(authorities, roleNames, permissions);
        
        return authorities;
    }

    /**
     * Adds derived CRUD authorities based on role permissions
     * Used for fine-grained access control
     */
    private void addDerivedAuthorities(Set<SimpleGrantedAuthority> authorities, 
                                      Set<String> roleNames, 
                                      Set<String> permissions) {
        boolean hasAllPermissions = permissions.contains("ALL_PERMISSIONS");
        boolean isAdminRole = roleNames.contains("ADMIN");

        boolean hasElevatedPermission = permissions.stream().anyMatch(p ->
            p.startsWith("MANAGE_") ||
            p.startsWith("CONFIGURE_") ||
            p.startsWith("HANDLE_") ||
            p.startsWith("APPROVE_") ||
            p.startsWith("REVIEW_") ||
            p.startsWith("GENERATE_")
        );

        // Admin gets all CRUD authorities
        if (hasAllPermissions || isAdminRole) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_READ"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_CREATE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_UPDATE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_DELETE"));

            authorities.add(new SimpleGrantedAuthority("ROLE_USER_READ"));
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_CREATE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_UPDATE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_DELETE"));
            return;
        }

        // Grant user CRUD authorities based on permission prefixes
        if (permissions.stream().anyMatch(p -> p.startsWith("READ_")) || hasElevatedPermission) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_READ"));
        }
        if (permissions.stream().anyMatch(p -> p.startsWith("CREATE_")) || hasElevatedPermission) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_CREATE"));
        }
        if (permissions.stream().anyMatch(p -> 
            p.startsWith("UPDATE_") || p.startsWith("APPROVE_") || 
            p.startsWith("HANDLE_") || p.startsWith("MANAGE_") || 
            p.startsWith("CONFIGURE_") || p.startsWith("REVIEW_")) || hasElevatedPermission) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_UPDATE"));
        }
        if (permissions.stream().anyMatch(p -> p.startsWith("DELETE_"))) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER_DELETE"));
        }

        // Grant admin CRUD (read-only for elevated permissions)
        if (hasElevatedPermission) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_READ"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_CREATE"));
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN_UPDATE"));
        }
    }
}
