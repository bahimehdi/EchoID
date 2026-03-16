-- ============================================================
-- EchoID Nexus — V1 Initial Schema
-- ============================================================

-- ---- universities ----
CREATE TABLE universities (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,
    domain     TEXT        NOT NULL,
    is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_universities_domain UNIQUE (domain)
);

COMMENT ON COLUMN universities.domain IS 'Email domain used to match users to this university, e.g. uit.ac.ma';

-- ---- users ----
CREATE TABLE users (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id  UUID        NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
    email          TEXT        NOT NULL,
    full_name      TEXT,
    role           TEXT        NOT NULL CHECK (role IN ('STUDENT', 'PROFESSOR', 'ADMIN')),
    oauth_provider TEXT,
    oauth_subject  TEXT,
    last_login_at  TIMESTAMPTZ,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_email         UNIQUE (email),
    CONSTRAINT uq_users_oauth_subject UNIQUE (oauth_subject)
);

COMMENT ON COLUMN users.oauth_subject IS 'Immutable identifier from OAuth provider, used to match returning users';

CREATE INDEX idx_users_university_id ON users(university_id);
CREATE INDEX idx_users_email         ON users(email);
CREATE INDEX idx_users_oauth_subject ON users(oauth_subject);

-- ---- courses ----
CREATE TABLE courses (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    university_id UUID        NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
    created_by    UUID        REFERENCES users(id) ON DELETE SET NULL,
    title         TEXT        NOT NULL,
    lms_course_id TEXT,
    lms_source    TEXT        CHECK (lms_source IN ('MOODLE', 'GOOGLE_CLASSROOM')),
    academic_year TEXT,
    semester      TEXT        CHECK (semester IN ('S1', 'S2', 'ANNUAL')),
    is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_university_id ON courses(university_id);
CREATE INDEX idx_courses_created_by    ON courses(created_by);

-- ---- enrollments ----
CREATE TABLE enrollments (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id   UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status      TEXT        NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DROPPED', 'COMPLETED')),
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_enrollments_user_course UNIQUE (user_id, course_id)
);

CREATE INDEX idx_enrollments_user_id   ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);

-- ---- assignments ----
CREATE TABLE assignments (
    id                            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id                     UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title                         TEXT        NOT NULL,
    description                   TEXT,
    ai_complexity_score           FLOAT,
    professor_complexity_override FLOAT,
    due_at                        TIMESTAMPTZ NOT NULL,
    created_at                    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN assignments.ai_complexity_score
    IS 'Written by the AI microservice via internal API, represents estimated student effort';
COMMENT ON COLUMN assignments.professor_complexity_override
    IS 'Set manually by professor; takes precedence over ai_complexity_score in all Wd calculations';

CREATE INDEX idx_assignments_course_id ON assignments(course_id);

-- ---- submissions ----
CREATE TABLE submissions (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID        NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status        TEXT        NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'GRADED')),
    grade         FLOAT,
    feedback      TEXT,
    submitted_at  TIMESTAMPTZ,
    graded_at     TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_submissions_assignment_user UNIQUE (assignment_id, user_id)
);

CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_user_id       ON submissions(user_id);

