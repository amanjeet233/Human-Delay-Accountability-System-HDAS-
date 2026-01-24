package com.hdas.domain.request;

import com.hdas.domain.assignment.Assignment;
import com.hdas.domain.common.BaseEntity;
import com.hdas.domain.process.Process;
import com.hdas.domain.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "requests", indexes = {
    @Index(name = "idx_request_process", columnList = "process_id"),
    @Index(name = "idx_request_creator", columnList = "created_by_id"),
    @Index(name = "idx_request_status", columnList = "status"),
    @Index(name = "idx_request_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Request extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "process_id", nullable = false)
    @NotNull
    private Process process;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    @NotNull
    private User createdBy;
    
    @NotBlank
    @Column(nullable = false, length = 500)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotBlank
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "PENDING";
    
    @Column(nullable = false)
    @Builder.Default
    private Instant startedAt = Instant.now();
    
    @Column
    private Instant completedAt;
    
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FileAttachment> attachments = new ArrayList<>();
    
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<Assignment> assignments = new ArrayList<>();
}
