package com.echoid.nexus.controller;

import com.echoid.nexus.config.OpenApiConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
@Import({TestSecurityConfig.class, OpenApiConfig.class})
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void ingestEvent_validType_returns201() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType("application/json")
                        .content("""
                                {"eventType":"concept_query","studentId":"550e8400-e29b-41d4-a716-446655440000",
                                 "courseId":"550e8400-e29b-41d4-a716-446655440001","conceptText":"Big-O",
                                 "explanationLevel":"BEGINNER","timestamp":"2026-05-08T12:00:00Z"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void ingestEvent_unknownType_returns400() throws Exception {
        mockMvc.perform(post("/api/events")
                        .contentType("application/json")
                        .content("""
                                {"eventType":"banana","timestamp":"2026-05-08T12:00:00Z"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
