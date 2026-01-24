package com.hdas.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class RoleBasedSecurityInterceptor implements HandlerInterceptor {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            
            // Check role-based access
            RequireRole requireRole = handlerMethod.getMethodAnnotation(RequireRole.class);
            if (requireRole != null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (!RoleBasedAccessControl.hasAnyRole(authentication, requireRole.value())) {
                    log.warn("Access denied for user {} to method {}. Required roles: {}", 
                            RoleBasedAccessControl.getCurrentUsername(),
                            handlerMethod.getMethod().getName(),
                            java.util.Arrays.toString(requireRole.value()));
                    
                    sendErrorResponse(response, "ACCESS_DENIED", "You don't have permission to access this resource", HttpServletResponse.SC_FORBIDDEN);
                    return false;
                }
            }
            
            // Check permission-based access
            RequirePermission requirePermission = handlerMethod.getMethodAnnotation(RequirePermission.class);
            if (requirePermission != null) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                for (RoleBasedAccessControl.Permission permission : requirePermission.value()) {
                    if (!RoleBasedAccessControl.hasPermission(authentication, permission)) {
                        log.warn("Access denied for user {} to method {}. Required permission: {}", 
                                RoleBasedAccessControl.getCurrentUsername(),
                                handlerMethod.getMethod().getName(),
                                permission.getPermissionName());
                        
                        sendErrorResponse(response, "ACCESS_DENIED", "You don't have permission to perform this action", HttpServletResponse.SC_FORBIDDEN);
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    private void sendErrorResponse(HttpServletResponse response, String error, String message, int status) throws Exception {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", error);
        errorResponse.put("message", message);
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("path", "");
        
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }
}
