-- KAN-16 — Aggregation views for Grafana professor + admin dashboards.
-- Read-only. Joined on existing tables. No writes.

-- Top concepts queried per course over the last 30 days.
CREATE VIEW v_concept_query_volume AS
SELECT
    c.id            AS course_id,
    c.title         AS course_title,
    c.school        AS school,
    i.section_id    AS section_id,
    i.concept_text  AS concept,
    COUNT(*)        AS query_count,
    COUNT(DISTINCT i.student_id) AS unique_students,
    date_trunc('day', i.timestamp) AS day
FROM interactions i
JOIN courses c ON c.id = i.course_id
WHERE i.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY c.id, c.title, c.school, i.section_id, i.concept_text, day;

-- Distribution of explanation levels selected — proxy for cohort comprehension level.
CREATE VIEW v_explanation_level_distribution AS
SELECT
    c.id            AS course_id,
    c.school        AS school,
    i.explanation_level AS level,
    COUNT(*)        AS request_count,
    date_trunc('week', i.timestamp) AS week
FROM interactions i
JOIN courses c ON c.id = i.course_id
GROUP BY c.id, c.school, i.explanation_level, week;

-- OCR usage per professor — adoption metric for the professor dashboard.
CREATE VIEW v_ocr_usage_per_professor AS
SELECT
    pu.professor_id AS professor_id,
    u.display_name  AS professor_name,
    pu.course_id    AS course_id,
    pu.file_type    AS file_type,
    COUNT(*)        AS upload_count,
    date_trunc('week', pu.timestamp) AS week
FROM professor_uploads pu
JOIN users u ON u.id = pu.professor_id
GROUP BY pu.professor_id, u.display_name, pu.course_id, pu.file_type, week;

-- Engagement: distinct days a student logged in over the trailing 14 days.
CREATE VIEW v_session_engagement AS
SELECT
    u.school        AS school,
    s.student_id    AS student_id,
    u.display_name  AS student_name,
    COUNT(DISTINCT date_trunc('day', s.timestamp)) AS active_days_14d,
    MAX(s.timestamp) AS last_seen
FROM session_events s
JOIN users u ON u.id = s.student_id
WHERE s.timestamp >= NOW() - INTERVAL '14 days'
GROUP BY u.school, s.student_id, u.display_name;

-- Notifications sent per trigger per day — feedback loop on the trigger logic.
CREATE VIEW v_notifications_sent AS
SELECT
    nl.trigger_type AS trigger_type,
    COUNT(*)        AS sent_count,
    SUM(CASE WHEN nl.is_read THEN 1 ELSE 0 END) AS read_count,
    date_trunc('day', nl.sent_at) AS day
FROM notification_log nl
GROUP BY nl.trigger_type, day;
