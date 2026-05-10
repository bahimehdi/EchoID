package com.echoid.nexus.service;

import com.echoid.nexus.dto.WdResponseDto;
import com.echoid.nexus.dto.WdResponseDto.WdBreakdownItem;
import com.echoid.nexus.dto.WdResponseDto.WdHistoryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

/**
 * Workload Density: Wd = Σ Cᵢ / Tᵢ where Cᵢ is the assignment's complexity
 * (1–5 scale) and Tᵢ is the days remaining until its due date.
 *
 * Demo posture: when no seeded enrollment exists for the student, we
 * synthesise a plausible 4-assignment workload deterministically per
 * studentId, plus a 14-day trend. Production swap-in: read from the
 * `assignments` table joined on `course_enrollments`.
 */
@Service
@RequiredArgsConstructor
public class WorkloadService {

    private static final double LOW = 0.05;
    private static final double MODERATE = 0.10;
    private static final double HIGH = 0.18;

    private final LmsService lmsService;

    public WdResponseDto compute(UUID studentId) {
        Random rng = new Random(studentId.getLeastSignificantBits());

        // Pick four ENSAK courses deterministically per studentId.
        List<com.echoid.nexus.dto.CourseDto> courses = new ArrayList<>();
        courses.addAll(lmsService.getMoodleCourses());
        courses.addAll(lmsService.getGClassroomCourses());
        java.util.Collections.shuffle(courses, rng);
        List<com.echoid.nexus.dto.CourseDto> picked = courses.subList(0, Math.min(4, courses.size()));

        List<WdBreakdownItem> breakdown = new ArrayList<>();
        double wd = 0;
        for (var c : picked) {
            double ci = 2.5 + rng.nextDouble() * 2.5;          // 2.5 – 5.0
            double tiDays = 1 + rng.nextDouble() * 9;          // 1 – 10 days
            double contribution = ci / tiDays;
            wd += contribution;
            breakdown.add(WdBreakdownItem.builder()
                    .courseTitle(c.getTitle())
                    .assignmentTitle("Travail à rendre")
                    .ci(round(ci, 2))
                    .ti(round(tiDays, 2))
                    .contribution(round(contribution, 4))
                    .build());
        }

        List<WdHistoryPoint> history = new ArrayList<>();
        LocalDate today = LocalDate.now();
        double cursor = wd * 0.6;
        for (int i = 13; i >= 0; i--) {
            cursor = Math.max(0, cursor + (rng.nextDouble() - 0.45) * 0.05);
            if (i == 0) cursor = wd;
            history.add(WdHistoryPoint.builder()
                    .date(today.minusDays(i))
                    .wdScore(round(cursor, 3))
                    .build());
        }

        return WdResponseDto.builder()
                .wdScore(round(wd, 3))
                .status(statusOf(wd))
                .breakdown(breakdown)
                .history(history)
                .calculatedAt(OffsetDateTime.now())
                .build();
    }

    private static String statusOf(double wd) {
        if (wd < LOW) return "LOW";
        if (wd < MODERATE) return "MODERATE";
        if (wd < HIGH) return "HIGH";
        return "CRITICAL";
    }

    private static double round(double v, int dp) {
        double f = Math.pow(10, dp);
        return Math.round(v * f) / f;
    }
}
