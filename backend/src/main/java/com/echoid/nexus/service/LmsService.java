package com.echoid.nexus.service;

import com.echoid.nexus.dto.CourseDetailDto;
import com.echoid.nexus.dto.CourseDto;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LmsService {

    private final ObjectMapper objectMapper;
    private List<CourseDetailDto> moodleCourses = new ArrayList<>();
    private List<CourseDetailDto> gclassroomCourses = new ArrayList<>();

    @PostConstruct
    public void init() {
        loadFixtures();
    }

    private void loadFixtures() {
        try {
            moodleCourses = objectMapper.readValue(
                    new ClassPathResource("fixtures/moodle_courses.json").getInputStream(),
                    new TypeReference<List<CourseDetailDto>>() {}
            );
            log.info("Loaded {} Moodle course fixtures", moodleCourses.size());

            gclassroomCourses = objectMapper.readValue(
                    new ClassPathResource("fixtures/gclassroom_courses.json").getInputStream(),
                    new TypeReference<List<CourseDetailDto>>() {}
            );
            log.info("Loaded {} Google Classroom course fixtures", gclassroomCourses.size());
        } catch (IOException e) {
            log.error("Failed to load LMS fixtures: {}", e.getMessage());
        }
    }

    public List<CourseDto> getMoodleCourses() {
        return moodleCourses.stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    public Optional<CourseDetailDto> getMoodleCourse(UUID id) {
        return moodleCourses.stream()
                .filter(c -> c.getId().equals(id))
                .findFirst();
    }

    public List<CourseDto> getGClassroomCourses() {
        return gclassroomCourses.stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    public Optional<CourseDetailDto> getGClassroomCourse(UUID id) {
        return gclassroomCourses.stream()
                .filter(c -> c.getId().equals(id))
                .findFirst();
    }

    private CourseDto toSummary(CourseDetailDto detail) {
        return CourseDto.builder()
                .id(detail.getId())
                .title(detail.getTitle())
                .lmsSource(detail.getLmsSource())
                .school(detail.getSchool())
                .semester(detail.getSemester())
                .isActive(detail.isActive())
                .build();
    }
}
