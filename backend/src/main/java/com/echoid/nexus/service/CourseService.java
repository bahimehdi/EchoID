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
                        .school("ENSA")
                        .semester("S1")
                        .isActive(true)
                        .build(),
                CourseDto.builder()
                        .id(UUID.randomUUID())
                        .title("Database Systems")
                        .lmsSource("GOOGLE_CLASSROOM")
                        .school("ENSA")
                        .semester("S1")
                        .isActive(true)
                        .build(),
                CourseDto.builder()
                        .id(UUID.randomUUID())
                        .title("Software Engineering")
                        .lmsSource("MOODLE")
                        .school("EST")
                        .semester("S2")
                        .isActive(true)
                        .build()
        );
    }

    public List<AssignmentDto> listAssignments(UUID courseId) {
        return List.of(
                AssignmentDto.builder()
                        .id(UUID.randomUUID())
                        .courseId(courseId)
                        .courseTitle("Introduction to Machine Learning")
                        .title("Linear Regression Report")
                        .description("Implement and analyze simple linear regression on a provided dataset")
                        .dueAt(OffsetDateTime.now().plusDays(7))
                        .complexity(3.2)
                        .assignmentType("PROJECT")
                        .build(),
                AssignmentDto.builder()
                        .id(UUID.randomUUID())
                        .courseId(courseId)
                        .courseTitle("Introduction to Machine Learning")
                        .title("Neural Network Lab")
                        .description("Build a basic feedforward neural network from scratch")
                        .dueAt(OffsetDateTime.now().plusDays(14))
                        .complexity(4.8)
                        .assignmentType("HOMEWORK")
                        .build()
        );
    }
}
