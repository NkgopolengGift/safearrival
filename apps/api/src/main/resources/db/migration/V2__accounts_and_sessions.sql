CREATE TABLE account_user (
    id UUID PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    email_normalized VARCHAR(254) NOT NULL UNIQUE,
    display_name VARCHAR(80) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    timezone VARCHAR(80) NOT NULL DEFAULT 'Africa/Johannesburg',
    default_arrival_window_minutes INTEGER NOT NULL DEFAULT 20 CHECK (default_arrival_window_minutes BETWEEN 5 AND 120),
    onboarding_completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE auth_session (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES account_user(id) ON DELETE CASCADE,
    token_hash CHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    last_seen_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ
);

CREATE INDEX auth_session_user_idx ON auth_session(user_id, expires_at DESC);
CREATE INDEX auth_session_expiry_idx ON auth_session(expires_at) WHERE revoked_at IS NULL;

ALTER TABLE journey ADD COLUMN owner_user_id UUID REFERENCES account_user(id) ON DELETE CASCADE;
CREATE INDEX journey_owner_history_idx ON journey(owner_user_id, started_at DESC) WHERE owner_user_id IS NOT NULL;
