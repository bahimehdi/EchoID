package com.echoid.nexus.controller;

import com.echoid.nexus.dto.ApiResponse;
import com.echoid.nexus.dto.AssignmentDto;
import com.echoid.nexus.dto.CourseDto;
import com.echoid.nexus.service.CourseService;
import lombok.RequiredArgsConstructor;
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
public class CourseController {

    private final CourseService courseService;

    /**
     * Lists all courses the authenticated user is enrolled in.
     * Will query enrollments table filtered by the current user's ID,
     * joining on courses to return full course details.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseDto>>> listCourses() {
        return ResponseEntity.ok(ApiResponse.ok(courseService.listCourses()));
    }

    /**
     * Returns all assignments for a given course, ordered by due date.
     * Will include computed fields like effective complexity (professor override or AI score).
     */
    @GetMapping("/{id}/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentDto>>> listAssignments(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(courseService.listAssignments(id)));
    }
}
