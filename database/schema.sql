-- Task Management System Database Schema (Supabase / PostgreSQL)
-- Run this in Supabase SQL Editor.

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    request_date DATE,
    created_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Pending',
    task_type VARCHAR(50) NOT NULL,
    delivered_date DATE NULL,
    subtasks JSONB DEFAULT '[]'::jsonb,
    first_completed_date TIMESTAMPTZ NULL,
    last_completed_date TIMESTAMPTZ NULL,
    completion_count INT DEFAULT 0,
    reopened_count INT DEFAULT 0,
    CONSTRAINT tasks_task_type_check
        CHECK (task_type IN ('CR', 'Data request', 'config'))
);

-- Status history table for tracking all status changes
CREATE TABLE IF NOT EXISTS task_status_history (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    changed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_task_status_history_task_id ON task_status_history(task_id);
CREATE INDEX IF NOT EXISTS idx_task_status_history_changed_at ON task_status_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_task_status_history_new_status ON task_status_history(new_status);

-- Note: To create users, use the create_user.py script in the backend directory
-- Example: python backend/create_user.py
-- Or create users through the application interface after first setup

