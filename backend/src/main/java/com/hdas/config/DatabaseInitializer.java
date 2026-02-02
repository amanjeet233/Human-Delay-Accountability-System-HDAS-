package com.hdas.config;

import com.hdas.domain.user.Role;
import com.hdas.domain.user.User;
import com.hdas.repository.RoleRepository;
import com.hdas.repository.UserRepository;
import com.hdas.service.FeatureFlagService;
import com.hdas.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Configuration
@Profile("!test")
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {
    
    private final UserService userService;
    private final FeatureFlagService featureFlagService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final Environment environment;
    
    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=== HDAS Database Initialization Started ===");

        // ALWAYS initialize roles (required for system to function)
        initializeDefaultRoles();

        // ALWAYS ensure admin user exists with correct configuration
        initializeAdminUser();

        // Conditionally seed sample users only in dev profile
        boolean isDevProfile = isDevProfile();
        if (isDevProfile) {
            initializeSampleUsers();
        } else {
            log.info("Skipping sample user creation (not in dev profile)");
        }

        // Initialize feature flags with all features disabled
        initializeFeatureFlags();

        log.info("=== HDAS Database Initialization Completed ===");
    }
    
    private void initializeAdminUser() {
        // Create or update admin user with proper configuration
        // Password: admin123 (BCrypt hashed with strength 12)
        String adminPassword = environment.getProperty("HDAS_ADMIN_PASSWORD", "admin123");
        
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Default ADMIN role is missing during initialization"));
        
        // Check if admin user exists
        java.util.Optional<User> existingAdmin = userRepository.findByUsername("admin");
        
        if (existingAdmin.isEmpty()) {
            // Create new admin user
            User adminUser = User.builder()
                    .username("admin")
                    .email("admin@hdas.local")
                    .passwordHash(passwordEncoder.encode(adminPassword))
                    .firstName("System")
                    .lastName("Administrator")
                    .department("Administration")
                    .active(true)
                    .status(com.hdas.domain.user.UserStatus.ACTIVE)
                    .mustChangePassword(false)
                    .roles(new java.util.HashSet<>(Set.of(adminRole)))
                    .build();

            userService.createUser(adminUser);
            log.info("✓ Created admin user (username: admin, status: ACTIVE, mustChangePassword: false)");
        } else {
            // Update existing admin user to ensure correct configuration
            User admin = existingAdmin.get();
            boolean updated = false;
            
            // Ensure admin has ADMIN role
            if (admin.getRoles() == null || admin.getRoles().stream().noneMatch(r -> "ADMIN".equals(r.getName()))) {
                Set<Role> roles = admin.getRoles() != null ? new java.util.HashSet<>(admin.getRoles()) : new java.util.HashSet<>();
                roles.add(adminRole);
                admin.setRoles(roles);
                updated = true;
                log.info("✓ Added ADMIN role to existing admin user");
            }
            
            // Ensure admin is active
            if (!Boolean.TRUE.equals(admin.getActive())) {
                admin.setActive(true);
                updated = true;
                log.info("✓ Activated admin user");
            }
            
            // Ensure admin status is ACTIVE
            if (admin.getStatus() != com.hdas.domain.user.UserStatus.ACTIVE) {
                admin.setStatus(com.hdas.domain.user.UserStatus.ACTIVE);
                updated = true;
                log.info("✓ Set admin status to ACTIVE");
            }
            
            // Ensure admin doesn't need to change password
            if (Boolean.TRUE.equals(admin.getMustChangePassword())) {
                admin.setMustChangePassword(false);
                updated = true;
                log.info("✓ Disabled mustChangePassword for admin user");
            }
            
            if (updated) {
                userRepository.save(admin);
                log.info("✓ Updated admin user configuration");
            } else {
                log.info("✓ Admin user already correctly configured");
            }
        }
    }
    
    private void initializeDefaultRoles() {
        // Only create roles, no demo data
        List<Role> defaultRoles = List.of(
            Role.builder()
                    .name("CITIZEN")
                    .description("Citizen - Can submit and track service requests")
                    .permissions(new java.util.HashSet<>(Set.of("READ_OWN_REQUESTS", "CREATE_REQUESTS", "UPDATE_OWN_REQUESTS")))
                    .build(),
                    
            Role.builder()
                    .name("CLERK")
                    .description("Clerk - Can process assigned tasks and update request status")
                    .permissions(new java.util.HashSet<>(Set.of("READ_ASSIGNED_TASKS", "UPDATE_TASKS", "CREATE_COMMENTS")))
                    .build(),
                    
            Role.builder()
                    .name("SECTION_OFFICER")
                    .description("Section Officer - Can manage team, handle escalations, and approve requests")
                    .permissions(new java.util.HashSet<>(Set.of("READ_TEAM_TASKS", "MANAGE_TEAM", "HANDLE_ESCALATIONS", "APPROVE_REQUESTS")))
                    .build(),
                    
            Role.builder()
                    .name("HOD")
                    .description("Head of Department - Can manage department, review escalations, and configure processes")
                    .permissions(new java.util.HashSet<>(Set.of("MANAGE_DEPARTMENT", "REVIEW_ESCALATIONS", "CONFIGURE_PROCESSES")))
                    .build(),
                    
            Role.builder()
                    .name("ADMIN")
                    .description("Administrator - Full system access and configuration")
                    .permissions(new java.util.HashSet<>(Set.of("ALL_PERMISSIONS")))
                    .build(),
                    
            Role.builder()
                    .name("AUDITOR")
                    .description("Auditor - Can view audit logs, generate compliance reports, and manage legal holds")
                    .permissions(new java.util.HashSet<>(Set.of("READ_AUDIT_LOGS", "GENERATE_COMPLIANCE_REPORTS", "MANAGE_LEGAL_HOLDS")))
                    .build()
        );
        
        int createdCount = 0;
        for (Role role : defaultRoles) {
            if (!roleRepository.existsByName(role.getName())) {
                userService.createRole(role);
                createdCount++;
            }
        }
        
        if (createdCount > 0) {
            log.info("Created {} missing default roles", createdCount);
        } else {
            log.info("Default roles already present, skipping creation");
        }
    }
    
    private void initializeSampleUsers() {
        // Only create sample users in dev profile when database is empty (except admin)
        if (userService.getUserCount() <= 1) {
            Role citizenRole = roleRepository.findByName("CITIZEN")
                .orElseThrow(() -> new IllegalStateException("CITIZEN role is missing during initialization"));
            Role clerkRole = roleRepository.findByName("CLERK")
                .orElseThrow(() -> new IllegalStateException("CLERK role is missing during initialization"));
            Role soRole = roleRepository.findByName("SECTION_OFFICER")
                .orElseThrow(() -> new IllegalStateException("SECTION_OFFICER role is missing during initialization"));
            Role hodRole = roleRepository.findByName("HOD")
                .orElseThrow(() -> new IllegalStateException("HOD role is missing during initialization"));
            Role auditorRole = roleRepository.findByName("AUDITOR")
                .orElseThrow(() -> new IllegalStateException("AUDITOR role is missing during initialization"));

            List<User> sampleUsers = List.of(
                // Sample Clerk
                User.builder()
                    .username("clerk1")
                    .email("clerk1@hdas.local")
                    .passwordHash(passwordEncoder.encode("clerk123"))
                    .firstName("John")
                    .lastName("Clerk")
                    .department("Processing")
                    .active(true)
                    .roles(new java.util.HashSet<>(Set.of(clerkRole)))
                    .build(),
                
                // Sample Section Officer
                User.builder()
                    .username("so1")
                    .email("so1@hdas.local")
                    .passwordHash(passwordEncoder.encode("so123"))
                    .firstName("Jane")
                    .lastName("Officer")
                    .department("Processing")
                    .active(true)
                    .roles(new java.util.HashSet<>(Set.of(soRole)))
                    .build(),
                
                // Sample HOD
                User.builder()
                    .username("hod1")
                    .email("hod1@hdas.local")
                    .passwordHash(passwordEncoder.encode("hod123"))
                    .firstName("Bob")
                    .lastName("Department")
                    .department("Processing")
                    .active(true)
                    .roles(new java.util.HashSet<>(Set.of(hodRole)))
                    .build(),
                
                // Sample Auditor
                User.builder()
                    .username("auditor1")
                    .email("auditor1@hdas.local")
                    .passwordHash(passwordEncoder.encode("auditor123"))
                    .firstName("Alice")
                    .lastName("Auditor")
                    .department("Audit")
                    .active(true)
                    .roles(new java.util.HashSet<>(Set.of(auditorRole)))
                    .build(),
                
                // Sample Citizens
                User.builder()
                    .username("citizen1")
                    .email("citizen1@example.com")
                    .passwordHash(passwordEncoder.encode("citizen123"))
                    .firstName("Charlie")
                    .lastName("Citizen")
                    .department("General")
                    .active(true)
                    .roles(new java.util.HashSet<>(Set.of(citizenRole)))
                    .build(),
                    
                User.builder()
                    .username("citizen2")
                    .email("citizen2@example.com")
                    .passwordHash(passwordEncoder.encode("citizen123"))
                    .firstName("Diana")
                    .lastName("Citizen")
                    .department("General")
                    .active(true)
                    .roles(new java.util.HashSet<>(Set.of(citizenRole)))
                    .build()
            );
            
            for (User user : sampleUsers) {
                userService.createUser(user);
            }
            
            log.info("Created {} sample users for testing (dev profile)", sampleUsers.size());
        } else {
            log.info("Users already exist, skipping sample user creation");
        }
    }
    
    private void initializeFeatureFlags() {
        // Initialize feature flags with all features disabled by default
        featureFlagService.initializeDefaultFeatureFlags();
        log.info("Initialized default feature flags with all features disabled");
    }

    private boolean isDevProfile() {
        for (String profile : environment.getActiveProfiles()) {
            if ("dev".equalsIgnoreCase(profile)) {
                return true;
            }
        }
        return false;
    }
}
