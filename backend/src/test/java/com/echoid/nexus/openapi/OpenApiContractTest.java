package com.echoid.nexus.openapi;

import com.echoid.nexus.repository.AssignmentRepository;
import com.echoid.nexus.repository.CourseRepository;
import com.echoid.nexus.repository.EmailVerificationTokenRepository;
import com.echoid.nexus.repository.RefreshTokenRepository;
import com.echoid.nexus.repository.UserRepository;
import com.echoid.nexus.security.CustomOAuth2UserService;
import com.echoid.nexus.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import org.springframework.security.crypto.password.PasswordEncoder;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Contract test — verifies the auto-generated OpenAPI spec contains all expected
 * endpoints, tags, and schemas.
 *
 * Uses {@code @SpringBootTest} instead of {@code @WebMvcTest} because the latter
 * deliberately excludes springdoc auto-configuration, preventing the
 * {@code /v3/api-docs} endpoint from being registered. JPA/Flyway/DataSource
 * auto-configurations are excluded and their beans mocked so no database is required.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@EnableAutoConfiguration(exclude = {
        DataSourceAutoConfiguration.class,
        DataSourceTransactionManagerAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        FlywayAutoConfiguration.class
})
@TestPropertySource(properties = {
        // Supply the CORS property that CorsConfig @Value requires
        "app.cors.allowed-origins=http://localhost:3000",
        "app.jwt.secret=dGhpcyBpcyBhIGRldmVsb3BtZW50LW9ubHkgc2VjcmV0IGtleSB0aGF0IG11c3QgYmUgcmVwbGFjZWQgaW4gcHJvZA=="
})
class OpenApiContractTest {

    @Autowired
    private MockMvc mockMvc;

    // ── Mock out all DB-dependent beans ──────────────────────────

    @MockitoBean
    private DataSource dataSource;

    @MockitoBean
    private UserRepository userRepository;


    @MockitoBean
    private CourseRepository courseRepository;

    @MockitoBean
    private RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @MockitoBean
    private AssignmentRepository assignmentRepository;

    @MockitoBean
    private CustomOAuth2UserService customOAuth2UserService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private PasswordEncoder passwordEncoder;

    // ── Tests ────────────────────────────────────────────────────

    @Test
    void openApiSpec_containsAllExpectedTags() throws Exception {
        MvcResult result = mockMvc.perform(get("/v3/api-docs"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk()).andReturn();
        String json = result.getResponse().getContentAsString();

        assertThat(json).contains("\"name\":\"Auth\"");
        assertThat(json).contains("\"name\":\"Users\"");
        assertThat(json).contains("\"name\":\"Courses\"");
        assertThat(json).contains("\"name\":\"LMS\"");
        assertThat(json).contains("\"name\":\"Events\"");
        assertThat(json).contains("\"name\":\"AI\"");
        assertThat(json).contains("\"name\":\"Workload\"");
        assertThat(json).contains("\"name\":\"Notifications\"");
        assertThat(json).contains("\"name\":\"Admin\"");
        assertThat(json).doesNotContain("\"name\":\"Internal\"");
    }

    @Test
    void openApiSpec_containsAllEndpoints() throws Exception {
        MvcResult result = mockMvc.perform(get("/v3/api-docs"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk()).andReturn();
        String json = result.getResponse().getContentAsString();

        // Auth
        assertThat(json).contains("/api/auth/register");
        assertThat(json).contains("/api/auth/verify");
        assertThat(json).contains("/api/auth/login");
        assertThat(json).contains("/api/auth/refresh");
        assertThat(json).contains("/api/auth/logout");
        // Users
        assertThat(json).contains("/api/users/me");
        // Courses
        assertThat(json).contains("/api/courses");
        assertThat(json).contains("/api/courses/{id}");
        assertThat(json).contains("/api/courses/{id}/assignments");
        // LMS
        assertThat(json).contains("/api/lms/moodle/courses");
        assertThat(json).contains("/api/lms/gclassroom/courses");
        // Events
        assertThat(json).contains("/api/events");
        // AI
        assertThat(json).contains("/api/ai/explain");
        assertThat(json).contains("/api/ai/ocr/upload");
        assertThat(json).contains("/api/ai/videos");
        // Student
        assertThat(json).contains("/api/students/{id}/workload");
        assertThat(json).contains("/api/students/{id}/device-token");
        // Notifications
        assertThat(json).contains("/api/notifications");
        assertThat(json).contains("/api/notifications/{id}/read");
        // Admin
        assertThat(json).contains("/api/admin/health");
    }

    @Test
    void openApiSpec_containsAllDtoSchemas() throws Exception {
        MvcResult result = mockMvc.perform(get("/v3/api-docs"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk()).andReturn();
        String json = result.getResponse().getContentAsString();

        for (String dto : new String[]{
                "RegisterRequest", "LoginRequest", "RefreshRequest", "EventRequest",
                "ExplainRequest", "VideoSearchRequest", "DeviceTokenRequest",
                "AuthTokenDto", "UserProfileDto", "CourseDto", "CourseDetailDto",
                "CourseSectionDto", "AssignmentDto", "ExplanationCardDto",
                "VideoResultDto", "OcrResultDto", "WdResponseDto", "WdBreakdownItem",
                "WdHistoryPoint", "NotificationDto", "AdminHealthDto"
        }) {
            assertThat(json).as("Schema %s should be present", dto).contains(dto);
        }
    }

    @Test
    void openApiSpec_hasCorrectApiInfo() throws Exception {
        MvcResult result = mockMvc.perform(get("/v3/api-docs"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk()).andReturn();
        String json = result.getResponse().getContentAsString();

        assertThat(json).contains("\"title\":\"EchoID Nexus API\"");
        assertThat(json).contains("\"version\":\"0.1.0\"");
        assertThat(json).contains("Team Neurorise");
    }

    @Test
    void swaggerUi_isAccessible() throws Exception {
        // springdoc registers a redirect from /swagger-ui.html → /swagger-ui/index.html.
        // A 302 proves the Swagger UI controller is wired correctly.
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection());
    }
}
