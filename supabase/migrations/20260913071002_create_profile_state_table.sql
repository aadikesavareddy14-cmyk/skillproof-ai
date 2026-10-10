/*
# Create profile_state table for persisting resume + GitHub connection progress

1. New Tables
- `profile_state`
  - `id` (uuid, primary key, defaults to auth.uid())
  - `user_id` (uuid, not null, references auth.users, defaults to auth.uid())
  - `resume_uploaded` (boolean, default false) — whether the user has uploaded a resume
  - `resume_file_name` (text, nullable) — name of the uploaded file
  - `resume_file_size` (bigint, nullable) — size in bytes
  - `resume_storage_path` (text, nullable) — storage path for the file
  - `github_connected` (boolean, default false) — whether GitHub is connected
  - `github_username` (text, nullable) — the connected GitHub username
  - `github_email` (text, nullable) — email from GitHub (if OAuth)
  - `github_connection_method` (text, nullable) — 'oauth' or 'manual'
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `profile_state`.
- Owner-scoped CRUD: each authenticated user can only access their own row.
- SELECT, INSERT, UPDATE, DELETE policies scoped to auth.uid() = user_id.

3. Notes
- The `id` column defaults to `auth.uid()` so each user has exactly one row.
- On first sign-in, the app upserts a row; subsequent updates modify it.
- This table persists the locked-state checklist progress so users return to
  the same state after closing the app.
*/

CREATE TABLE IF NOT EXISTS profile_state (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_uploaded boolean NOT NULL DEFAULT false,
  resume_file_name text,
  resume_file_size bigint,
  resume_storage_path text,
  resume_score integer DEFAULT 0,
  resume_score_previous integer,
  resume_score_factors jsonb,
  resume_analyzed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profile_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile_state" ON profile_state;
CREATE POLICY "select_own_profile_state" ON profile_state FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile_state" ON profile_state;
CREATE POLICY "insert_own_profile_state" ON profile_state FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile_state" ON profile_state;
CREATE POLICY "update_own_profile_state" ON profile_state FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile_state" ON profile_state;
CREATE POLICY "delete_own_profile_state" ON profile_state FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
