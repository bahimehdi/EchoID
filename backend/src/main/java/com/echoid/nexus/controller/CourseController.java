package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.AssignmentDto;
import com.echoid.nexus.dto.CourseDetailDto;
import com.echoid.nexus.dto.CourseDto;
import com.echoid.nexus.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
@Tag(name = "Courses", description = "Course listing and assignment retrieval for enrolled students")
public class CourseController {

    private final CourseService courseService;

    /**
     * Lists all courses the authenticated user is enrolled in.
     * Will query enrollments table filtered by the current user's ID,
     * joining on courses to return full course details.
     */
    @GetMapping
    @Operation(summary = "List enrolled courses",
            description = "Returns all courses the authenticated student is enrolled in, "
                    + "aggregated from both Moodle and Google Classroom sources.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Course list returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public ResponseEntity<ApiResponse<List<CourseDto>>> listCourses() {
        return ResponseEntity.ok(ApiResponse.ok(courseService.listCourses()));
    }

    /**
     * Returns full course detail including section tree for explainer pickers.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get course detail with sections",
            description = "Returns the full course object including its ordered section/chapter tree. "
                    + "Used by the Learning Explainer screen section picker.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Course detail returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<ApiResponse<CourseDetailDto>> getCourseDetail(@PathVariable UUID id) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(ApiResponse.error("Not implemented — course detail with sections pending"));
    }

    /**
     * Returns all assignments for a given course, ordered by due date.
     * Will include computed fields like effective complexity (professor override or AI score).
     */
    @GetMapping("/{id}/assignments")
    @Operation(summary = "List assignments for a course",
            description = "Returns all assignments ordered by due date, "
                    + "with effective complexity score for Wd calculation.")
    @ApiResponses({
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Assignment list returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Course not found")
    })
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> listAssignments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.listAssignments(id)));
    }
}
