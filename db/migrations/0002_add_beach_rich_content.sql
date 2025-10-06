-- Migration: Add rich content fields to beaches schema
-- Date: 2025-10-06
-- Purpose: Support structured beach descriptions, features, and visitor tips

BEGIN TRANSACTION;

-- Add new fields to beaches table for extended content
-- These are all optional (NULL) to maintain backward compatibility

-- Extended description field (up to 2000 chars for full intro paragraph)
ALTER TABLE beaches ADD COLUMN description TEXT;

-- Parking details (specific access points, timing, difficulty)
ALTER TABLE beaches ADD COLUMN parking_details TEXT;

-- Safety warnings (conditions, hazards, precautions)
ALTER TABLE beaches ADD COLUMN safety_info TEXT;

-- Local context (crowd levels, best times, vendor info)
ALTER TABLE beaches ADD COLUMN local_tips TEXT;

-- Best time to visit (season, time of day, weather)
ALTER TABLE beaches ADD COLUMN best_time TEXT;

-- Create new table for structured beach features
-- Replaces the limitation of binary tags with descriptive features
CREATE TABLE IF NOT EXISTS beach_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beach_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (beach_id) REFERENCES beaches(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX beach_features_beach_idx ON beach_features(beach_id);

-- Create new table for visitor tips/advice
-- Structured tips with categories
CREATE TABLE IF NOT EXISTS beach_tips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  beach_id TEXT NOT NULL,
  category TEXT NOT NULL,
  tip TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (beach_id) REFERENCES beaches(id) ON UPDATE CASCADE ON DELETE CASCADE
);
CREATE INDEX beach_tips_beach_idx ON beach_tips(beach_id);
CREATE INDEX beach_tips_category_idx ON beach_tips(category);

COMMIT;
