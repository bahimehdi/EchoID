package com.echoid.nexus.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "A single YouTube video result")
public class VideoResultDto {

    @Schema(description = "YouTube video ID", example = "dQw4w9WgXcQ")
    private String videoId;

    @Schema(description = "Video title", example = "Big-O Notation — Full Explanation")
    private String title;

    @Schema(description = "Channel name", example = "CS Academy")
    private String channelName;

    @Schema(description = "Video thumbnail URL", example = "https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg")
    private String thumbnailUrl;

    @Schema(description = "Duration in seconds", example = "540")
    private int durationSeconds;
}
