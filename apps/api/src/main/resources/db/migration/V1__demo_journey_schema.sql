CREATE TABLE demo_contact (
    id VARCHAR(40) PRIMARY KEY,
    display_name VARCHAR(80) NOT NULL,
    relationship VARCHAR(40) NOT NULL,
    initials VARCHAR(8) NOT NULL,
    color VARCHAR(20) NOT NULL
);

INSERT INTO demo_contact (id, display_name, relationship, initials, color) VALUES
    ('maya', 'Maya N.', 'Sister', 'MN', 'lavender'),
    ('thabo', 'Thabo K.', 'Friend', 'TK', 'peach');

CREATE TABLE journey (
    id UUID PRIMARY KEY,
    destination_label VARCHAR(48) NOT NULL,
    contact_id VARCHAR(40) REFERENCES demo_contact(id),
    contact_name VARCHAR(80) NOT NULL,
    status VARCHAR(16) NOT NULL CHECK (status IN ('ACTIVE', 'OVERDUE', 'COMPLETED', 'CANCELLED')),
    traveller_token_hash CHAR(64) NOT NULL UNIQUE,
    contact_token_hash CHAR(64) UNIQUE,
    contact_token_expires_at TIMESTAMPTZ NOT NULL,
    contact_email_ciphertext TEXT,
    contact_email_lookup_hash CHAR(64),
    email_consent_at TIMESTAMPTZ,
    shared_location_ciphertext TEXT,
    location_accuracy_m INTEGER,
    location_captured_at TIMESTAMPTZ,
    location_consent_at TIMESTAMPTZ,
    location_expires_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ NOT NULL,
    deadline_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    overdue_at TIMESTAMPTZ,
    extension_minutes_total INTEGER NOT NULL DEFAULT 0 CHECK (extension_minutes_total BETWEEN 0 AND 120),
    version BIGINT NOT NULL DEFAULT 0,
    CHECK (deadline_at > started_at)
);

CREATE INDEX journey_due_idx ON journey (deadline_at) WHERE status = 'ACTIVE';
CREATE INDEX journey_email_throttle_idx ON journey (contact_email_lookup_hash, started_at DESC);

CREATE TABLE journey_event (
    id BIGSERIAL PRIMARY KEY,
    journey_id UUID NOT NULL REFERENCES journey(id) ON DELETE CASCADE,
    event_type VARCHAR(32) NOT NULL CHECK (event_type IN ('STARTED', 'DEADLINE_EXTENDED', 'DEMO_EXPIRY_TRIGGERED', 'LOCATION_SHARED', 'LOCATION_REMOVED', 'OVERDUE', 'CHECKED_IN', 'CANCELLED', 'CONTACT_ACKNOWLEDGED')),
    actor_type VARCHAR(16) NOT NULL CHECK (actor_type IN ('TRAVELLER', 'CONTACT', 'SYSTEM')),
    safe_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX journey_event_history_idx ON journey_event (journey_id, occurred_at);

CREATE TABLE contact_alert (
    id UUID PRIMARY KEY,
    journey_id UUID NOT NULL UNIQUE REFERENCES journey(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    acknowledged_at TIMESTAMPTZ
);

CREATE TABLE notification_outbox (
    id UUID PRIMARY KEY,
    alert_id UUID NOT NULL UNIQUE REFERENCES contact_alert(id) ON DELETE CASCADE,
    status VARCHAR(16) NOT NULL CHECK (status IN ('SIMULATED', 'QUEUED', 'SENDING', 'SENT', 'UNKNOWN', 'FAILED', 'CANCELLED')),
    idempotency_key VARCHAR(80) NOT NULL UNIQUE,
    payload_ciphertext TEXT,
    attempt_count INTEGER NOT NULL DEFAULT 0,
    available_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lease_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ
);

CREATE INDEX notification_outbox_due_idx ON notification_outbox (status, available_at);

CREATE TABLE notification_attempt (
    id UUID PRIMARY KEY,
    outbox_id UUID NOT NULL REFERENCES notification_outbox(id) ON DELETE CASCADE,
    channel VARCHAR(16) NOT NULL CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS')),
    outcome VARCHAR(16) NOT NULL CHECK (outcome IN ('SIMULATED', 'ACCEPTED', 'REJECTED', 'UNKNOWN')),
    attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
    provider_message_id VARCHAR(120),
    failure_code VARCHAR(80),
    attempted_at TIMESTAMPTZ NOT NULL,
    UNIQUE (outbox_id, attempt_number)
);
