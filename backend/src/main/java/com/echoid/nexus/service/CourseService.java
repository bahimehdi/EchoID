package com.echoid.nexus.service;

import com.echoid.nexus.dto.AssignmentDto;
import com.echoid.nexus.dto.CourseDetailDto;
import com.echoid.nexus.dto.CourseDto;
import com.echoid.nexus.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final LmsService lmsService;
    private final CourseRepository courseRepository;

    /**
     * Aggregated list of courses across all LMS sources for the authenticated student.
     * Demo: returns the union of Moodle + Google Classroom fixtures (the seed data
     * pre-enrols the demo student in everything). Production swap-in: filter by
     * course_enrollments rows scoped to the JWT subject.
     */
    public List<CourseDto> listCourses(UUID studentId) {
        List<UUID> enrolledIds = courseRepository.findEnrolledCourseIds(studentId);
        List<CourseDto> all = new ArrayList<>();
        all.addAll(lmsService.getMoodleCourses());
        all.addAll(lmsService.getGClassroomCourses());
        if (enrolledIds.isEmpty()) {
            return all;
        }
        Set<UUID> enrolled = new HashSet<>(enrolledIds);
        return all.stream().filter(c -> enrolled.contains(c.getId())).collect(Collectors.toList());
    }

    public Optional<CourseDetailDto> getCourse(UUID id) {
        return lmsService.getMoodleCourse(id).or(() -> lmsService.getGClassroomCourse(id));
    }

    /**
     * Per-course assignments. For the demo, synthesises one TD per course due in
     * 3–10 days so the workload screen has something to chew on. Production swap-in:
     * read assignments table joined on course_id.
     */
    public List<AssignmentDto> listAssignments(UUID courseId) {
        return lmsService.getMoodleCourse(courseId)
                .or(() -> lmsService.getGClassroomCourse(courseId))
                .map(course -> List.of(
                        AssignmentDto.builder()
                                .id(UUID.nameUUIDFromBytes((courseId + "#td-1").getBytes()))
                                .courseId(courseId)
                                .courseTitle(course.getTitle())
                                .title("TD à rendre")
                                .description("Travail dirigé du chapitre courant")
                                .dueAt(OffsetDateTime.now().plusDays(5))
                                .complexity(3.5)
                                .assignmentType("HOMEWORK")
                                .build(),
                        AssignmentDto.builder()
                                .id(UUID.nameUUIDFromBytes((courseId + "#exam-1").getBytes()))
                                .courseId(courseId)
                                .courseTitle(course.getTitle())
                                .title("Contrôle continu")
                                .description("Contrôle de mi-semestre")
                                .dueAt(OffsetDateTime.now().plusDays(14))
                                .complexity(4.5)
                                .assignmentType("EXAM")
                                .build()
                ))
                .orElse(List.of());
    }
}
