package com.echoid.nexus.controller;

import com.echoid.nexus.config.OpenApiConfig;
import com.echoid.nexus.service.LmsService;
import com.echoid.nexus.service.WorkloadService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StudentController.class)
@Import({TestSecurityConfig.class, OpenApiConfig.class, WorkloadService.class, LmsService.class})
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser
    void getWorkload_returnsScoreBreakdownAndHistory() throws Exception {
        mockMvc.perform(get("/api/students/550e8400-e29b-41d4-a716-446655440000/workload"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.wdScore").isNumber())
                .andExpect(jsonPath("$.data.status").isString())
                .andExpect(jsonPath("$.data.breakdown").isArray())
                .andExpect(jsonPath("$.data.breakdown.length()").value(4))
                .andExpect(jsonPath("$.data.history.length()").value(14));
    }

    @Test
    @WithMockUser
    void registerDeviceToken_returns200() throws Exception {
        mockMvc.perform(post("/api/students/550e8400-e29b-41d4-a716-446655440000/device-token")
                        .contentType("application/json")
                        .content("""
                                {"token":"ExponentPushToken[xxxxx]","platform":"ANDROID"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
