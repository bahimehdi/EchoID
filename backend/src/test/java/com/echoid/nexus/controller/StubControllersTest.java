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

@WebMvcTest({LmsController.class, AiProxyController.class, StudentController.class, AdminController.class})
@Import({TestSecurityConfig.class, OpenApiConfig.class})
class StubControllersTest {

    @Autowired
    private MockMvc mockMvc;

    // ── LMS ──────────────────────────────────────

    @Test
    void lms_listMoodleCourses_returns501() throws Exception {
        mockMvc.perform(get("/api/lms/moodle/courses"))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Not implemented — see KAN-12"));
    }

    @Test
    void lms_getMoodleCourse_returns501() throws Exception {
        mockMvc.perform(get("/api/lms/moodle/courses/550e8400-e29b-41d4-a716-446655440000"))
                .andExpect(status().isNotImplemented());
    }

    @Test
    void lms_listGClassroomCourses_returns501() throws Exception {
        mockMvc.perform(get("/api/lms/gclassroom/courses"))
                .andExpect(status().isNotImplemented());
    }

    @Test
    void lms_getGClassroomCourse_returns501() throws Exception {
        mockMvc.perform(get("/api/lms/gclassroom/courses/550e8400-e29b-41d4-a716-446655440000"))
                .andExpect(status().isNotImplemented());
    }

    // ── AI Proxy ─────────────────────────────────

    @Test
    void ai_explain_returns501() throws Exception {
        mockMvc.perform(post("/api/ai/explain")
                        .contentType("application/json")
                        .content("""
                                {"conceptText":"Big-O","courseId":"550e8400-e29b-41d4-a716-446655440000",
                                 "sectionId":"550e8400-e29b-41d4-a716-446655440001","level":"BEGINNER"}
                                """))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.message").value("Not implemented — see KAN-19"));
    }

    @Test
    void ai_videos_returns501() throws Exception {
        mockMvc.perform(post("/api/ai/videos")
                        .contentType("application/json")
                        .content("""
                                {"conceptText":"Big-O","courseId":"550e8400-e29b-41d4-a716-446655440000"}
                                """))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.message").value("Not implemented — see KAN-21"));
    }

    // ── Student ──────────────────────────────────

    @Test
    void student_getWorkload_returns501() throws Exception {
        mockMvc.perform(get("/api/students/550e8400-e29b-41d4-a716-446655440000/workload"))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.message").value("Not implemented — see KAN-35"));
    }

    @Test
    void student_registerDeviceToken_returns501() throws Exception {
        mockMvc.perform(post("/api/students/550e8400-e29b-41d4-a716-446655440000/device-token")
                        .contentType("application/json")
                        .content("""
                                {"token":"ExponentPushToken[xxxxx]","platform":"ANDROID"}
                                """))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.message").value("Not implemented — see KAN-28"));
    }

    // ── Admin ────────────────────────────────────

    @Test
    void admin_health_returns501() throws Exception {
        mockMvc.perform(get("/api/admin/health"))
                .andExpect(status().isNotImplemented())
                .andExpect(jsonPath("$.message").value("Not implemented — see KAN-33"));
    }
}
