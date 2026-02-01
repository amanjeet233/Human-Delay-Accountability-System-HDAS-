-- Migration: Add status column to users table
-- Date: 2026-01-31
-- Purpose: Support user registration workflow with PENDING status

-- Check and add status column (MySQL 8.0 compatible)
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''ACTIVE'' AFTER active', 
    'SELECT "Column already exists" AS message INTO @dummy');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing users to ACTIVE status
UPDATE users 
SET status = 'ACTIVE' 
WHERE active = TRUE;

-- Update inactive users to SUSPENDED status
UPDATE users 
SET status = 'SUSPENDED' 
WHERE active = FALSE;

-- Check and add index (MySQL 8.0 compatible)  
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_user_status');

SET @sql = IF(@index_exists = 0, 
    'CREATE INDEX idx_user_status ON users(status)', 
    'SELECT "Index already exists" AS message INTO @dummy');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
