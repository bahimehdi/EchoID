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

    // ── Remaining DTOs ──────────────────────────────────────────────────────

    @Test
    void adminHealthDto_serializes() throws Exception {
        AdminHealthDto dto = AdminHealthDto.builder()
                .totalActiveStudents(47).totalUploadsThisWeek(12).atRiskCount(5)
                .lmsStatus("operational").aiServiceStatus("operational")
                .lastEventReceivedAt(OffsetDateTime.now()).apiQuotaRemaining(500)
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"totalActiveStudents\":47");
        assertThat(json).contains("\"aiServiceStatus\":\"operational\"");
        assertThat(json).contains("\"apiQuotaRemaining\":500");
    }

    @Test
    void assignmentDto_serializes() throws Exception {
        AssignmentDto dto = AssignmentDto.builder()
                .id(UUID.randomUUID()).courseId(UUID.randomUUID())
                .courseTitle("Intro ML").title("Linear Regression Report")
                .description("Analyze dataset").complexity(3.2)
                .dueAt(OffsetDateTime.now()).assignmentType("PROJECT")
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"courseTitle\":\"Intro ML\"");
        assertThat(json).contains("\"complexity\":3.2");
        assertThat(json).contains("\"assignmentType\":\"PROJECT\"");
    }

    @Test
    void courseDto_serializes() throws Exception {
        CourseDto dto = CourseDto.builder()
                .id(UUID.randomUUID()).title("Machine Learning")
                .lmsSource("MOODLE").school("ENSA").semester("S2")
                .isActive(true)
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"title\":\"Machine Learning\"");
        assertThat(json).contains("\"lmsSource\":\"MOODLE\"");
        assertThat(json).contains("\"semester\":\"S2\"");
        assertThat(json).contains("\"active\":true");
    }

    @Test
    void courseSectionDto_serializes() throws Exception {
        CourseSectionDto dto = CourseSectionDto.builder()
                .id(UUID.randomUUID()).title("Chapter 3: Sorting")
                .orderIndex(3)
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"title\":\"Chapter 3: Sorting\"");
        assertThat(json).contains("\"orderIndex\":3");
    }

    @Test
    void deviceTokenRequest_serializes() throws Exception {
        DeviceTokenRequest dto = DeviceTokenRequest.builder()
                .token("ExponentPushToken[xxx]").platform("ANDROID")
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"token\":\"ExponentPushToken[xxx]\"");
        assertThat(json).contains("\"platform\":\"ANDROID\"");
    }

    @Test
    void explainRequest_serializes() throws Exception {
        ExplainRequest dto = ExplainRequest.builder()
                .conceptText("Big-O notation").courseId(UUID.randomUUID())
                .sectionId(UUID.randomUUID()).level("BEGINNER")
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"conceptText\":\"Big-O notation\"");
        assertThat(json).contains("\"level\":\"BEGINNER\"");
    }

    @Test
    void explanationCardDto_serializes() throws Exception {
        ExplanationCardDto dto = ExplanationCardDto.builder()
                .title("Understanding Big-O").body("Full explanation text")
                .level("BEGINNER")
                .bulletPoints(List.of("Point 1", "Point 2"))
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"title\":\"Understanding Big-O\"");
        assertThat(json).contains("\"level\":\"BEGINNER\"");
        assertThat(json).contains("\"bulletPoints\"");
    }

    @Test
    void loginRequest_serializes() throws Exception {
        LoginRequest dto = LoginRequest.builder()
                .email("student@ensa.uit.ac.ma").password("demo1234")
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"email\":\"student@ensa.uit.ac.ma\"");
        assertThat(json).contains("\"password\":\"demo1234\"");
    }

    @Test
    void ocrResultDto_serializes() throws Exception {
        OcrResultDto dto = OcrResultDto.builder()
                .documentId(UUID.randomUUID())
                .extractedText("notions de thermodynamique")
                .pageCount(2).confidence(0.94)
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"extractedText\":\"notions de thermodynamique\"");
        assertThat(json).contains("\"pageCount\":2");
        assertThat(json).contains("\"confidence\":0.94");
    }

    @Test
    void refreshRequest_serializes() throws Exception {
        RefreshRequest dto = RefreshRequest.builder()
                .refreshToken("550e8400-e29b-41d4-a716-446655440000")
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"refreshToken\":\"550e8400-e29b-41d4-a716-446655440000\"");
    }

    @Test
    void registerRequest_serializes() throws Exception {
        RegisterRequest dto = RegisterRequest.builder()
                .email("student@ensa.uit.ac.ma").password("demo1234")
                .displayName("Ahmed Benali").school("ENSA")
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"email\":\"student@ensa.uit.ac.ma\"");
        assertThat(json).contains("\"displayName\":\"Ahmed Benali\"");
        assertThat(json).contains("\"school\":\"ENSA\"");
    }

    @Test
    void userProfileDto_serializes() throws Exception {
        UserProfileDto dto = UserProfileDto.builder()
                .id(UUID.randomUUID()).email("student@ensa.uit.ac.ma")
                .fullName("Ahmed Benali").picture("https://example.com/avatar.png")
                .role("STUDENT").school("ENSA").emailVerified(true)
                .createdAt(OffsetDateTime.now())
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"email\":\"student@ensa.uit.ac.ma\"");
        assertThat(json).contains("\"role\":\"STUDENT\"");
        assertThat(json).contains("\"emailVerified\":true");
    }

    @Test
    void videoResultDto_serializes() throws Exception {
        VideoResultDto dto = VideoResultDto.builder()
                .videoId("dQw4w9WgXcQ").title("Big-O Full Explanation")
                .channelName("CS Academy")
                .thumbnailUrl("https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg")
                .durationSeconds(540)
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"videoId\":\"dQw4w9WgXcQ\"");
        assertThat(json).contains("\"channelName\":\"CS Academy\"");
        assertThat(json).contains("\"durationSeconds\":540");
    }

    @Test
    void videoSearchRequest_serializes() throws Exception {
        VideoSearchRequest dto = VideoSearchRequest.builder()
                .conceptText("Big-O notation").courseId(UUID.randomUUID())
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"conceptText\":\"Big-O notation\"");
    }

    @Test
    void workloadDto_serializes() throws Exception {
        WorkloadDto dto = WorkloadDto.builder()
                .assignmentId(UUID.randomUUID()).aiComplexityScore(2.5)
                .dueAt(OffsetDateTime.now()).hoursRemaining(48L).workloadIndex(1.8)
                .build();
        String json = mapper.writeValueAsString(dto);
        assertThat(json).contains("\"aiComplexityScore\":2.5");
        assertThat(json).contains("\"hoursRemaining\":48");
        assertThat(json).contains("\"workloadIndex\":1.8");
    }
}
