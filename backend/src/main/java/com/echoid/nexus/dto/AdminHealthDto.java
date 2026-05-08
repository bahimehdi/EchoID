package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Platform health overview for the admin dashboard")
public class AdminHealthDto {

    @Schema(description = "Total students with at least one session event this week", example = "47")
    private int totalActiveStudents;

    @Schema(description = "Professor uploads this week", example = "12")
    private int totalUploadsThisWeek;

    @Schema(description = "Students with Wd > CRITICAL threshold", example = "5")
    private int atRiskCount;

    @Schema(description = "LMS mock status", example = "operational")
    private String lmsStatus;

    @Schema(description = "AI service health status", example = "operational")
    private String aiServiceStatus;

    @Schema(description = "Timestamp of the most recent event ingested")
    private OffsetDateTime lastEventReceivedAt;

    @Schema(description = "Remaining API quota (null if not tracked)")
    private Integer apiQuotaRemaining;
}
