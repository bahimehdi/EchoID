package com.echoid.nexus.config;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class OpenApiConfigTest {

    @Test
    void echoIdOpenAPI_containsCorrectMetadata() {
        OpenApiConfig config = new OpenApiConfig();
        OpenAPI api = config.echoIdOpenAPI();

        assertThat(api.getInfo()).isNotNull();
        assertThat(api.getInfo().getTitle()).isEqualTo("EchoID Nexus API");
        assertThat(api.getInfo().getVersion()).isEqualTo("0.1.0");
        assertThat(api.getInfo().getContact()).isNotNull();
        assertThat(api.getInfo().getContact().getEmail()).isEqualTo("admin@uit.ac.ma");
        assertThat(api.getServers()).hasSize(2);
        assertThat(api.getServers().get(0).getUrl()).isEqualTo("http://localhost:8080");
        assertThat(api.getServers().get(1).getUrl()).isEqualTo("http://backend:8080");
    }
}
