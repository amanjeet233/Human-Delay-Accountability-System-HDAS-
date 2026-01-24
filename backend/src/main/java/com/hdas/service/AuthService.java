package com.hdas.service;

import com.hdas.domain.user.User;
import com.hdas.dto.AuthRequest;
import com.hdas.dto.AuthResponse;
import com.hdas.repository.UserRepository;
import com.hdas.service.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    // Hardcoded admin credentials (keep in code, NOT in database)
    private static final String HARDCODED_ADMIN_USERNAME = "admin";
    private static final String HARDCODED_ADMIN_PASSWORD = "admin123";
    private static final String HARDCODED_ADMIN_EMAIL = "admin@hdas.local";
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    
    @Transactional
    public AuthResponse authenticate(AuthRequest request) {
        log.info("[TRACE_START] AuthService - Authentication attempt for user: {}", request.getUsername());
        
        try {
            // First, try to authenticate against hardcoded admin credentials
            if (HARDCODED_ADMIN_USERNAME.equals(request.getUsername()) &&
                HARDCODED_ADMIN_PASSWORD.equals(request.getPassword())) {

                log.info("[TRACE_INFO] AuthService - Hardcoded admin credentials matched for user: {}", request.getUsername());

                // Set primary role and prepare claims (JWT will include only the primary role claim)
                String primaryAdminRole = "ADMIN";
                Map<String, Object> extraClaimsAdmin = new HashMap<>();
                extraClaimsAdmin.put("role", primaryAdminRole);

                // Generate token for hardcoded admin (token will include only primary role claim)
                String token = jwtService.generateToken(extraClaimsAdmin, new org.springframework.security.core.userdetails.User(
                    HARDCODED_ADMIN_USERNAME,
                    HARDCODED_ADMIN_PASSWORD,
                    org.springframework.security.core.authority.AuthorityUtils.createAuthorityList("ROLE_ADMIN")
                ));

                log.info("[TRACE_END] AuthService - Hardcoded admin authenticated successfully");

                Set<String> adminRoles = new HashSet<>();
                adminRoles.add(primaryAdminRole);

                Set<String> adminPermissions = new HashSet<>();
                adminPermissions.add("ALL_PERMISSIONS");

                return AuthResponse.builder()
                    .token(token)
                    .username(HARDCODED_ADMIN_USERNAME)
                    .email(HARDCODED_ADMIN_EMAIL)
                    .role(primaryAdminRole)  // Single role for frontend routing
                    .isSystemAdmin(true)
                    .build();
            }
            
            // Otherwise, authenticate against database users
            log.info("[TRACE_INFO] AuthService - Checking database for user: {}", request.getUsername());

            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());

            User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

            // Extract user's roles and determine primary role
            Set<String> userRoles = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet());

            String primaryRole = userRoles.stream().findFirst().orElse("CITIZEN");

            // Prepare JWT claims to include only primary role
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("role", primaryRole);

            // Generate token (will contain only primary role in claims)
            String token = jwtService.generateToken(extraClaims, userDetails);

            log.info("[TRACE_END] AuthService - Database user authenticated successfully: {} with primary role: {}", request.getUsername(), primaryRole);

            return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .role(primaryRole)  // Single role for frontend routing
                .isSystemAdmin(false)
                .build();
                
        } catch (Exception e) {
            log.error("[TRACE_ERROR] AuthService - Authentication failed for user: {}", request.getUsername(), e);
            throw new RuntimeException("Authentication failed: Invalid credentials", e);
        }
    }
}
