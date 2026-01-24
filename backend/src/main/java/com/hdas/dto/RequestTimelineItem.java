package com.hdas.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestTimelineItem {
    private Instant timestamp;
    private String eventType;
    private String description;
    private String user;
}
