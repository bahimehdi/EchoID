package com.echoid.nexus.repository;

import com.echoid.nexus.model.Assignment;
import com.echoid.nexus.model.Course;
import com.echoid.nexus.model.enums.LmsSource;
import com.echoid.nexus.model.enums.SchoolEnum;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.OffsetDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("h2")
class AssignmentRepositoryTest {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    private Course testCourse;

    @BeforeEach
    void setUp() {
        testCourse = courseRepository.save(Course.builder()
                .title("Mathématiques")
                .school(SchoolEnum.ENSA)
                .lmsSource(LmsSource.MOODLE)
                .build());
    }

    private Assignment createAssignment(Course course) {
        return Assignment.builder()
                .course(course)
                .title("Devoir 1")
                .description("Résoudre les exercices 1 à 10")
                .complexity(2.5)
                .assignmentType("HOMEWORK")
                .dueAt(OffsetDateTime.now().plusDays(7))
                .build();
    }

    @Test
    void save_persistsAssignment() {
        Assignment assignment = createAssignment(testCourse);

        Assignment saved = assignmentRepository.save(assignment);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTitle()).isEqualTo("Devoir 1");
        assertThat(saved.getCourse().getId()).isEqualTo(testCourse.getId());
    }

    @Test
    void findById_returnsAssignment() {
        Assignment saved = assignmentRepository.save(createAssignment(testCourse));

        Optional<Assignment> found = assignmentRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Devoir 1");
        assertThat(found.get().getComplexity()).isEqualTo(2.5);
    }

    @Test
    void findAll_returnsAllAssignmentsForCourse() {
        assignmentRepository.save(createAssignment(testCourse));
        assignmentRepository.save(Assignment.builder()
                .course(testCourse)
                .title("Examen final")
                .description("Examen de synthèse")
                .complexity(4.0)
                .assignmentType("EXAM")
                .dueAt(OffsetDateTime.now().plusDays(30))
                .build());

        assertThat(assignmentRepository.findAll()).hasSize(2);
    }

    @Test
    void assignmentType_enumValues() {
        Assignment homework = assignmentRepository.save(
                Assignment.builder()
                        .course(testCourse)
                        .title("Homework")
                        .assignmentType("HOMEWORK")
                        .dueAt(OffsetDateTime.now().plusDays(1))
                        .build());
        Assignment exam = assignmentRepository.save(
                Assignment.builder()
                        .course(testCourse)
                        .title("Exam")
                        .assignmentType("EXAM")
                        .dueAt(OffsetDateTime.now().plusDays(1))
                        .build());
        Assignment project = assignmentRepository.save(
                Assignment.builder()
                        .course(testCourse)
                        .title("Project")
                        .assignmentType("PROJECT")
                        .dueAt(OffsetDateTime.now().plusDays(1))
                        .build());

        assertThat(assignmentRepository.findById(homework.getId())).isPresent();
        assertThat(assignmentRepository.findById(exam.getId())).isPresent();
        assertThat(assignmentRepository.findById(project.getId())).isPresent();
    }
}
