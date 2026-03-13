package com.echoid.nexus.service;

import com.echoid.nexus.dto.AssignmentDto;
import com.echoid.nexus.dto.CourseDto;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CourseService {

    public List<CourseDto> listCourses() {
        return List.of(
                CourseDto.builder()
                        .id(UUID.randomUUID())
                        .title("Introduction to Machine Learning")
                        .lmsSource("MOODLE")
                        .semester("S1")
                        .build(),
                CourseDto.builder()
                        .id(UUID.randomUUID())
                        .title("Database Systems")
                        .lmsSource("GOOGLE_CLASSROOM")
                        .semester("S1")
                        .build(),
                CourseDto.builder()
                        .id(UUID.randomUUID())
                        .title("Software Engineering")
                        .lmsSource("MOODLE")
                        .semester("S2")
                        .build()
        );
    }

    public List<AssignmentDto> listAssignments(UUID courseId) {
        return List.of(
                AssignmentDto.builder()
                        .id(UUID.randomUUID())
                        .title("Linear Regression Report")
                        .dueAt(OffsetDateTime.now().plusDays(7))
                        .aiComplexityScore(3.2)
                        .build(),
                AssignmentDto.builder()
                        .id(UUID.randomUUID())
                        .title("Neural Network Lab")
                        .dueAt(OffsetDateTime.now().plusDays(14))
                        .aiComplexityScore(4.8)
                        .build()
        );
    }
}
