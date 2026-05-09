-- ---- assignments ----
CREATE TABLE assignments (
    id                            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id                     UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title                         TEXT        NOT NULL,
    description                   TEXT,
    due_at                        TIMESTAMP WITH TIME ZONE NOT NULL,
    complexity                    DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    assignment_type               VARCHAR(50) NOT NULL CHECK (assignment_type IN ('EXAM', 'PROJECT', 'HOMEWORK')),
    created_at                    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at                    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_course_id ON assignments(course_id);

-- ---- milestones ----
CREATE TABLE milestones (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id    UUID        NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title            TEXT        NOT NULL,
    is_completed     BOOLEAN     NOT NULL DEFAULT FALSE,
    suggested_due_at TIMESTAMP WITH TIME ZONE,
    completed_at     TIMESTAMP WITH TIME ZONE,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_milestones_assignment_id ON milestones(assignment_id);
CREATE INDEX idx_milestones_student_id ON milestones(student_id);

-- ---- Update existing tables to link to assignments ----
ALTER TABLE notification_log ADD COLUMN assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL;
ALTER TABLE professor_uploads ADD COLUMN assignment_id UUID REFERENCES assignments(id) ON DELETE SET NULL;
