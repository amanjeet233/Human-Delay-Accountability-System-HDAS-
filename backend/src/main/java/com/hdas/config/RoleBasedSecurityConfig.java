package com.hdas.config;

import com.hdas.security.JwtAuthenticationEntryPoint;
import com.hdas.security.JwtAuthenticationFilter;
import com.hdas.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Primary
public class RoleBasedSecurityConfig {

    private final JwtService jwtService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public RoleBasedSecurityConfig(JwtService jwtService, JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtService = jwtService;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(DaoAuthenticationProvider authenticationProvider) {
        return new ProviderManager(authenticationProvider);
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtService);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/actuator/info").permitAll()

                // Admin access (ADMIN only)
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // Auditor (read-only) and HOD access where applicable
                .requestMatchers("/api/auditor/**").hasRole("AUDITOR")
                .requestMatchers("/api/audit/**").hasRole("AUDITOR")
                .requestMatchers("/api/compliance/**").hasRole("AUDITOR")

                // HOD access
                .requestMatchers("/api/hod/**").hasRole("HOD")
                .requestMatchers("/api/escalations/**").hasRole("HOD")
                .requestMatchers("/api/department/**").hasRole("HOD")

                // Section Officer access
                .requestMatchers("/api/so/**").hasRole("SECTION_OFFICER")
                .requestMatchers("/api/section-officer/**").hasRole("SECTION_OFFICER")
                .requestMatchers("/api/team/**").hasRole("SECTION_OFFICER")
                .requestMatchers("/api/tasks/assign/**").hasRole("SECTION_OFFICER")

                // Clerk access
                .requestMatchers("/api/clerk/**").hasRole("CLERK")
                .requestMatchers("/api/tasks/my/**").hasRole("CLERK")
                .requestMatchers("/api/tasks/**").hasRole("CLERK")

                // Citizen access
                .requestMatchers("/api/citizen/**").hasRole("CITIZEN")
                .requestMatchers("/api/requests/**").hasRole("CITIZEN")
                .requestMatchers("/api/processes/**").hasRole("CITIZEN")

                // Feature flag protected endpoints
                .requestMatchers("/api/accountability/**").hasRole("HOD")
                .requestMatchers("/api/governance/**").hasRole("AUDITOR")

                // Dashboard access - strict per-role
                .requestMatchers("/api/dashboard/citizen/**").hasRole("CITIZEN")
                .requestMatchers("/api/dashboard/clerk/**").hasRole("CLERK")
                .requestMatchers("/api/dashboard/section-officer/**").hasRole("SECTION_OFFICER")
                .requestMatchers("/api/dashboard/hod/**").hasRole("HOD")
                .requestMatchers("/api/dashboard/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/dashboard/auditor/**").hasRole("AUDITOR")

                // Default deny
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
