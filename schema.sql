CREATE TABLE IF NOT EXISTS birthdays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,      -- PREFERRED name: what the wall and cards display
  name_key TEXT NOT NULL,
  legal_first TEXT,        -- legal names: required by the app since July 13,
  legal_last TEXT,         --   2026; owner-only in the API, never on the wall
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  month INTEGER NOT NULL,
  day INTEGER NOT NULL,
  year INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip TEXT,
  edit_token TEXT,
  city TEXT,
  country TEXT,
  avatar TEXT,
  instagram TEXT,
  linkedin TEXT,
  x_handle TEXT,
  join_month INTEGER,
  join_day INTEGER,
  join_year INTEGER,
  additional_roles TEXT, -- JSON array of 0-4 additional role titles
  latitude REAL,         -- geo of the submitting request (team globe);
  longitude REAL,        --   legacy rows backfilled from their visits
  timezone TEXT,         -- IANA tz for the live local-time clocks
  UNIQUE (name_key, company)
);

-- Retained for backward compatibility only: since July 11, 2026 title
-- recommendations are emailed by the employee directly (mailto: flow) and the
-- app no longer reads or writes this table.
CREATE TABLE IF NOT EXISTS title_recommendations (
  id TEXT PRIMARY KEY,             -- client-generated UUID (idempotency key)
  title TEXT NOT NULL,
  intended_use TEXT NOT NULL,      -- 'primary' | 'additional'
  explanation TEXT,
  employee_id INTEGER,
  employee_name TEXT,
  employee_email TEXT,
  current_primary TEXT,
  current_roles TEXT,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  review_status TEXT NOT NULL DEFAULT 'Pending',   -- Pending | Approved | Rejected | Needs Revision
  email_status TEXT NOT NULL DEFAULT 'Pending'     -- Pending | Sent | Failed
);

-- Same name = same person regardless of company value; upserts key on this.
CREATE UNIQUE INDEX IF NOT EXISTS idx_birthdays_name_key ON birthdays (name_key);

CREATE TABLE IF NOT EXISTS visits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL DEFAULT (datetime('now')),
  ip TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  latitude REAL,
  longitude REAL,
  colo TEXT,
  timezone TEXT,
  user_agent TEXT,
  path TEXT,
  name TEXT
);

CREATE INDEX IF NOT EXISTS idx_visits_id_desc ON visits (id DESC);
