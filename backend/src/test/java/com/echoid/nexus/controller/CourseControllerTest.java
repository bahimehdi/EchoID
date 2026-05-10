package com.echoid.nexus.controller;

import com.echoid.nexus.config.OpenApiConfig;
import com.echoid.nexus.repository.CourseRepository;
import com.echoid.nexus.service.CourseService;
import com.echoid.nexus.service.LmsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CourseController.class)
@Import({TestSecurityConfig.class, OpenApiConfig.class, CourseService.class, LmsService.class})
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CourseRepository courseRepository;

    private static final UUID STUDENT_ID = UUID.fromString("11111111-0000-0000-0000-000000000001");

    private Authentication uuidAuth() {
        return new UsernamePasswordAuthenticationToken(STUDENT_ID, null, List.of());
    }

    @Test
    void listCourses_noEnrollments_returnsFullCatalogue() throws Exception {
        // courseRepository mock returns empty list by default → fallback returns all 27 fixtures
        mockMvc.perform(get("/api/courses").with(authentication(uuidAuth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(27))
                .andExpect(jsonPath("$.data[0].title").isNotEmpty());
    }

    @Test
    @WithMockUser
    void getCourseDetail_knownId_returnsDetailWithSections() throws Exception {
        mockMvc.perform(get("/api/courses/a30f6a75-cd87-3e15-af58-7e305a8560ee"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.sections").isArray())
                .andExpect(jsonPath("$.data.sections.length()").value(3));
    }

    @Test
    @WithMockUser
    void getCourseDetail_unknownId_returns404() throws Exception {
        mockMvc.perform(get("/api/courses/00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void listAssignments_knownCourse_returnsTwoSyntheticAssignments() throws Exception {
        mockMvc.perform(get("/api/courses/a30f6a75-cd87-3e15-af58-7e305a8560ee/assignments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].complexity").isNumber());
    }

    @Test
    @WithMockUser
    void listAssignments_unknownCourse_returnsEmptyList() throws Exception {
        mockMvc.perform(get("/api/courses/00000000-0000-0000-0000-000000000000/assignments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

}