-- ---- milestones ----
CREATE TABLE milestones (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id    UUID        NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            TEXT        NOT NULL,
    is_completed     BOOLEAN     NOT NULL DEFAULT FALSE,
    suggested_due_at TIMESTAMPTZ,
    completed_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_milestones_assignment_id ON milestones(assignment_id);
CREATE INDEX idx_milestones_user_id       ON milestones(user_id);

-- ---- notifications ----
CREATE TABLE notifications (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id UUID        REFERENCES assignments(id) ON DELETE SET NULL,
    type          TEXT        NOT NULL CHECK (type IN ('DEADLINE_REMINDER', 'MILESTONE_NUDGE', 'WORKLOAD_ALERT', 'SYSTEM')),
    channel       TEXT        NOT NULL CHECK (channel IN ('PUSH', 'EMAIL')),
    message       TEXT        NOT NULL,
    metadata      JSONB,
    is_read       BOOLEAN     NOT NULL DEFAULT FALSE,
    sent_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    read_at       TIMESTAMPTZ
);

COMMENT ON COLUMN notifications.metadata IS 'Arbitrary extra payload, e.g. milestone titles, video links';

CREATE INDEX idx_notifications_user_id       ON notifications(user_id);
CREATE INDEX idx_notifications_assignment_id ON notifications(assignment_id);

-- ---- documents ----
CREATE TABLE documents (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id      UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    assignment_id  UUID        REFERENCES assignments(id) ON DELETE SET NULL,
    uploaded_by    UUID        REFERENCES users(id) ON DELETE SET NULL,
    title          TEXT        NOT NULL,
    file_path      TEXT        NOT NULL,
    mime_type      TEXT,
    ocr_status     TEXT        NOT NULL DEFAULT 'PENDING' CHECK (ocr_status IN ('PENDING', 'PROCESSING', 'DONE', 'FAILED')),
    extracted_text TEXT,
    search_vector  TSVECTOR,
    uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at   TIMESTAMPTZ
);

COMMENT ON COLUMN documents.assignment_id
    IS 'Null means document is attached at course level, not to a specific assignment';
COMMENT ON COLUMN documents.search_vector
    IS 'Populated automatically by trigger after extracted_text is written; used for PostgreSQL full-text search by the Explainer Agent';

CREATE INDEX idx_documents_course_id     ON documents(course_id);
CREATE INDEX idx_documents_assignment_id ON documents(assignment_id);
CREATE INDEX idx_documents_uploaded_by   ON documents(uploaded_by);
CREATE INDEX idx_documents_search_vector ON documents USING GIN (search_vector);

-- Full-text search trigger
CREATE OR REPLACE FUNCTION documents_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('french', coalesce(NEW.extracted_text, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_documents_search_vector
BEFORE INSERT OR UPDATE OF extracted_text ON documents
FOR EACH ROW EXECUTE FUNCTION documents_search_vector_update();

-- ---- ai_interactions ----
CREATE TABLE ai_interactions (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id         UUID        REFERENCES courses(id) ON DELETE SET NULL,
    document_id       UUID        REFERENCES documents(id) ON DELETE SET NULL,
    concept_queried   TEXT        NOT NULL,
    explanation_level TEXT        NOT NULL CHECK (explanation_level IN ('BEGINNER', 'VISUAL', 'ADVANCED')),
    explanation_given TEXT        NOT NULL,
    helpful_rating    SMALLINT    CHECK (helpful_rating BETWEEN 1 AND 5),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN ai_interactions.document_id
    IS 'Set when the student''s question originates from a parsed document';

CREATE INDEX idx_ai_interactions_user_id     ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_course_id   ON ai_interactions(course_id);
CREATE INDEX idx_ai_interactions_document_id ON ai_interactions(document_id);

-- ---- engagement_events ----
CREATE TABLE engagement_events (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id           UUID        REFERENCES courses(id) ON DELETE SET NULL,
    assignment_id       UUID        REFERENCES assignments(id) ON DELETE SET NULL,
    ai_interaction_id   UUID        REFERENCES ai_interactions(id) ON DELETE SET NULL,
    event_type          TEXT        NOT NULL,
    duration_seconds    INTEGER,
    payload             JSONB,
    occurred_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON COLUMN engagement_events.event_type
    IS 'e.g. EXPLANATION_VIEWED, DOCUMENT_OPENED, CONCEPT_REVISITED, ASSIGNMENT_OPENED, MILESTONE_COMPLETED';
COMMENT ON COLUMN engagement_events.payload
    IS 'Event-specific data such as scroll depth, revisit count, or selected text';

CREATE INDEX idx_engagement_events_user_id           ON engagement_events(user_id);
CREATE INDEX idx_engagement_events_course_id         ON engagement_events(course_id);
CREATE INDEX idx_engagement_events_assignment_id     ON engagement_events(assignment_id);
CREATE INDEX idx_engagement_events_ai_interaction_id ON engagement_events(ai_interaction_id);
CREATE INDEX idx_engagement_events_event_type        ON engagement_events(event_type);
CREATE INDEX idx_engagement_events_occurred_at       ON engagement_events(occurred_at);
