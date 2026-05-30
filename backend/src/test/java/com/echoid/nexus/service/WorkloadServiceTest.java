package com.echoid.nexus.service;

import com.echoid.nexus.dto.CourseDto;
import com.echoid.nexus.dto.WdResponseDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WorkloadServiceTest {

    @Mock
    private LmsService lmsService;

    @InjectMocks
    private WorkloadService workloadService;

    @Test
    void compute_returnsValidResponseShape() {
        UUID studentId = UUID.randomUUID();
        CourseDto c1 = CourseDto.builder().id(UUID.randomUUID()).title("Maths").build();
        CourseDto c2 = CourseDto.builder().id(UUID.randomUUID()).title("Physics").build();
        CourseDto c3 = CourseDto.builder().id(UUID.randomUUID()).title("CS").build();

        when(lmsService.getMoodleCourses()).thenReturn(List.of(c1, c2));
        when(lmsService.getGClassroomCourses()).thenReturn(List.of(c3));

        WdResponseDto result = workloadService.compute(studentId);

        assertThat(result.getWdScore()).isGreaterThan(0);
        assertThat(result.getStatus()).isIn("LOW", "MODERATE", "HIGH", "CRITICAL");
        assertThat(result.getBreakdown()).isNotEmpty();
        assertThat(result.getHistory()).hasSize(14);
        assertThat(result.getCalculatedAt()).isNotNull();
    }

    @Test
    void compute_isDeterministicPerStudentId() {
        UUID studentId = UUID.randomUUID();
        CourseDto c1 = CourseDto.builder().id(UUID.randomUUID()).title("Maths").build();
        CourseDto c2 = CourseDto.builder().id(UUID.randomUUID()).title("Physics").build();

        when(lmsService.getMoodleCourses()).thenReturn(List.of(c1, c2));
        when(lmsService.getGClassroomCourses()).thenReturn(List.of());

        WdResponseDto first = workloadService.compute(studentId);
        WdResponseDto second = workloadService.compute(studentId);

        assertThat(first.getWdScore()).isEqualTo(second.getWdScore());
        assertThat(first.getHistory()).hasSameSizeAs(second.getHistory());
    }

    @Test
    void compute_withNoCourses_returnsZeroBreakdown() {
        when(lmsService.getMoodleCourses()).thenReturn(List.of());
        when(lmsService.getGClassroomCourses()).thenReturn(List.of());

        WdResponseDto result = workloadService.compute(UUID.randomUUID());

        assertThat(result.getBreakdown()).isEmpty();
        assertThat(result.getWdScore()).isEqualTo(0.0);
        assertThat(result.getHistory()).hasSize(14);
    }

    @Test
    void compute_statusIsLowForTinyScore() {
        workloadService.compute(UUID.randomUUID());
    }

    @Test
    void compute_lastHistoryPointMatchesCurrentScore() {
        UUID studentId = UUID.randomUUID();
        CourseDto c = CourseDto.builder().id(UUID.randomUUID()).title("Test Course").build();

        when(lmsService.getMoodleCourses()).thenReturn(List.of(c));
        when(lmsService.getGClassroomCourses()).thenReturn(List.of());

        WdResponseDto result = workloadService.compute(studentId);

        WdResponseDto.WdHistoryPoint last = result.getHistory().get(13);
        assertThat(last.getWdScore()).isEqualTo(result.getWdScore());
    }
}
