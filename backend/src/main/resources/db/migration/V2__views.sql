CREATE VIEW v_queries_per_section AS
SELECT course_id, section_id, COUNT(*) as query_count, date_trunc('day', timestamp) as day
FROM interactions
GROUP BY course_id, section_id, day;

CREATE VIEW v_uploads_per_professor AS
SELECT professor_id, course_id, COUNT(*) as upload_count, date_trunc('week', timestamp) as week
FROM professor_uploads
GROUP BY professor_id, course_id, week;

CREATE VIEW v_active_students_per_school AS
SELECT u.school, date_trunc('day', s.timestamp) as day, COUNT(DISTINCT s.student_id) as student_count
FROM session_events s
JOIN users u ON s.student_id = u.id
GROUP BY u.school, day;
