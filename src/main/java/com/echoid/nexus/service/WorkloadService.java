package com.echoid.nexus.service;

import com.echoid.nexus.dto.WorkloadDto;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class WorkloadService {

    /**
     * Real formula: Wd = Σ Ci/Ti where Ci is the effective complexity
     * (professor override if set, otherwise AI score) and Ti is
     * hours remaining until due date.
     */
    public WorkloadDto getWorkload(UUID assignmentId) {
        return WorkloadDto.builder()
                .assignmentId(assignmentId)
                .aiComplexityScore(3.5)
                .dueAt(OffsetDateTime.now().plusDays(3))
                .hoursRemaining(72)
                .workloadIndex(0.048)
                .build();
    }
}
