package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.service.AiClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiProxyControllerTest {

    @Mock
    private AiClient ai;

    private AiProxyController controller;

    @BeforeEach
    void setUp() {
        controller = new AiProxyController(ai);
    }

    @Test
    void explain_returns200() {
        when(ai.postJson(anyString(), any()))
                .thenReturn(Map.of("result", "explanation text"));

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                controller.explain(Map.of("conceptSlug", "derivatives", "level", "BEGINNER"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isTrue();
        assertThat(response.getBody().getData()).containsEntry("result", "explanation text");
    }

    @Test
    void explain_normalizesConceptToConceptSlug() {
        when(ai.postJson(anyString(), any()))
                .thenReturn(Map.of("result", "ok"));

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                controller.explain(Map.of("concept", "derivatives", "level", "BEGINNER"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void explain_normalizesLevelToLowercase() {
        when(ai.postJson(anyString(), any()))
                .thenReturn(Map.of("result", "ok"));

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                controller.explain(Map.of("conceptSlug", "derivatives", "level", "BEGINNER"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }

    @Test
    void explain_returns502WhenAiServiceFails() {
        when(ai.postJson(anyString(), any()))
                .thenThrow(new RuntimeException("Connection refused"));

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                controller.explain(Map.of("conceptSlug", "derivatives"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).isEqualTo("AI service unreachable");
    }

    @Test
    void ocrUpload_returns200() throws Exception {
        when(ai.postMultipart(anyString(), any(), anyString(), anyString()))
                .thenReturn(Map.of("text", "recognized text"));

        MockMultipartFile file = new MockMultipartFile(
                "file", "notes.jpg", "image/jpeg", "fake-image-content".getBytes());

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                controller.uploadForOcr(file);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).containsEntry("text", "recognized text");
    }

    @Test
    void ocrUpload_returns502WhenAiServiceFails() throws Exception {
        when(ai.postMultipart(anyString(), any(), anyString(), anyString()))
                .thenThrow(new RuntimeException("Connection refused"));

        MockMultipartFile file = new MockMultipartFile(
                "file", "notes.jpg", "image/jpeg", "fake-image-content".getBytes());

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                controller.uploadForOcr(file);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).isEqualTo("AI service unreachable");
    }

    @Test
    void videos_returns200() {
        when(ai.postJson(anyString(), any()))
                .thenReturn(Map.of("result", "video list"));

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                controller.searchVideos(Map.of("conceptSlug", "derivatives"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).containsEntry("result", "video list");
    }

    @Test
    void videos_returns502WhenAiServiceFails() {
        when(ai.postJson(anyString(), any()))
                .thenThrow(new RuntimeException("Connection refused"));

        ResponseEntity<ApiResponse<Map<String, Object>>> response =
                controller.searchVideos(Map.of("conceptSlug", "derivatives"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getMessage()).isEqualTo("AI service unreachable");
    }
}
