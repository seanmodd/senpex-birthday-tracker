CREATE TABLE IF NOT EXISTS birthdays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL,
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
  UNIQUE (name_key, company)
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
