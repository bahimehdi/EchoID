package com.echoid.nexus.controller;

import com.echoid.nexus.config.OpenApiConfig;
import com.echoid.nexus.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for AuthController — verifies endpoints
 * respond with correct status codes and envelope shape.
 */
@WebMvcTest(AuthController.class)
@Import({TestSecurityConfig.class, OpenApiConfig.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    @Test
    void register_returns201OnSuccess() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content("""
                                {"email":"test@ensa.uit.ac.ma","password":"demo1234","displayName":"Test","school":"ENSA"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void register_returns400OnInvalidEmail() throws Exception {
        doThrow(new IllegalArgumentException("Email must end with @uit.ac.ma"))
                .when(authService).register(any());

        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content("""
                                {"email":"test@gmail.com","password":"demo1234","displayName":"Test","school":"ENSA"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void login_returns401OnBadCredentials() throws Exception {
        doThrow(new BadCredentialsException("Invalid email or password"))
                .when(authService).login(any());

        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("""
                                {"email":"test@ensa.uit.ac.ma","password":"wrong"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void verify_returns200OnValidToken() throws Exception {
        mockMvc.perform(get("/api/auth/verify").param("token", "550e8400-e29b-41d4-a716-446655440000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void logout_returns200() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .contentType("application/json")
                        .content("""
                                {"refreshToken":"550e8400-e29b-41d4-a716-446655440000"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
