/*
  # Remove GitHub Integration and Add Resume Scoring Fields

  1. Changes:
    - Drop `github_repos` table if it exists.
    - Remove GitHub columns from `profile_state`:
      - `github_connected`
      - `github_username`
      - `github_email`
      - `github_connection_method`
    - Add resume scoring columns to `profile_state`:
      - `resume_score` (integer, default 0)
      - `resume_score_previous` (integer, nullable)
      - `resume_score_factors` (jsonb, nullable)
      - `resume_analyzed_at` (timestamptz, nullable)

  2. Security:
    - Retain RLS on `profile_state` with user_id ownership check.
*/

-- Drop github_repos table if it exists
DROP TABLE IF EXISTS github_repos CASCADE;

-- Remove GitHub columns from profile_state
ALTER TABLE profile_state
  DROP COLUMN IF EXISTS github_connected,
  DROP COLUMN IF EXISTS github_username,
  DROP COLUMN IF EXISTS github_email,
  DROP COLUMN IF EXISTS github_connection_method;

-- Add resume scoring columns to profile_state
ALTER TABLE profile_state
  ADD COLUMN IF NOT EXISTS resume_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS resume_score_previous integer,
  ADD COLUMN IF NOT EXISTS resume_score_factors jsonb,
  ADD COLUMN IF NOT EXISTS resume_analyzed_at timestamptz;
