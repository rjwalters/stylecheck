-- VibeCov Database Schema

CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    author TEXT,
    languages TEXT, -- JSON array of languages
    preferences TEXT, -- JSON object with all preferences
    custom_rules TEXT, -- JSON array of custom rules
    reference_guide_path TEXT,
    is_builtin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS repo_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repo_path TEXT NOT NULL UNIQUE,
    active_profile_id INTEGER,
    file_patterns TEXT, -- JSON array of include patterns
    exclude_patterns TEXT, -- JSON array of exclude patterns
    last_scan_at TIMESTAMP,
    FOREIGN KEY (active_profile_id) REFERENCES profiles(id)
);
