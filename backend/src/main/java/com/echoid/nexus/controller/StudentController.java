package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.DeviceTokenRequest;
import com.echoid.nexus.dto.WdResponseDto;
import com.echoid.nexus.service.WorkloadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Workload", description = "Student workload index (Wd) and device token registration")
public class StudentController {

    private final WorkloadService workloadService;

    @GetMapping("/{id}/workload")
    @Operation(summary = "Get student workload density (Wd)",
            description = "Wd = Σ Cᵢ/Tᵢ across active assignments. Returns aggregate score, "
                    + "per-assignment breakdown, and a 14-day trend.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Workload returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<ApiResponse<WdResponseDto>> getWorkload(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(workloadService.compute(id)));
    }

    @PostMapping("/{id}/device-token")
    @Operation(summary = "Register push notification device token",
            description = "Stores Expo / FCM push token for the student. Demo posture logs the token "
                    + "and returns 200; production persists to a device_tokens table.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token registered"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<ApiResponse<Void>> registerDeviceToken(
            @PathVariable UUID id,
            @Valid @RequestBody DeviceTokenRequest request) {
        log.info("Push token registered for student {} on platform {}", id, request.getPlatform());
        return ResponseEntity.ok(ApiResponse.ok(null, "Token registered"));
    }
}
