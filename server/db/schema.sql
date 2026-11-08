CREATE TABLE IF NOT EXISTS search_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  city TEXT NOT NULL,
  country TEXT,
  admin1 TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  searched_at TEXT NOT NULL DEFAULT (
    strftime('%Y-%m-%d %H:%M:%f', 'now')
  ),
  UNIQUE(latitude, longitude)
);

CREATE INDEX IF NOT EXISTS idx_search_history_searched_at
ON search_history(searched_at DESC);