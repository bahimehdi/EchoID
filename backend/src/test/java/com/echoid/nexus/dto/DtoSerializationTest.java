package com.echoid.nexus.dto;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests — verifies DTO builders, JSON serialization, and the ApiResponse envelope.
 * No Spring context needed — pure Java tests.
 */
class DtoSerializationTest {

    private static ObjectMapper mapper;

    @BeforeAll
    static void setup() {
        mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Test
    void apiResponse_ok_serializesCorrectly() throws Exception {
        ApiResponse<String> response = ApiResponse.ok("hello", "success");
        String json = mapper.writeValueAsString(response);

        assertThat(json).contains("\"success\":true");
        assertThat(json).contains("\"data\":\"hello\"");
        assertThat(json).contains("\"message\":\"success\"");
    }

    @Test
    void apiResponse_error_omitsNullData() throws Exception {
        ApiResponse<Void> response = ApiResponse.error("fail");
        String json = mapper.writeValueAsString(response);

        assertThat(json).contains("\"success\":false");
        assertThat(json).contains("\"message\":\"fail\"");
        assertThat(json).doesNotContain("\"data\"");
    }

    @Test
    void authTokenDto_buildAndSerialize() throws Exception {
        AuthTokenDto dto = AuthTokenDto.builder()
                .accessToken("eyJhbGci...")
                .refreshToken("abc-123")
                .expiresIn(86400000)
                .build();

        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"tokenType\":\"Bearer\"");
        assertThat(json).contains("\"expiresIn\":86400000");
    }

    @Test
    void wdResponseDto_fullShape() throws Exception {
        WdResponseDto dto = WdResponseDto.builder()
                .wdScore(3.75)
                .status("HIGH")
                .breakdown(List.of(
                        WdResponseDto.WdBreakdownItem.builder()
                                .courseTitle("ML")
                                .assignmentTitle("Report")
                                .ci(3.0).ti(2.5).contribution(1.2)
                                .build()))
                .history(List.of(
                        WdResponseDto.WdHistoryPoint.builder()
                                .date(LocalDate.of(2026, 5, 7))
                                .wdScore(2.8)
                                .build()))
                .calculatedAt(OffsetDateTime.now())
                .build();

        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"wdScore\":3.75");
        assertThat(json).contains("\"status\":\"HIGH\"");
        assertThat(json).contains("\"courseTitle\":\"ML\"");
        assertThat(json).contains("\"contribution\":1.2");
        assertThat(json).contains("\"date\":\"2026-05-07\"");
    }

    @Test
    void courseDetailDto_withSections() throws Exception {
        UUID courseId = UUID.randomUUID();
        CourseDetailDto dto = CourseDetailDto.builder()
                .id(courseId)
                .title("Machine Learning")
                .lmsSource("MOODLE")
                .school("ENSA")
                .sections(List.of(
                        CourseSectionDto.builder()
                                .id(UUID.randomUUID())
                                .title("Chapter 1")
                                .orderIndex(1)
                                .build()))
                .build();

        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"title\":\"Machine Learning\"");
        assertThat(json).contains("\"sections\":[");
        assertThat(json).contains("\"orderIndex\":1");
    }

    @Test
    void notificationDto_enrichedFields() throws Exception {
        NotificationDto dto = NotificationDto.builder()
                .id(UUID.randomUUID())
                .type("DEADLINE_REMINDER")
                .channel("PUSH")
                .message("Due in 48 hours")
                .isRead(false)
                .sentAt(OffsetDateTime.now())
                .readAt(null)
                .assignmentId(UUID.randomUUID())
                .build();

        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"channel\":\"PUSH\"");
        assertThat(json).contains("\"type\":\"DEADLINE_REMINDER\"");
        assertThat(json).contains("\"assignmentId\"");
    }

    @Test
    void eventRequest_discriminatedFields() throws Exception {
        EventRequest dto = EventRequest.builder()
                .eventType("concept_query")
                .studentId(UUID.randomUUID())
                .courseId(UUID.randomUUID())
                .conceptText("Big-O")
                .explanationLevel("BEGINNER")
                .timestamp(OffsetDateTime.now())
                .build();

        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"eventType\":\"concept_query\"");
        assertThat(json).contains("\"conceptText\":\"Big-O\"");
        // session_event fields should be null when not set
        assertThat(json).contains("\"sessionEventType\":null");
    }
}
