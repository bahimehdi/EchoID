package com.echoid.nexus.repository;

import com.echoid.nexus.model.Course;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {

    @Query(value = "SELECT ce.course_id FROM course_enrollments ce WHERE ce.student_id = :studentId", nativeQuery = true)
    List<UUID> findEnrolledCourseIds(@Param("studentId") UUID studentId);
}
