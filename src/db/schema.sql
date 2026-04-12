-- Better Auth tables
-- Run this once to set up auth: psql $DATABASE_URL -f src/db/schema.sql

CREATE TABLE IF NOT EXISTS "user" (
  "id"            TEXT        NOT NULL PRIMARY KEY,
  "name"          TEXT        NOT NULL,
  "email"         TEXT        NOT NULL UNIQUE,
  "emailVerified" BOOLEAN     NOT NULL DEFAULT FALSE,
  "image"         TEXT,
  "createdAt"     TIMESTAMP   NOT NULL,
  "updatedAt"     TIMESTAMP   NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "id"        TEXT        NOT NULL PRIMARY KEY,
  "expiresAt" TIMESTAMP   NOT NULL,
  "token"     TEXT        NOT NULL UNIQUE,
  "createdAt" TIMESTAMP   NOT NULL,
  "updatedAt" TIMESTAMP   NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId"    TEXT        NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id"                     TEXT        NOT NULL PRIMARY KEY,
  "accountId"              TEXT        NOT NULL,
  "providerId"             TEXT        NOT NULL,
  "userId"                 TEXT        NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken"            TEXT,
  "refreshToken"           TEXT,
  "idToken"                TEXT,
  "accessTokenExpiresAt"   TIMESTAMP,
  "refreshTokenExpiresAt"  TIMESTAMP,
  "scope"                  TEXT,
  "password"               TEXT,
  "createdAt"              TIMESTAMP   NOT NULL,
  "updatedAt"              TIMESTAMP   NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id"         TEXT        NOT NULL PRIMARY KEY,
  "identifier" TEXT        NOT NULL,
  "value"      TEXT        NOT NULL,
  "expiresAt"  TIMESTAMP   NOT NULL,
  "createdAt"  TIMESTAMP,
  "updatedAt"  TIMESTAMP
);

-- App tables
CREATE TABLE IF NOT EXISTS projects (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT         NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  name       TEXT         NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS environments (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID         NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name       TEXT         NOT NULL,
  sdk_key    TEXT         NOT NULL UNIQUE,
  created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flags (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  environment_id   UUID         NOT NULL REFERENCES environments(id) ON DELETE CASCADE,
  key              TEXT         NOT NULL,
  name             TEXT         NOT NULL,
  is_active        BOOLEAN      NOT NULL DEFAULT FALSE,
  default_rollout  INTEGER      CHECK (default_rollout BETWEEN 0 AND 100),
  created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS targeting_rules (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id         UUID         NOT NULL REFERENCES flags(id) ON DELETE CASCADE,
  field_name      TEXT         NOT NULL,
  values          TEXT[]       NOT NULL,
  rollout_percent INTEGER      CHECK (rollout_percent BETWEEN 0 AND 100),
  serve           BOOLEAN      NOT NULL DEFAULT TRUE,
  priority        INTEGER      NOT NULL DEFAULT 0,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);