package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Student workload density response with breakdown and 14-day trend")
public class WdResponseDto {

    @Schema(description = "Aggregate Wd score = Σ Ci/Ti", example = "3.75")
    private double wdScore;

    @Schema(description = "Risk status derived from Wd thresholds",
            allowableValues = {"LOW", "MODERATE", "HIGH", "CRITICAL"},
            example = "HIGH")
    private String status;

    @Schema(description = "Per-assignment breakdown of the Wd score")
    private List<WdBreakdownItem> breakdown;

    @Schema(description = "14-day historical Wd trend for the line chart")
    private List<WdHistoryPoint> history;

    @Schema(description = "When this score was calculated")
    private OffsetDateTime calculatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Single assignment contribution to the Wd score")
    public static class WdBreakdownItem {

        @Schema(description = "Course name", example = "Introduction to Machine Learning")
        private String courseTitle;

        @Schema(description = "Assignment name", example = "Linear Regression Report")
        private String assignmentTitle;

        @Schema(description = "Complexity score (Ci)", example = "3.0")
        private double ci;

        @Schema(description = "Days remaining until deadline (Ti)", example = "2.5")
        private double ti;

        @Schema(description = "This assignment's contribution: Ci/Ti", example = "1.2")
        private double contribution;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Historical Wd data point for trend chart")
    public static class WdHistoryPoint {

        @Schema(description = "Date of the snapshot", example = "2026-05-07")
        private LocalDate date;

        @Schema(description = "Wd score on that day", example = "2.8")
        private double wdScore;
    }
}
