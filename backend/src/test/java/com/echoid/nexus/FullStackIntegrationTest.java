package com.echoid.nexus;

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
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import javax.sql.DataSource;

import static org.hamcrest.Matchers.*;
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
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void eventsEndpoint_returns200() throws Exception {
        mockMvc.perform(get("/api/events"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void aiExplainEndpoint_acceptsPost() throws Exception {
        mockMvc.perform(post("/api/ai/explain")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"question":"What is a derivative?","level":"BEGINNER"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    void adminHealthEndpoint_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("UP")));
    }

    @Test
    void swaggerUi_isAccessible() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection());
    }
}
