-- KAN-47 — demo seed data for the live competition demo.
-- Idempotent via ON CONFLICT DO NOTHING so re-running migrations is safe.

-- ── Users ────────────────────────────────────────────────────────────────────
-- BCrypt hash for password "Demo!2026" cost 10 (verified with Spring Security BCryptPasswordEncoder).
INSERT INTO users (id, email, password_hash, display_name, role, school, email_verified)
VALUES
    ('11111111-0000-0000-0000-000000000001', 'mehdi.bahi@uit.ac.ma',
     '$2b$10$Q5THdE7WhqPwjbDeHpL9ouiNAthHkxXhXafLXUb2fu32NmOkdtvrC',
     'Mehdi Bahi', 'STUDENT', 'ENSA', TRUE),
    ('22222222-0000-0000-0000-000000000002', 'prof.demo@uit.ac.ma',
     '$2b$10$Q5THdE7WhqPwjbDeHpL9ouiNAthHkxXhXafLXUb2fu32NmOkdtvrC',
     'Fatima Cherkaoui', 'PROFESSOR', 'ENSA', TRUE),
    ('33333333-0000-0000-0000-000000000003', 'admin.demo@uit.ac.ma',
     '$2b$10$Q5THdE7WhqPwjbDeHpL9ouiNAthHkxXhXafLXUb2fu32NmOkdtvrC',
     'Hassan Idrissi', 'ADMIN', 'ENSA', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ── Courses ──────────────────────────────────────────────────────────────────
-- Course UUIDs match the deterministic IDs generated for LMS fixtures so the
-- DB and the in-memory adapter stay aligned.
INSERT INTO courses (id, title, school, lms_source) VALUES
    ('a30f6a75-cd87-3e15-af58-7e305a8560ee', 'Thermodynamique générale',                                 'ENSA', 'MOODLE'),
    ('bdedf822-a92d-3eb6-a6b3-8b3b7e8e79de', 'Algèbre linéaire et calcul matriciel',                     'ENSA', 'MOODLE'),
    ('71a763cd-d677-3e2b-b022-a2b7552a7b1e', 'Algorithmique & Programmation (Python)',                   'ENSA', 'GCLASSROOM'),
    ('c2573c08-5ff2-3a96-8e5d-8395b708e5bd', 'Probabilités et statistiques',                             'ENSA', 'MOODLE'),
    ('f8823937-6b49-3acc-aa1f-8a2d81b87407', 'Traitement du signal',                                     'ENSA', 'MOODLE'),
    ('df560570-c4e6-38d2-b2ee-70cae8b97e05', 'Chimie',                                                   'ENSA', 'MOODLE')
ON CONFLICT (id) DO NOTHING;

-- ── Enrollments — student.demo enrolled in everything ────────────────────────
INSERT INTO course_enrollments (student_id, course_id) VALUES
    ('11111111-0000-0000-0000-000000000001', 'a30f6a75-cd87-3e15-af58-7e305a8560ee'),
    ('11111111-0000-0000-0000-000000000001', 'bdedf822-a92d-3eb6-a6b3-8b3b7e8e79de'),
    ('11111111-0000-0000-0000-000000000001', '71a763cd-d677-3e2b-b022-a2b7552a7b1e'),
    ('11111111-0000-0000-0000-000000000001', 'c2573c08-5ff2-3a96-8e5d-8395b708e5bd'),
    ('11111111-0000-0000-0000-000000000001', 'f8823937-6b49-3acc-aa1f-8a2d81b87407'),
    ('11111111-0000-0000-0000-000000000001', 'df560570-c4e6-38d2-b2ee-70cae8b97e05')
ON CONFLICT DO NOTHING;

-- ── Interactions — concept queries spread across the last 14 days ────────────
-- Generates ~140 rows so Grafana has shape to draw.
INSERT INTO interactions (student_id, course_id, concept_text, explanation_level, timestamp)
SELECT
    '11111111-0000-0000-0000-000000000001'::uuid,
    course_id::uuid,
    concept,
    level::explanation_level,
    NOW() - (random() * INTERVAL '14 days')
FROM (
    VALUES
        ('a30f6a75-cd87-3e15-af58-7e305a8560ee', 'thermo-1er-principe',         'BEGINNER'),
        ('a30f6a75-cd87-3e15-af58-7e305a8560ee', 'thermo-1er-principe',         'VISUAL'),
        ('a30f6a75-cd87-3e15-af58-7e305a8560ee', 'thermo-1er-principe',         'ADVANCED'),
        ('bdedf822-a92d-3eb6-a6b3-8b3b7e8e79de', 'algebre-diagonalisation',     'VISUAL'),
        ('bdedf822-a92d-3eb6-a6b3-8b3b7e8e79de', 'algebre-diagonalisation',     'BEGINNER'),
        ('71a763cd-d677-3e2b-b022-a2b7552a7b1e', 'algo-recursivite',            'BEGINNER'),
        ('71a763cd-d677-3e2b-b022-a2b7552a7b1e', 'algo-recursivite',            'ADVANCED'),
        ('c2573c08-5ff2-3a96-8e5d-8395b708e5bd', 'proba-bayes',                 'VISUAL'),
        ('f8823937-6b49-3acc-aa1f-8a2d81b87407', 'signal-fourier',              'BEGINNER'),
        ('df560570-c4e6-38d2-b2ee-70cae8b97e05', 'chimie-equilibre',            'VISUAL')
) AS seed(course_id, concept, level)
CROSS JOIN generate_series(1, 14);

-- ── Session events — student logged in most days ─────────────────────────────
INSERT INTO session_events (student_id, event_type, timestamp)
SELECT '11111111-0000-0000-0000-000000000001'::uuid,
       'LOGIN',
       NOW() - (g * INTERVAL '1 day') - (random() * INTERVAL '6 hours')
FROM generate_series(0, 13) g
WHERE random() > 0.15;

-- ── Professor uploads — last 30 days ─────────────────────────────────────────
INSERT INTO professor_uploads (professor_id, course_id, file_type, timestamp)
SELECT '22222222-0000-0000-0000-000000000002'::uuid,
       course_id::uuid,
       file_type,
       NOW() - (random() * INTERVAL '30 days')
FROM (VALUES
    ('a30f6a75-cd87-3e15-af58-7e305a8560ee', 'PDF'),
    ('bdedf822-a92d-3eb6-a6b3-8b3b7e8e79de', 'PDF'),
    ('71a763cd-d677-3e2b-b022-a2b7552a7b1e', 'PNG')
) AS seed(course_id, file_type)
CROSS JOIN generate_series(1, 4);

-- ── Notification log — workload + deadline alerts ────────────────────────────
INSERT INTO notification_log (student_id, trigger_type, payload_summary, is_read, sent_at)
VALUES
    ('11111111-0000-0000-0000-000000000001', 'WORKLOAD_HIGH',
     'Ta charge de travail est élevée — replanifie un créneau pour la révision.', FALSE, NOW() - INTERVAL '4 hours'),
    ('11111111-0000-0000-0000-000000000001', 'DEADLINE_NEAR',
     'TD Thermodynamique à rendre dans 36 h.', TRUE, NOW() - INTERVAL '2 days'),
    ('11111111-0000-0000-0000-000000000001', 'MILESTONE',
     'Tu as franchi 50 % de ton TD Récursivité — continue !', TRUE, NOW() - INTERVAL '5 days');
