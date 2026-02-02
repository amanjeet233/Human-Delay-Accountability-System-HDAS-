USE hdas;

-- Create request_status_history table if missing
CREATE TABLE IF NOT EXISTS request_status_history (
  id BINARY(16) PRIMARY KEY,
  request_id BINARY(16) NOT NULL,
  previous_status VARCHAR(50) NOT NULL,
  new_status VARCHAR(50) NOT NULL,
  assigned_role VARCHAR(20) NOT NULL,
  assigned_user_id BINARY(16) NOT NULL,
  remarks TEXT,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  days_spent_days INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE RESTRICT,
  FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_rsh_request (request_id),
  INDEX idx_rsh_changed_at (changed_at),
  INDEX idx_rsh_new_status (new_status),
  INDEX idx_rsh_assigned_role (assigned_role),
  INDEX idx_rsh_assigned_user (assigned_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add columns to users if missing
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'must_change_password');
SET @sql := IF(@exists = 0, 'ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT TRUE', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'status');
SET @sql := IF(@exists = 0, "ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'", 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
