package com.hdas.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.NoHandlerFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import com.hdas.exception.FeatureDisabledException;

@ControllerAdvice
public class ConfigGlobalExceptionHandler {

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoHandlerFoundException ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
            String.valueOf(HttpStatus.NOT_FOUND.value()),
            "NOT_FOUND",
            "The requested resource was not found",
            request != null ? request.getRequestURI() : "unknown"
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
            String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()),
            "INTERNAL_ERROR",
            "An unexpected error occurred",
            request != null ? request.getRequestURI() : "unknown"
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @ExceptionHandler(FeatureDisabledException.class)
    public ResponseEntity<ErrorResponse> handleFeatureDisabled(FeatureDisabledException ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
            String.valueOf(HttpStatus.FORBIDDEN.value()),
            "FEATURE_DISABLED",
            "Feature Coming Soon",
            request != null ? request.getRequestURI() : "unknown"
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
            String.valueOf(HttpStatus.BAD_REQUEST.value()),
            "VALIDATION_ERROR",
            ex.getMessage() != null ? ex.getMessage() : "Validation failed",
            request != null ? request.getRequestURI() : "unknown"
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ErrorResponse> handleSecurityException(SecurityException ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
            String.valueOf(HttpStatus.FORBIDDEN.value()),
            "ACCESS_DENIED",
            ex.getMessage() != null ? ex.getMessage() : "Access denied",
            request != null ? request.getRequestURI() : "unknown"
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
            String.valueOf(HttpStatus.FORBIDDEN.value()),
            "ACCESS_DENIED",
            "Access denied",
            request != null ? request.getRequestURI() : "unknown"
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex, HttpServletRequest request) {
        ErrorResponse response = new ErrorResponse(
            String.valueOf(HttpStatus.BAD_REQUEST.value()),
            "VALIDATION_ERROR",
            "Validation failed: " + (ex.getMessage() != null ? ex.getMessage() : "Validation constraints violated"),
            request != null ? request.getRequestURI() : "unknown"
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
