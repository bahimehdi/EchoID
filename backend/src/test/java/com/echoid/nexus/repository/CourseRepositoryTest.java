package com.echoid.nexus.repository;

import com.echoid.nexus.model.Course;
import com.echoid.nexus.model.User;
import com.echoid.nexus.model.enums.LmsSource;
import com.echoid.nexus.model.enums.SchoolEnum;
import com.echoid.nexus.model.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("h2")
@Sql(scripts = "/create-course-enrollments.sql", executionPhase = Sql.ExecutionPhase.BEFORE_TEST_CLASS)
class CourseRepositoryTest {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EntityManager entityManager;

    private UUID testStudentId;
    private UUID testCourseId;

    @BeforeEach
    void setUp() {
        User student = userRepository.save(User.builder()
                .email("student@ensa.uit.ac.ma")
                .passwordHash("hash")
                .displayName("Student")
                .role(UserRole.STUDENT)
                .school(SchoolEnum.ENSA)
                .emailVerified(true)
                .build());
        testStudentId = student.getId();

        Course course = courseRepository.save(Course.builder()
                .title("Mathématiques")
                .school(SchoolEnum.ENSA)
                .lmsSource(LmsSource.MOODLE)
                .build());
        testCourseId = course.getId();
    }

    @Test
    void save_persistsCourse() {
        Course course = Course.builder()
                .title("Physics")
                .school(SchoolEnum.ENSA)
                .lmsSource(LmsSource.GOOGLE_CLASSROOM)
                .build();

        Course saved = courseRepository.save(course);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTitle()).isEqualTo("Physics");
    }

    @Test
    void findById_returnsCourse() {
        Optional<Course> found = courseRepository.findById(testCourseId);

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Mathématiques");
    }

    @Test
    void findEnrolledCourseIds_withEnrollment_storesDataCorrectly() {
        entityManager.createNativeQuery(
                "INSERT INTO course_enrollments (student_id, course_id) VALUES (CAST(? AS VARCHAR), CAST(? AS VARCHAR))")
                .setParameter(1, testStudentId.toString())
                .setParameter(2, testCourseId.toString())
                .executeUpdate();

        long count = ((Number) entityManager.createNativeQuery(
                "SELECT COUNT(*) FROM course_enrollments WHERE student_id = CAST(? AS VARCHAR)")
                .setParameter(1, testStudentId.toString())
                .getSingleResult()).longValue();

        assertThat(count).isEqualTo(1);
    }

    @Test
    void findEnrolledCourseIds_withNoEnrollments_returnsEmptyList() {
        entityManager.flush();

        List<UUID> courseIds = courseRepository.findEnrolledCourseIds(testStudentId);

        assertThat(courseIds).isEmpty();
    }

    @Test
    void findAll_returnsAllCourses() {
        courseRepository.save(Course.builder()
                .title("Physics")
                .school(SchoolEnum.ENSA)
                .lmsSource(LmsSource.GOOGLE_CLASSROOM)
                .build());

        List<Course> all = courseRepository.findAll();

        assertThat(all).hasSize(2);
    }

    @Test
    void findById_whenNotExists_returnsEmpty() {
        Optional<Course> found = courseRepository.findById(UUID.randomUUID());

        assertThat(found).isEmpty();
    }
}
