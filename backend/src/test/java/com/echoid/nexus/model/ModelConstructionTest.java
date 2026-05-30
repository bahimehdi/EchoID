package com.echoid.nexus.model;

import com.echoid.nexus.model.enums.LmsSource;
import com.echoid.nexus.model.enums.SchoolEnum;
import com.echoid.nexus.model.enums.UserRole;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class ModelConstructionTest {

    @Test
    void user_usesBuilderAndGetter() {
        UUID id = UUID.randomUUID();
        User user = User.builder()
                .id(id)
                .email("student@ensa.uit.ac.ma")
                .passwordHash("encoded")
                .displayName("Ahmed Benali")
                .role(UserRole.STUDENT)
                .school(SchoolEnum.ENSA)
                .emailVerified(true)
                .build();

        assertThat(user.getId()).isEqualTo(id);
        assertThat(user.getEmail()).isEqualTo("student@ensa.uit.ac.ma");
        assertThat(user.getDisplayName()).isEqualTo("Ahmed Benali");
        assertThat(user.getRole()).isEqualTo(UserRole.STUDENT);
        assertThat(user.getSchool()).isEqualTo(SchoolEnum.ENSA);
        assertThat(user.getEmailVerified()).isTrue();
    }

    @Test
    void course_usesBuilderAndGetter() {
        UUID id = UUID.randomUUID();
        Course course = Course.builder()
                .id(id)
                .lmsSource(LmsSource.MOODLE)
                .title("Mathematics")
                .school(SchoolEnum.ENSA)
                .build();

        assertThat(course.getId()).isEqualTo(id);
        assertThat(course.getLmsSource()).isEqualTo(LmsSource.MOODLE);
        assertThat(course.getTitle()).isEqualTo("Mathematics");
        assertThat(course.getSchool()).isEqualTo(SchoolEnum.ENSA);
    }

    @Test
    void assignment_usesBuilderAndGetter() {
        UUID id = UUID.randomUUID();
        Course course = Course.builder().id(UUID.randomUUID()).title("Maths").build();
        Assignment assignment = Assignment.builder()
                .id(id)
                .course(course)
                .title("Linear Regression Report")
                .description("Write a report")
                .complexity(3.5)
                .assignmentType("HOMEWORK")
                .dueAt(OffsetDateTime.now().plusDays(5))
                .build();

        assertThat(assignment.getId()).isEqualTo(id);
        assertThat(assignment.getCourse().getTitle()).isEqualTo("Maths");
        assertThat(assignment.getTitle()).isEqualTo("Linear Regression Report");
        assertThat(assignment.getComplexity()).isEqualTo(3.5);
        assertThat(assignment.getAssignmentType()).isEqualTo("HOMEWORK");
    }

    @Test
    void refreshToken_usesBuilderAndExpiryCheck() {
        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID())
                .expiresAt(OffsetDateTime.now().plusDays(1))
                .build();

        assertThat(token.isExpired()).isFalse();
    }

    @Test
    void refreshToken_isExpiredWhenPastExpiry() {
        RefreshToken token = RefreshToken.builder()
                .token(UUID.randomUUID())
                .expiresAt(OffsetDateTime.now().minusDays(1))
                .build();

        assertThat(token.isExpired()).isTrue();
    }

    @Test
    void emailVerificationToken_usesBuilder() {
        EmailVerificationToken token = EmailVerificationToken.builder()
                .token(UUID.randomUUID())
                .user(User.builder().id(UUID.randomUUID()).email("test@test.com").build())
                .expiresAt(OffsetDateTime.now().plusHours(1))
                .build();

        assertThat(token.getUser()).isNotNull();
        assertThat(token.getUser().getEmail()).isEqualTo("test@test.com");
    }

    @Test
    void milestone_usesBuilder() {
        Assignment assignment = Assignment.builder()
                .id(UUID.randomUUID()).title("Report").build();
        User student = User.builder()
                .id(UUID.randomUUID()).email("student@test.com").build();
        Milestone milestone = Milestone.builder()
                .id(UUID.randomUUID())
                .assignment(assignment)
                .student(student)
                .title("Chapter 1")
                .build();

        assertThat(milestone.getTitle()).isEqualTo("Chapter 1");
        assertThat(milestone.getAssignment().getTitle()).isEqualTo("Report");
        assertThat(milestone.getStudent().getEmail()).isEqualTo("student@test.com");
    }

    @Test
    void enums_haveExpectedValues() {
        assertThat(UserRole.STUDENT.name()).isEqualTo("STUDENT");
        assertThat(UserRole.PROFESSOR.name()).isEqualTo("PROFESSOR");
        assertThat(UserRole.ADMIN.name()).isEqualTo("ADMIN");
        assertThat(SchoolEnum.ENSA.name()).isEqualTo("ENSA");
        assertThat(SchoolEnum.EST.name()).isEqualTo("EST");
        assertThat(LmsSource.MOODLE.name()).isEqualTo("MOODLE");
        assertThat(LmsSource.GOOGLE_CLASSROOM.name()).isEqualTo("GOOGLE_CLASSROOM");
    }
}
