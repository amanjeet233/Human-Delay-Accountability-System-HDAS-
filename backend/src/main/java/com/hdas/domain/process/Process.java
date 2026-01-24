package com.hdas.domain.process;

import com.hdas.domain.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "processes", indexes = {
    @Index(name = "idx_process_name", columnList = "name"),
    @Index(name = "idx_process_version", columnList = "name,version")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Process extends BaseEntity {
    
    @NotBlank
    @Column(nullable = false, length = 200)
    private String name;
    
    @NotBlank
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String version = "v1";
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @NotNull
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @OneToMany(mappedBy = "process", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceOrder ASC")
    @Builder.Default
    private List<ProcessStep> steps = new ArrayList<>();
}
