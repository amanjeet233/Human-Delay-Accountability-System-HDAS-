package com.hdas.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * HDAS Security Configuration
 * 
 * Authentication Flow:
 * 1. User submits credentials via /api/auth/login
 * 2. DaoAuthenticationProvider validates against database using BCrypt
 * 3. UserDetailsServiceImpl loads user from database and adds ROLE_ prefix to authorities
 * 4. Session created with Spring Security context
 * 5. All subsequent requests authenticated via session cookie
 * 
 * Authorization:
 * - Role names stored in database WITHOUT "ROLE_" prefix (e.g., "ADMIN", "CLERK")
 * - Spring Security automatically adds "ROLE_" prefix when checking authorities
 * - Use hasRole("ADMIN") in config, NOT hasRole("ROLE_ADMIN")
 * - UserDetailsService adds prefix during authentication
 * 
 * NO Hardcoded Users:
 * - All users come from database
 * - Default admin user created by DatabaseInitializer
 * - Passwords ALWAYS BCrypt hashed
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Primary
@Slf4j
public class RoleBasedSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12); // Strength 12 for production security
    }

    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }

    @Bean
    public AuthenticationManager authenticationManager(DaoAuthenticationProvider authenticationProvider) {
        log.info("Initializing AuthenticationManager with DaoAuthenticationProvider");
        return new ProviderManager(authenticationProvider);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService, 
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        authProvider.setHideUserNotFoundExceptions(false); // Better error messages
        log.info("Configured DaoAuthenticationProvider with BCrypt password encoder");
        return authProvider;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow frontend requests from multiple common development ports
        configuration.setAllowedOrigins(List.of(
            "http://localhost:3000",      // React default
            "http://localhost:3001",      // Alternative React port
            "http://localhost:5173",      // Vite default
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:5173"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        log.info("CORS configured for origins: localhost:3000, 3001, 5173");
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        log.info("Configuring Security Filter Chain");
        
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .sessionConcurrency(concurrency -> concurrency
                    .maximumSessions(-1) // Unlimited sessions per user
                    .sessionRegistry(sessionRegistry())
                )
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    log.warn("Unauthorized access attempt to: {}", request.getRequestURI());
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"success\":false,\"error\":\"UNAUTHORIZED\",\"message\":\"Authentication required\"}");
                })
                .accessDeniedHandler((request, response, accessDeniedException) -> {
                    log.warn("Access denied to: {} for user: {}", request.getRequestURI(), 
                        request.getUserPrincipal() != null ? request.getUserPrincipal().getName() : "anonymous");
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"success\":false,\"error\":\"FORBIDDEN\",\"message\":\"You do not have permission to access this resource\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // ========================================
                // PUBLIC ENDPOINTS (No authentication)
                // ========================================
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/health").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/actuator/health", "/actuator/info").permitAll()

                // ========================================
                // AUTHENTICATED ENDPOINTS
                // ========================================
                .requestMatchers("/api/auth/**").authenticated() // /me, /logout, /change-password require auth

                // ========================================
                // ROLE-BASED ACCESS CONTROL
                // Note: Database stores roles as "ADMIN", "CLERK", etc. (no ROLE_ prefix)
                // Spring Security auto-adds ROLE_ prefix, so use hasRole("ADMIN") here
                // ========================================
                
                // ADMIN - Full system access
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/dashboard/admin/**").hasRole("ADMIN")

                // AUDITOR - Read-only compliance monitoring
                .requestMatchers("/api/auditor/**").hasRole("AUDITOR")
                .requestMatchers("/api/audit/**").hasRole("AUDITOR")
                .requestMatchers("/api/compliance/**").hasRole("AUDITOR")
                .requestMatchers("/api/governance/**").hasRole("AUDITOR")
                .requestMatchers("/api/dashboard/auditor/**").hasRole("AUDITOR")

                // HOD - Head of Department management
                .requestMatchers("/api/hod/**").hasRole("HOD")
                .requestMatchers("/api/escalations/**").hasRole("HOD")
                .requestMatchers("/api/department/**").hasRole("HOD")
                .requestMatchers("/api/accountability/**").hasRole("HOD")
                .requestMatchers("/api/dashboard/hod/**").hasRole("HOD")

                // SECTION_OFFICER - Team & task management
                .requestMatchers("/api/so/**").hasRole("SECTION_OFFICER")
                .requestMatchers("/api/section-officer/**").hasRole("SECTION_OFFICER")
                .requestMatchers("/api/team/**").hasRole("SECTION_OFFICER")
                .requestMatchers("/api/tasks/assign/**").hasRole("SECTION_OFFICER")
                .requestMatchers("/api/dashboard/section-officer/**").hasRole("SECTION_OFFICER")

                // CLERK - Task execution
                .requestMatchers("/api/clerk/**").hasRole("CLERK")
                .requestMatchers("/api/tasks/my/**").hasAnyRole("CLERK","SECTION_OFFICER","HOD")
                .requestMatchers("/api/tasks/**").hasRole("CLERK")
                .requestMatchers("/api/dashboard/clerk/**").hasRole("CLERK")

                // CITIZEN - Request submission & tracking
                .requestMatchers("/api/citizen/**").hasRole("CITIZEN")
                .requestMatchers("/api/requests/**").hasRole("CITIZEN")
                .requestMatchers("/api/processes/**").hasRole("CITIZEN")
                .requestMatchers("/api/dashboard/citizen/**").hasRole("CITIZEN")

                // ========================================
                // DEFAULT DENY - All other requests require authentication
                // ========================================
                .anyRequest().authenticated()
            );

        log.info("Security Filter Chain configured successfully");
        return http.build();
    }
}
