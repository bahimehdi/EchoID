package com.echoid.nexus.controller;

import com.echoid.nexus.config.OpenApiConfig;
import com.echoid.nexus.service.AiClient;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.startsWith;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@Import({TestSecurityConfig.class, OpenApiConfig.class, AdminControllerTest.AiClientStub.class})
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @TestConfiguration
    static class AiClientStub {
        @Bean
        public AiClient aiClient() {
            AiClient mock = Mockito.mock(AiClient.class);
            when(mock.getJson(startsWith("/recommendations/concept-bottlenecks")))
                    .thenReturn(List.of(Map.of("conceptSlug", "thermo-1er-principe", "queryCount", 100)));
            when(mock.getJson(startsWith("/recommendations/at-risk-students")))
                    .thenReturn(List.of(Map.of("studentId", "stu-0001", "riskScore", 0.82)));
            when(mock.getJson(startsWith("/recommendations/intervention-suggestions")))
                    .thenReturn(List.of(Map.of("cohort", "ENSAK CP1 S2", "confidence", 0.86)));
            when(mock.getJson(startsWith("/recommendations/cheating-clusters")))
                    .thenReturn(List.of(Map.of("clusterId", "PY-R-01", "avgSimilarity", 0.88)));
            return mock;
        }
    }

    @Test
    @WithMockUser
    void platformHealth_returnsAdminHealthDto() throws Exception {
        mockMvc.perform(get("/api/admin/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.lmsStatus").value("operational"))
                .andExpect(jsonPath("$.data.aiServiceStatus").value("operational"));
    }

    @Test
    @WithMockUser
    void conceptBottlenecks_returnsList() throws Exception {
        mockMvc.perform(get("/api/admin/recommendations/concept-bottlenecks?school=ENSA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser
    void atRiskStudents_returnsList() throws Exception {
        mockMvc.perform(get("/api/admin/recommendations/at-risk-students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser
    void interventionSuggestions_returnsList() throws Exception {
        mockMvc.perform(get("/api/admin/recommendations/intervention-suggestions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @WithMockUser
    void cheatingClusters_returnsList() throws Exception {
        mockMvc.perform(get("/api/admin/recommendations/cheating-clusters?school=ENSA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }
}
