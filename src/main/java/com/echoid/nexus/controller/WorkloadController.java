package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.WorkloadDto;
import com.echoid.nexus.service.WorkloadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class WorkloadController {

    private final WorkloadService workloadService;

    /**
     * Returns the workload density for a given assignment.
     * The real formula is Wd = Σ Ci/Ti, where Ci is the effective complexity
     * (professor override or AI score) and Ti is the time remaining until due date.
     */
    @GetMapping("/{id}/workload")
    public ResponseEntity<ApiResponse<WorkloadDto>> getWorkload(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(workloadService.getWorkload(id)));
    }
}
