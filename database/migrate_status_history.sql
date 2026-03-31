-- Migration script to add status history tracking to existing database
-- Run this in Supabase SQL Editor.

-- Add completion tracking columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS first_completed_date TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS last_completed_date TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS completion_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS reopened_count INT DEFAULT 0;

-- Create status history table
CREATE TABLE IF NOT EXISTS task_status_history (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    changed_by BIGINT,
    notes TEXT,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_task_status_history_task_id ON task_status_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_status_history_changed_at ON task_status_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_task_status_history_new_status ON task_status_history(new_status);

-- Note: This migration is safe to run multiple times
-- It uses IF NOT EXISTS to prevent errors if columns/tables already exist


