package com.echoid.nexus.repository;

import com.echoid.nexus.model.EmailVerificationToken;
import com.echoid.nexus.model.User;
import com.echoid.nexus.model.enums.SchoolEnum;
import com.echoid.nexus.model.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("h2")
class EmailVerificationTokenRepositoryTest {

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .email("student@ensa.uit.ac.ma")
                .passwordHash("hash")
                .displayName("Student")
                .role(UserRole.STUDENT)
                .school(SchoolEnum.ENSA)
                .emailVerified(true)
                .build());
    }

    private EmailVerificationToken createToken(User user) {
        return EmailVerificationToken.builder()
                .user(user)
                .expiresAt(OffsetDateTime.now().plusDays(1))
                .build();
    }

    @Test
    void findByToken_whenExists_returnsToken() {
        EmailVerificationToken saved = emailVerificationTokenRepository.save(createToken(testUser));

        Optional<EmailVerificationToken> found = emailVerificationTokenRepository.findByToken(saved.getToken());

        assertThat(found).isPresent();
        assertThat(found.get().getToken()).isEqualTo(saved.getToken());
        assertThat(found.get().getUser().getId()).isEqualTo(testUser.getId());
    }

    @Test
    void findByToken_whenNotExists_returnsEmpty() {
        Optional<EmailVerificationToken> found = emailVerificationTokenRepository.findByToken(UUID.randomUUID());

        assertThat(found).isEmpty();
    }

    @Test
    void deleteByUser_removesToken() {
        emailVerificationTokenRepository.save(createToken(testUser));

        emailVerificationTokenRepository.deleteByUser(testUser);

        assertThat(emailVerificationTokenRepository.findAll()).isEmpty();
    }

    @Test
    void deleteByUser_doesNotAffectOtherUsers() {
        User otherUser = userRepository.save(User.builder()
                .email("other@ensa.uit.ac.ma")
                .passwordHash("hash")
                .displayName("Other")
                .role(UserRole.STUDENT)
                .school(SchoolEnum.ENSA)
                .emailVerified(true)
                .build());
        emailVerificationTokenRepository.save(createToken(testUser));
        EmailVerificationToken otherToken = emailVerificationTokenRepository.save(createToken(otherUser));

        emailVerificationTokenRepository.deleteByUser(testUser);

        assertThat(emailVerificationTokenRepository.findByToken(otherToken.getToken())).isPresent();
    }

    @Test
    void save_persistsToken() {
        EmailVerificationToken token = createToken(testUser);

        EmailVerificationToken saved = emailVerificationTokenRepository.save(token);

        assertThat(saved.getToken()).isNotNull();
        assertThat(saved.getExpiresAt()).isNotNull();
    }

    @Test
    void isExpired_returnsTrueForExpiredToken() {
        EmailVerificationToken expired = emailVerificationTokenRepository.save(
                EmailVerificationToken.builder()
                        .user(testUser)
                        .expiresAt(OffsetDateTime.now().minusDays(1))
                        .build());

        assertThat(expired.isExpired()).isTrue();
    }

    @Test
    void isExpired_returnsFalseForValidToken() {
        EmailVerificationToken valid = emailVerificationTokenRepository.save(createToken(testUser));

        assertThat(valid.isExpired()).isFalse();
    }
}
