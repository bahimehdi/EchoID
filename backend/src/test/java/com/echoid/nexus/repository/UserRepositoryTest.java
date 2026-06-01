package com.echoid.nexus.repository;

import com.echoid.nexus.model.User;
import com.echoid.nexus.model.enums.SchoolEnum;
import com.echoid.nexus.model.enums.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("h2")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User createTestUser() {
        return User.builder()
                .email("test@ensa.uit.ac.ma")
                .passwordHash("hash")
                .displayName("Test User")
                .role(UserRole.STUDENT)
                .school(SchoolEnum.ENSA)
                .emailVerified(true)
                .build();
    }

    @Test
    void findByEmail_whenExists_returnsUser() {
        User saved = userRepository.save(createTestUser());

        Optional<User> found = userRepository.findByEmail(saved.getEmail());

        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(saved.getId());
        assertThat(found.get().getDisplayName()).isEqualTo("Test User");
    }

    @Test
    void findByEmail_whenNotExists_returnsEmpty() {
        Optional<User> found = userRepository.findByEmail("nonexistent@test.com");

        assertThat(found).isEmpty();
    }

    @Test
    void existsByEmail_whenExists_returnsTrue() {
        User saved = userRepository.save(createTestUser());

        boolean exists = userRepository.existsByEmail(saved.getEmail());

        assertThat(exists).isTrue();
    }

    @Test
    void existsByEmail_whenNotExists_returnsFalse() {
        boolean exists = userRepository.existsByEmail("nonexistent@test.com");

        assertThat(exists).isFalse();
    }

    @Test
    void save_persistsUserWithGeneratedId() {
        User user = createTestUser();

        User saved = userRepository.save(user);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getEmail()).isEqualTo("test@ensa.uit.ac.ma");
    }

    @Test
    void findById_returnsUser() {
        User saved = userRepository.save(createTestUser());

        Optional<User> found = userRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo(saved.getEmail());
    }

    @Test
    void findByEmail_isCaseSensitive() {
        userRepository.save(createTestUser());

        Optional<User> found = userRepository.findByEmail("TEST@ensa.uit.ac.ma");

        assertThat(found).isEmpty();
    }
}
