package com.echoid.nexus.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkloadDto {

    private UUID assignmentId;
    private double aiComplexityScore;
    private OffsetDateTime dueAt;
    private long hoursRemaining;
    private double workloadIndex;
}
