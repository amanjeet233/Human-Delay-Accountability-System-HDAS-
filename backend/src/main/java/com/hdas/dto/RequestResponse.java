package com.hdas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestResponse {
    private String id;
    private String title;
    private String description;
    private String status;
    private String processId;
    private String createdBy;
    private LocalDateTime createdAt;
    private String priority;
    private String category;
}
