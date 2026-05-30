package com.echoid.nexus;

import com.echoid.nexus.model.RefreshToken;
import com.echoid.nexus.model.User;
import com.echoid.nexus.model.enums.SchoolEnum;
import com.echoid.nexus.model.enums.UserRole;
import com.echoid.nexus.repository.AssignmentRepository;
import com.echoid.nexus.repository.CourseRepository;
import com.echoid.nexus.repository.EmailVerificationTokenRepository;
import com.echoid.nexus.repository.RefreshTokenRepository;
import com.echoid.nexus.repository.UserRepository;
import com.echoid.nexus.security.CustomOAuth2UserService;
import com.echoid.nexus.service.AiClient;
import com.echoid.nexus.service.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import javax.sql.DataSource;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@EnableAutoConfiguration(exclude = {
        DataSourceAutoConfiguration.class,
        DataSourceTransactionManagerAutoConfiguration.class,
        HibernateJpaAutoConfiguration.class,
        FlywayAutoConfiguration.class
})
@TestPropertySource(properties = {
        "app.cors.allowed-origins=http://localhost:3000",
        "app.jwt.secret=dGhpcyBpcyBhIGRldmVsb3BtZW50LW9ubHkgc2VjcmV0IGtleSB0aGF0IG11c3QgYmUgcmVwbGFjZWQgaW4gcHJvZA=="
})
class FullStackIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

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
    @MockitoBean
    private AiClient aiClient;

    private User testUser;
    private Claims mockClaims;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("student@ensa.uit.ac.ma")
                .passwordHash("$2a$10$encoded")
                .displayName("Test Student")
                .role(UserRole.STUDENT)
                .school(SchoolEnum.ENSA)
                .emailVerified(true)
                .build();

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("$2a$10$encoded");
        when(passwordEncoder.matches(any(), any())).thenReturn(true);
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        when(refreshTokenRepository.findByToken(any())).thenReturn(Optional.of(
                RefreshToken.builder()
                        .token(UUID.randomUUID())
                        .user(testUser)
                        .expiresAt(OffsetDateTime.now().plusDays(7))
                        .build()
        ));

        when(emailVerificationTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        mockClaims = mock(Claims.class);
        when(mockClaims.getSubject()).thenReturn(testUser.getId().toString());
        when(mockClaims.get("role", String.class)).thenReturn("STUDENT");
        when(jwtService.validateAccessToken(anyString())).thenReturn(mockClaims);
        when(jwtService.isTokenValid(anyString())).thenReturn(true);
        when(jwtService.generateAccessToken(any())).thenReturn("test-access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("test-refresh-token");
        when(jwtService.getAccessTokenTtlMillis()).thenReturn(1800000L);

        when(courseRepository.findEnrolledCourseIds(any())).thenReturn(List.of());

        when(aiClient.postJson(anyString(), any())).thenReturn(Map.of("explanation", "test"));
        when(aiClient.getJson(anyString())).thenReturn(Map.of("status", "ok"));
    }

    @Test
    void registerEndpoint_returns201() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"test@ensa.uit.ac.ma","password":"demo1234","displayName":"Test","school":"ENSA"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    void loginEndpoint_returns200() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"student@ensa.uit.ac.ma","password":"demo1234"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken").exists());
    }

    @Test
    void refreshEndpoint_returns200() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"refreshToken":"550e8400-e29b-41d4-a716-446655440000"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken").exists());
    }

    @Test
    void coursesEndpoint_returns200() throws Exception {
        mockMvc.perform(get("/api/courses")
                        .header("Authorization", "Bearer test-jwt-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void eventsEndpoint_returns201() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer test-jwt-token")
                        .content("""
                                {"eventType":"concept_query","timestamp":"2025-01-01T00:00:00Z"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    void aiExplainEndpoint_acceptsPost() throws Exception {
        mockMvc.perform(post("/api/ai/explain")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("Authorization", "Bearer test-jwt-token")
                        .content("""
                                {"question":"What is a derivative?","level":"BEGINNER"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminHealthEndpoint_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.lmsStatus", is("operational")));
    }

    @Test
    void swaggerUi_isAccessible() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection());
    }
}
