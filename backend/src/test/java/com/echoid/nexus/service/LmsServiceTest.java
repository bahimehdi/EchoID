package com.echoid.nexus.service;

import com.echoid.nexus.dto.CourseDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class LmsServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final LmsService lmsService = new LmsService(objectMapper);

    @Test
    void init_loadsFixtureFiles() {
        lmsService.init();
        List<CourseDto> moodle = lmsService.getMoodleCourses();
        List<CourseDto> gclass = lmsService.getGClassroomCourses();

        assertThat(moodle).isNotEmpty();
        assertThat(gclass).isNotEmpty();
    }

    @Test
    void getMoodleCourses_returnsSummaries() {
        lmsService.init();
        List<CourseDto> courses = lmsService.getMoodleCourses();

        assertThat(courses).allSatisfy(c -> {
            assertThat(c.getId()).isNotNull();
            assertThat(c.getTitle()).isNotBlank();
            assertThat(c.getLmsSource()).isEqualTo("MOODLE");
        });
    }

    @Test
    void getGClassroomCourses_returnsSummaries() {
        lmsService.init();
        List<CourseDto> courses = lmsService.getGClassroomCourses();

        assertThat(courses).allSatisfy(c -> {
            assertThat(c.getId()).isNotNull();
            assertThat(c.getTitle()).isNotBlank();
            assertThat(c.getLmsSource()).isEqualTo("GOOGLE_CLASSROOM");
        });
    }
}
