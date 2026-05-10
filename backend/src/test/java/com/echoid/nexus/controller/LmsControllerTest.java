package com.echoid.nexus.controller;

import com.echoid.nexus.config.OpenApiConfig;
import com.echoid.nexus.service.LmsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(LmsController.class)
@Import({TestSecurityConfig.class, OpenApiConfig.class, LmsService.class})
class LmsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser
    void listMoodleCourses_returnsEnsakCatalogue() throws Exception {
        mockMvc.perform(get("/api/lms/moodle/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(19))
                .andExpect(jsonPath("$.data[0].lmsSource").value("MOODLE"))
                .andExpect(jsonPath("$.data[0].school").value("ENSA"));
    }

    @Test
    @WithMockUser
    void listGClassroomCourses_returnsEnsakCatalogue() throws Exception {
        mockMvc.perform(get("/api/lms/gclassroom/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(8))
                .andExpect(jsonPath("$.data[0].lmsSource").value("GOOGLE_CLASSROOM"));
    }

    @Test
    @WithMockUser
    void getMoodleCourse_unknownId_returns404() throws Exception {
        mockMvc.perform(get("/api/lms/moodle/courses/00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser
    void getMoodleCourse_knownId_returnsDetailWithSections() throws Exception {
        // Deterministic UUID for ENSAK-CP1-S2-05 (Thermodynamique générale).
        mockMvc.perform(get("/api/lms/moodle/courses/a30f6a75-cd87-3e15-af58-7e305a8560ee"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").value(org.hamcrest.Matchers.containsString("Thermodynamique")))
                .andExpect(jsonPath("$.data.sections").isArray())
                .andExpect(jsonPath("$.data.sections.length()").value(3));
    }

}
