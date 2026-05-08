package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.CourseDetailDto;
import com.echoid.nexus.dto.CourseDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/lms")
@Tag(name = "LMS", description = "Mocked Moodle and Google Classroom endpoints — identical response shapes regardless of LMS source")
public class LmsController {

    // ── Moodle ─────────────────────────────────────────

    @GetMapping("/moodle/courses")
    @Operation(summary = "List Moodle courses",
            description = "Returns mocked Moodle course fixtures with stable section IDs")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Course list returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<ApiResponse<List<CourseDto>>> listMoodleCourses() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — see KAN-12"));
    }

    @GetMapping("/moodle/courses/{id}")
    @Operation(summary = "Moodle course detail with section tree",
            description = "Returns full section/chapter tree for the explainer screen pickers")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Course detail returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<ApiResponse<CourseDetailDto>> getMoodleCourse(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — see KAN-12"));
    }

    // ── Google Classroom ───────────────────────────────

    @GetMapping("/gclassroom/courses")
    @Operation(summary = "List Google Classroom courses",
            description = "Returns mocked Google Classroom course fixtures mapped to shared CourseDto shape")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Course list returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<ApiResponse<List<CourseDto>>> listGClassroomCourses() {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — see KAN-13"));
    }

    @GetMapping("/gclassroom/courses/{id}")
    @Operation(summary = "Google Classroom course detail with section tree")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Course detail returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<ApiResponse<CourseDetailDto>> getGClassroomCourse(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — see KAN-13"));
    }
}
