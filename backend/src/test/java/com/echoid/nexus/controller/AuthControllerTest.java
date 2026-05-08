package com.echoid.nexus.controller;

import com.echoid.nexus.config.OpenApiConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Integration tests for AuthController — verifies all stub endpoints
 * return 501 with correct ApiResponse envelope.
 */
@WebMvcTest(AuthController.class)
@Import({TestSecurityConfig.class, OpenApiConfig.class})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void register_returns501WithEnvelope() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json")
                        .content("""
                                {"email":"test@ensa.uit.ac.ma","password":"demo1234","displayName":"Test","school":"ENSA"}
                                """))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Not implemented — see KAN-8"));
    }

    @Test
    void verify_returns501() throws Exception {
        mockMvc.perform(get("/api/auth/verify").param("token", "550e8400-e29b-41d4-a716-446655440000"))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void login_returns501WithEnvelope() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType("application/json")
                        .content("""
                                {"email":"test@ensa.uit.ac.ma","password":"demo1234"}
                                """))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Not implemented — see KAN-9"));
    }

    @Test
    void refresh_returns501() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType("application/json")
                        .content("""
                                {"refreshToken":"550e8400-e29b-41d4-a716-446655440000"}
                                """))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void logout_returns501() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .contentType("application/json")
                        .content("""
                                {"refreshToken":"550e8400-e29b-41d4-a716-446655440000"}
                                """))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.success").value(false));
    }
}
