package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.DeviceTokenRequest;
import com.echoid.nexus.dto.WdResponseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@Tag(name = "Workload", description = "Student workload index (Wd) and device token registration")
public class StudentController {

    @GetMapping("/{id}/workload")
    @Operation(summary = "Get student workload density (Wd)",
            description = "Calculates Wd = Σ Ci/Ti across all active assignments for the student. "
                    + "Returns current score, per-assignment breakdown, and 14-day trend history.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Workload response returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<ApiResponse<WdResponseDto>> getWorkload(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — see KAN-35"));
    }

    @PostMapping("/{id}/device-token")
    @Operation(summary = "Register push notification device token",
            description = "Stores Expo push token or FCM token for the student's device. "
                    + "Called after login to enable push notifications.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Token registered"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<ApiResponse<Void>> registerDeviceToken(
            @PathVariable UUID id,
            @Valid @RequestBody DeviceTokenRequest request) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — see KAN-28"));
    }
}
