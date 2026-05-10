package com.echoid.nexus.controller;

import com.echoid.nexus.dto.AdminHealthDto;
import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.service.AiClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin", description = "Administrator platform health and monitoring — requires ADMIN role")
public class AdminController {

    private final AiClient aiClient;

    @GetMapping("/health")
    @Operation(summary = "Platform health overview",
            description = "Aggregated counters for the admin KPI strip. Demo posture: hardcoded "
                    + "plausible values; production reads from PostgreSQL views (KAN-16).")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Health data returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Requires ADMIN role")
    })
    public ResponseEntity<ApiResponse<AdminHealthDto>> platformHealth() {
        AdminHealthDto h = AdminHealthDto.builder()
                .totalActiveStudents(47)
                .totalUploadsThisWeek(12)
                .atRiskCount(5)
                .lmsStatus("operational")
                .aiServiceStatus("operational")
                .lastEventReceivedAt(OffsetDateTime.now().minusMinutes(3))
                .apiQuotaRemaining(null)
                .build();
        return ResponseEntity.ok(ApiResponse.ok(h));
    }

    @GetMapping("/recommendations/concept-bottlenecks")
    @Operation(summary = "Concepts the cohort struggles with most",
            description = "Proxies to ai-service GET /recommendations/concept-bottlenecks. Filterable by school.")
    public ResponseEntity<ApiResponse<Object>> conceptBottlenecks(
            @RequestParam(required = false, defaultValue = "ALL") String school) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(
                    aiClient.getJson("/recommendations/concept-bottlenecks?school=" + school)));
        } catch (Exception e) {
            log.warn("recommendations/concept-bottlenecks failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(ApiResponse.error("AI service unreachable"));
        }
    }

    @GetMapping("/recommendations/at-risk-students")
    @Operation(summary = "Students predicted at risk of drop-off",
            description = "Proxies to ai-service GET /recommendations/at-risk-students. Filterable by school.")
    public ResponseEntity<ApiResponse<Object>> atRiskStudents(
            @RequestParam(required = false, defaultValue = "ALL") String school,
            @RequestParam(required = false, defaultValue = "10") int limit) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(
                    aiClient.getJson("/recommendations/at-risk-students?school=" + school + "&limit=" + limit)));
        } catch (Exception e) {
            log.warn("recommendations/at-risk-students failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(ApiResponse.error("AI service unreachable"));
        }
    }

    @GetMapping("/recommendations/intervention-suggestions")
    @Operation(summary = "Rule + ML based intervention suggestions",
            description = "Proxies to ai-service GET /recommendations/intervention-suggestions.")
    public ResponseEntity<ApiResponse<Object>> interventionSuggestions() {
        try {
            return ResponseEntity.ok(ApiResponse.ok(
                    aiClient.getJson("/recommendations/intervention-suggestions")));
        } catch (Exception e) {
            log.warn("recommendations/intervention-suggestions failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(ApiResponse.error("AI service unreachable"));
        }
    }

    @GetMapping("/recommendations/cheating-clusters")
    @Operation(summary = "Potentially similar assignment submissions",
            description = "Proxies to ai-service GET /recommendations/cheating-clusters. Demo fixture for Moodle Python submissions.")
    public ResponseEntity<ApiResponse<Object>> cheatingClusters(
            @RequestParam(required = false, defaultValue = "ENSA") String school) {
        try {
            return ResponseEntity.ok(ApiResponse.ok(
                    aiClient.getJson("/recommendations/cheating-clusters?school=" + school)));
        } catch (Exception e) {
            log.warn("recommendations/cheating-clusters failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(ApiResponse.error("AI service unreachable"));
        }
    }
}
