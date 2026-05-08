package com.echoid.nexus.controller;

import com.echoid.nexus.config.OpenApiConfig;
import com.echoid.nexus.service.CourseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CourseController.class)
@Import({TestSecurityConfig.class, OpenApiConfig.class, CourseService.class})
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser
    void listCourses_returns200WithCourseList() throws Exception {
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(3))
                .andExpect(jsonPath("$.data[0].title").isNotEmpty())
                .andExpect(jsonPath("$.data[0].school").isNotEmpty());
    }

    @Test
    @WithMockUser
    void listAssignments_returns200WithAssignmentList() throws Exception {
        mockMvc.perform(get("/api/courses/550e8400-e29b-41d4-a716-446655440000/assignments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].courseId").isNotEmpty())
                .andExpect(jsonPath("$.data[0].complexity").isNumber());
    }

    @Test
    @WithMockUser
    void getCourseDetail_returns501Stub() throws Exception {
        mockMvc.perform(get("/api/courses/550e8400-e29b-41d4-a716-446655440000"))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void listCourses_returns401WhenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/courses"))
                .andExpect(status().isUnauthorized());
    }
}
