package com.echoid.nexus.service;

import com.echoid.nexus.dto.AssignmentDto;
import com.echoid.nexus.dto.CourseDetailDto;
import com.echoid.nexus.dto.CourseDto;
import com.echoid.nexus.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private LmsService lmsService;
    @Mock
    private CourseRepository courseRepository;

    private CourseService courseService;

    private UUID courseId;
    private CourseDto moodleCourseDto;
    private CourseDto gclassCourseDto;
    private CourseDetailDto moodleDetail;

    @BeforeEach
    void setUp() {
        courseService = new CourseService(lmsService, courseRepository);

        courseId = UUID.randomUUID();
        UUID gclassId = UUID.randomUUID();

        moodleCourseDto = CourseDto.builder()
                .id(courseId)
                .title("Mathematics")
                .lmsSource("MOODLE")
                .school("ENSA")
                .semester("S1")
                .isActive(true)
                .build();

        gclassCourseDto = CourseDto.builder()
                .id(gclassId)
                .title("Physics")
                .lmsSource("GOOGLE_CLASSROOM")
                .school("ENSA")
                .semester("S1")
                .isActive(true)
                .build();

        moodleDetail = CourseDetailDto.builder()
                .id(courseId)
                .title("Mathematics")
                .lmsSource("MOODLE")
                .school("ENSA")
                .semester("S1")
                .isActive(true)
                .build();
    }

    @Test
    void listCourses_whenNoEnrollments_returnsAllLmsCourses() {
        UUID studentId = UUID.randomUUID();
        when(courseRepository.findEnrolledCourseIds(studentId)).thenReturn(List.of());
        when(lmsService.getMoodleCourses()).thenReturn(List.of(moodleCourseDto));
        when(lmsService.getGClassroomCourses()).thenReturn(List.of(gclassCourseDto));

        List<CourseDto> result = courseService.listCourses(studentId);

        assertThat(result).hasSize(2);
        assertThat(result).extracting(CourseDto::getTitle)
                .containsExactlyInAnyOrder("Mathematics", "Physics");
    }

    @Test
    void listCourses_whenEnrolled_filtersToEnrolledIds() {
        UUID studentId = UUID.randomUUID();
        when(courseRepository.findEnrolledCourseIds(studentId)).thenReturn(List.of(courseId));
        when(lmsService.getMoodleCourses()).thenReturn(List.of(moodleCourseDto));
        when(lmsService.getGClassroomCourses()).thenReturn(List.of(gclassCourseDto));

        List<CourseDto> result = courseService.listCourses(studentId);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Mathematics");
    }

    @Test
    void getCourse_findsInMoodleFirst() {
        when(lmsService.getMoodleCourse(courseId)).thenReturn(Optional.of(moodleDetail));

        Optional<CourseDetailDto> result = courseService.getCourse(courseId);

        assertThat(result).isPresent();
        assertThat(result.get().getTitle()).isEqualTo("Mathematics");
    }

    @Test
    void getCourse_fallsBackToGClassroomWhenNotInMoodle() {
        UUID gclassId = UUID.randomUUID();
        CourseDetailDto gclassDetail = CourseDetailDto.builder()
                .id(gclassId)
                .title("Physics")
                .lmsSource("GOOGLE_CLASSROOM")
                .build();

        when(lmsService.getMoodleCourse(gclassId)).thenReturn(Optional.empty());
        when(lmsService.getGClassroomCourse(gclassId)).thenReturn(Optional.of(gclassDetail));

        Optional<CourseDetailDto> result = courseService.getCourse(gclassId);

        assertThat(result).isPresent();
        assertThat(result.get().getTitle()).isEqualTo("Physics");
    }

    @Test
    void getCourse_returnsEmptyWhenNotFound() {
        UUID unknownId = UUID.randomUUID();
        when(lmsService.getMoodleCourse(unknownId)).thenReturn(Optional.empty());
        when(lmsService.getGClassroomCourse(unknownId)).thenReturn(Optional.empty());

        Optional<CourseDetailDto> result = courseService.getCourse(unknownId);

        assertThat(result).isEmpty();
    }

    @Test
    void listAssignments_returnsTwoAssignmentsForExistingCourse() {
        when(lmsService.getMoodleCourse(courseId)).thenReturn(Optional.of(moodleDetail));

        List<AssignmentDto> result = courseService.listAssignments(courseId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("TD à rendre");
        assertThat(result.get(0).getCourseId()).isEqualTo(courseId);
        assertThat(result.get(0).getCourseTitle()).isEqualTo("Mathematics");
        assertThat(result.get(0).getAssignmentType()).isEqualTo("HOMEWORK");
        assertThat(result.get(1).getTitle()).isEqualTo("Contrôle continu");
        assertThat(result.get(1).getAssignmentType()).isEqualTo("EXAM");
    }

    @Test
    void listAssignments_returnsEmptyForUnknownCourse() {
        UUID unknownId = UUID.randomUUID();
        when(lmsService.getMoodleCourse(unknownId)).thenReturn(Optional.empty());
        when(lmsService.getGClassroomCourse(unknownId)).thenReturn(Optional.empty());

        List<AssignmentDto> result = courseService.listAssignments(unknownId);

        assertThat(result).isEmpty();
    }
}
