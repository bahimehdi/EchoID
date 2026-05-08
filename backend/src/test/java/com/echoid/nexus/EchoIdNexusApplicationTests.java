package com.echoid.nexus;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke test — verifies the full Spring context loads.
 * Requires a live PostgreSQL database, so only runs when
 * DB_HOST environment variable is set (e.g., in Docker Compose).
 */
@SpringBootTest
@ActiveProfiles("dev")
@EnabledIfEnvironmentVariable(named = "DB_HOST", matches = ".+")
class EchoIdNexusApplicationTests {

    @Test
    void contextLoads() {
    }
}
