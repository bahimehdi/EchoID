package com.echoid.nexus.repository;

import com.echoid.nexus.model.RefreshToken;
import com.echoid.nexus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(UUID token);

    void deleteByUser(User user);

    void deleteByToken(UUID token);
}
