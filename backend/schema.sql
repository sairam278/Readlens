-- ReadLens Supabase Schema (PostgreSQL)
-- Run this in your Supabase project → SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS documents (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name             VARCHAR(255) NOT NULL,
  size             BIGINT,
  page_count       INT,
  file_key         VARCHAR(500),
  difficulty_score VARCHAR(50),
  summary          TEXT,
  sections_json    JSONB,
  key_topics_json  JSONB,
  status           VARCHAR(50)  DEFAULT 'processing',
  created_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS key_sentences (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id    UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  page_number    INT,
  sentence_index INT,
  sentence_text  TEXT
);

CREATE TABLE IF NOT EXISTS reading_sessions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id         UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  started_at          TIMESTAMPTZ DEFAULT NOW(),
  ended_at            TIMESTAMPTZ,
  pages_read          INT         DEFAULT 0,
  avg_wpm             INT         DEFAULT 0,
  comprehension_score INT         DEFAULT 0
);

CREATE TABLE IF NOT EXISTS section_progress (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id         UUID         NOT NULL REFERENCES reading_sessions(id) ON DELETE CASCADE,
  section_name       VARCHAR(255),
  time_spent_seconds INT,
  wpm                INT,
  completed_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID         NOT NULL REFERENCES reading_sessions(id) ON DELETE CASCADE,
  section_name   VARCHAR(255),
  question       TEXT,
  correct_answer TEXT,
  user_answer    TEXT,
  is_correct     BOOLEAN,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS word_cache (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  word       VARCHAR(255) NOT NULL UNIQUE,
  definition TEXT,
  created_at TIMESTAMPTZ  DEFAULT NOW()
);
