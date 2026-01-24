package com.hdas.domain.request;

import com.hdas.domain.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;


@Entity
@Table(name = "file_attachments", indexes = {
    @Index(name = "idx_attachment_request", columnList = "request_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileAttachment extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    @NotNull
    private Request request;
    
    @NotBlank
    @Column(nullable = false, length = 255)
    private String fileName;
    
    @NotBlank
    @Column(nullable = false, length = 100)
    private String contentType;
    
    @NotNull
    @Column(nullable = false)
    private Long fileSize;
    
    @NotBlank
    @Column(nullable = false, length = 500)
    private String storagePath;
    
    @Column(length = 500)
    private String description;
}
