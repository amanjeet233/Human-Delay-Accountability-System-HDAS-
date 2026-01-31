-- Migration: Add status column to users table
-- Date: 2026-01-31
-- Purpose: Support user registration workflow with PENDING status

-- Add status column to users table
ALTER TABLE users 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' 
AFTER active;

-- Update existing users to ACTIVE status
UPDATE users 
SET status = 'ACTIVE' 
WHERE active = TRUE;

-- Update inactive users to SUSPENDED status
UPDATE users 
SET status = 'SUSPENDED' 
WHERE active = FALSE;

-- Add index for status queries
CREATE INDEX idx_user_status ON users(status);

-- Verify migration
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_users,
    SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_users,
    SUM(CASE WHEN status = 'SUSPENDED' THEN 1 ELSE 0 END) as suspended_users
FROM users;
