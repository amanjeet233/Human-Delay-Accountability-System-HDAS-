package com.hdas.service;

import com.hdas.domain.request.FileAttachment;
import com.hdas.domain.request.Request;
import com.hdas.repository.FileAttachmentRepository;
import com.hdas.repository.RequestRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FileStorageService {
    
    private final FileAttachmentRepository fileAttachmentRepository;
    private final RequestRepository requestRepository;
    private final AuditService auditService;
    
    private static final String UPLOAD_DIR = "uploads";
    
    @Transactional
    public FileAttachment storeFile(UUID requestId, MultipartFile file, String description, HttpServletRequest httpRequest) {
        Request request = requestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
            String storedFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(storedFilename);
            
            // Save file
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Create attachment record
            FileAttachment attachment = FileAttachment.builder()
                .request(request)
                .fileName(originalFilename != null ? originalFilename : "unknown")
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .storagePath(filePath.toString())
                .description(description)
                .build();
            
            attachment = fileAttachmentRepository.save(attachment);
            
            auditService.logWithRequest("UPLOAD_FILE", "FileAttachment", attachment.getId(),
                null, originalFilename, "File uploaded: " + originalFilename, httpRequest);
            
            return attachment;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }
    
    public ResponseEntity<Resource> downloadFile(UUID id) {
        FileAttachment attachment = fileAttachmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("File not found"));
        
        try {
            Path filePath = Paths.get(attachment.getStoragePath());
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + attachment.getFileName() + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
