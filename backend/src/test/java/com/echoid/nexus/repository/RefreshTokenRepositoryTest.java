package com.echoid.nexus.repository;

import com.echoid.nexus.model.RefreshToken;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("h2")
class RefreshTokenRepositoryTest {

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

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

    private RefreshToken createToken(User user, int daysUntilExpiry) {
        return RefreshToken.builder()
                .user(user)
                .expiresAt(OffsetDateTime.now().plusDays(daysUntilExpiry))
                .build();
    }

    @Test
    void findByToken_whenExists_returnsToken() {
        RefreshToken saved = refreshTokenRepository.save(createToken(testUser, 7));

        Optional<RefreshToken> found = refreshTokenRepository.findByToken(saved.getToken());

        assertThat(found).isPresent();
        assertThat(found.get().getToken()).isEqualTo(saved.getToken());
        assertThat(found.get().getUser().getId()).isEqualTo(testUser.getId());
    }

    @Test
    void findByToken_whenNotExists_returnsEmpty() {
        Optional<RefreshToken> found = refreshTokenRepository.findByToken(UUID.randomUUID());

        assertThat(found).isEmpty();
    }

    @Test
    void deleteByUser_removesAllTokensForUser() {
        refreshTokenRepository.save(createToken(testUser, 1));
        refreshTokenRepository.save(createToken(testUser, 7));

        refreshTokenRepository.deleteByUser(testUser);

        List<RefreshToken> remaining = refreshTokenRepository.findAll();
        assertThat(remaining).isEmpty();
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
        refreshTokenRepository.save(createToken(testUser, 7));
        RefreshToken otherToken = refreshTokenRepository.save(createToken(otherUser, 7));

        refreshTokenRepository.deleteByUser(testUser);

        Optional<RefreshToken> stillPresent = refreshTokenRepository.findByToken(otherToken.getToken());
        assertThat(stillPresent).isPresent();
    }

    @Test
    void deleteByToken_removesSpecificToken() {
        RefreshToken saved = refreshTokenRepository.save(createToken(testUser, 7));

        refreshTokenRepository.deleteByToken(saved.getToken());

        Optional<RefreshToken> found = refreshTokenRepository.findByToken(saved.getToken());
        assertThat(found).isEmpty();
    }

    @Test
    void save_persistsRefreshToken() {
        RefreshToken token = createToken(testUser, 7);

        RefreshToken saved = refreshTokenRepository.save(token);

        assertThat(saved.getToken()).isNotNull();
        assertThat(saved.getExpiresAt()).isNotNull();
    }

    @Test
    void isExpired_returnsTrueForExpiredToken() {
        RefreshToken expired = refreshTokenRepository.save(createToken(testUser, -1));

        assertThat(expired.isExpired()).isTrue();
    }

    @Test
    void isExpired_returnsFalseForValidToken() {
        RefreshToken valid = refreshTokenRepository.save(createToken(testUser, 7));

        assertThat(valid.isExpired()).isFalse();
    }
}
