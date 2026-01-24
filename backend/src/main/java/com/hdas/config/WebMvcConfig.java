package com.hdas.config;

import com.hdas.security.RoleBasedSecurityInterceptor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@Profile("!simple")
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {
    
    private final RoleBasedSecurityInterceptor roleBasedSecurityInterceptor;
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(roleBasedSecurityInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/api/auth/health");
    }
}
