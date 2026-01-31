package com.hdas.controller;

import com.hdas.domain.request.FileAttachment;
import com.hdas.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class FileAttachmentController {
    
    private final FileStorageService fileStorageService;
    
    @PostMapping("/{requestId}/attachments")
    @PreAuthorize("hasRole('CITIZEN')")
        public ResponseEntity<FileAttachment> uploadFile(
            @PathVariable @NonNull UUID requestId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            HttpServletRequest httpRequest) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && 
            !contentType.startsWith("application/pdf") && 
            !contentType.startsWith("application/msword") &&
            !contentType.startsWith("application/vnd.openxmlformats-officedocument"))) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        }
        
        // Validate file size (10MB max)
        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).build();
        }
        
        FileAttachment attachment = fileStorageService.storeFile(Objects.requireNonNull(requestId), file, description, httpRequest);
        return ResponseEntity.ok(attachment);
    }
    
    @GetMapping("/{requestId}/attachments")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<List<FileAttachment>> getAttachments(@PathVariable @NonNull UUID requestId) {
        return ResponseEntity.ok(fileStorageService.getAttachmentsByRequestId(Objects.requireNonNull(requestId)));
    }
    
    @GetMapping("/attachments/{id}/download")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<org.springframework.core.io.Resource> downloadFile(@PathVariable @NonNull UUID id) {
        return fileStorageService.downloadFile(Objects.requireNonNull(id));
    }
}
