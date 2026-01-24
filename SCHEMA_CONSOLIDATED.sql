-- HDAS Consolidated Schema + Master Seed (Idempotent, Additive Only)
-- Date: 2026-01-24
-- Rules: NO DROP/RENAME; ONLY CREATE TABLE IF NOT EXISTS, ADD COLUMN, CREATE INDEX, INSERT/UPDATE WITH WHERE.
-- Safe re-run supported via information_schema checks and guarded inserts.

-- Create database and select it
CREATE DATABASE IF NOT EXISTS hdas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hdas;

-- ====================================================
-- CORE DOMAIN TABLES (Canonical, JPA/Hibernate compatible)
-- ====================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id BINARY(16) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  INDEX idx_user_email (email),
  INDEX idx_user_username (username),
  INDEX idx_user_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id BINARY(16) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  INDEX idx_role_name (name),
  INDEX idx_role_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Role Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BINARY(16) NOT NULL,
  permission VARCHAR(255) NOT NULL,
  PRIMARY KEY (role_id, permission),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  INDEX idx_role_permission (permission)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BINARY(16) NOT NULL,
  role_id BINARY(16) NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  INDEX idx_user_role_user (user_id),
  INDEX idx_user_role_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Processes
CREATE TABLE IF NOT EXISTS processes (
  id BINARY(16) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  version VARCHAR(50) NOT NULL DEFAULT 'v1',
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  INDEX idx_process_name (name),
  INDEX idx_process_version (name, version),
  INDEX idx_process_active (active),
  UNIQUE KEY uk_process_name_version (name, version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Process Steps
CREATE TABLE IF NOT EXISTS process_steps (
  id BINARY(16) PRIMARY KEY,
  process_id BINARY(16) NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sequence_order INT NOT NULL,
  responsible_role VARCHAR(100),
  default_sla_duration_seconds BIGINT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE RESTRICT,
  INDEX idx_step_process (process_id),
  INDEX idx_step_sequence (process_id, sequence_order),
  INDEX idx_step_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SLAs
CREATE TABLE IF NOT EXISTS slas (
  id BINARY(16) PRIMARY KEY,
  process_step_id BINARY(16) NOT NULL,
  role_id BINARY(16),
  role_name VARCHAR(100),
  allowed_duration_seconds BIGINT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (process_step_id) REFERENCES process_steps(id) ON DELETE RESTRICT,
  INDEX idx_sla_step (process_step_id),
  INDEX idx_sla_role (role_id),
  INDEX idx_sla_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Requests
CREATE TABLE IF NOT EXISTS requests (
  id BINARY(16) PRIMARY KEY,
  process_id BINARY(16) NOT NULL,
  created_by_id BINARY(16) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (process_id) REFERENCES processes(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_request_process (process_id),
  INDEX idx_request_creator (created_by_id),
  INDEX idx_request_status (status),
  INDEX idx_request_created (created_at),
  INDEX idx_request_started (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- File Attachments
CREATE TABLE IF NOT EXISTS file_attachments (
  id BINARY(16) PRIMARY KEY,
  request_id BINARY(16) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  content_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path VARCHAR(500) NOT NULL,
  description VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE RESTRICT,
  INDEX idx_attachment_request (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id BINARY(16) PRIMARY KEY,
  request_id BINARY(16) NOT NULL,
  process_step_id BINARY(16) NOT NULL,
  assigned_to_id BINARY(16) NOT NULL,
  assigned_by_id BINARY(16),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  allowed_duration_seconds BIGINT,
  actual_duration_seconds BIGINT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE RESTRICT,
  FOREIGN KEY (process_step_id) REFERENCES process_steps(id) ON DELETE RESTRICT,
  FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_assignment_request (request_id),
  INDEX idx_assignment_user (assigned_to_id),
  INDEX idx_assignment_step (process_step_id),
  INDEX idx_assignment_status (status),
  INDEX idx_assignment_assigned (assigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delays
CREATE TABLE IF NOT EXISTS delays (
  id BINARY(16) PRIMARY KEY,
  assignment_id BINARY(16) NOT NULL,
  responsible_user_id BINARY(16) NOT NULL,
  delay_seconds BIGINT NOT NULL,
  reason TEXT,
  reason_category VARCHAR(100),
  detected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  justification TEXT,
  justified_by_id BINARY(16),
  justified_at TIMESTAMP NULL,
  justified BOOLEAN NOT NULL DEFAULT FALSE,
  original_assignment_id BINARY(16),
  is_shadow_delay BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE RESTRICT,
  FOREIGN KEY (responsible_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_delay_assignment (assignment_id),
  INDEX idx_delay_responsible (responsible_user_id),
  INDEX idx_delay_created (created_at),
  INDEX idx_delay_justified (justified),
  INDEX idx_delay_shadow (is_shadow_delay)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Feature Flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  required_roles JSON,
  dependencies JSON,
  impact VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
  category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(100),
  INDEX idx_feature_name (name),
  INDEX idx_feature_enabled (enabled),
  INDEX idx_feature_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id BIGINT,
  username VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  details TEXT,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  severity VARCHAR(20) NOT NULL DEFAULT 'LOW',
  category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
  legal_hold BOOLEAN NOT NULL DEFAULT FALSE,
  legal_hold_reason TEXT,
  legal_hold_by VARCHAR(100),
  legal_hold_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_created (created_at),
  INDEX idx_audit_timestamp (timestamp),
  INDEX idx_audit_severity (severity),
  INDEX idx_audit_category (category),
  INDEX idx_audit_legal_hold (legal_hold)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Escalation Rules
CREATE TABLE IF NOT EXISTS escalation_rules (
  id BINARY(16) PRIMARY KEY,
  process_step_id BINARY(16) NOT NULL,
  threshold_percentage INT NOT NULL DEFAULT 80,
  escalation_role_id BINARY(16),
  escalation_user_id BINARY(16),
  cooldown_seconds BIGINT NOT NULL DEFAULT 3600,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (process_step_id) REFERENCES process_steps(id) ON DELETE RESTRICT,
  INDEX idx_escalation_step (process_step_id),
  INDEX idx_escalation_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Escalation History
CREATE TABLE IF NOT EXISTS escalation_history (
  id BINARY(16) PRIMARY KEY,
  assignment_id BINARY(16) NOT NULL,
  escalated_from_user_id BINARY(16),
  escalated_to_user_id BINARY(16),
  escalated_to_role_id BINARY(16),
  reason TEXT,
  escalated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE RESTRICT,
  INDEX idx_escalation_history_assignment (assignment_id),
  INDEX idx_escalation_history_created (escalated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delay Justifications
CREATE TABLE IF NOT EXISTS delay_justifications (
  id BINARY(16) PRIMARY KEY,
  delay_id BINARY(16) NOT NULL,
  justified_by_id BINARY(16) NOT NULL,
  justification_text TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  approved_by_id BINARY(16),
  approved_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (delay_id) REFERENCES delays(id) ON DELETE RESTRICT,
  FOREIGN KEY (justified_by_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_justification_delay (delay_id),
  INDEX idx_justification_approved (approved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================
-- Section 1: Additive Schema Ensures (from Phase-4)
-- ==========================

-- Helper: run a conditional column add
-- Usage: set @exists := (select count(*) ...); set @sql := if(@exists=0,'ALTER TABLE ... ADD COLUMN ...',NULL); prepare/execute/deallocate;

-- Users table columns
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'active');
SET @sql := IF(@exists = 0, 'ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'version_num');
SET @sql := IF(@exists = 0, 'ALTER TABLE users ADD COLUMN version_num BIGINT NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'updated_at');
SET @sql := IF(@exists = 0, 'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Roles table columns
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'roles' AND column_name = 'version_num');
SET @sql := IF(@exists = 0, 'ALTER TABLE roles ADD COLUMN version_num BIGINT NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ProcessStep table columns
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'process_steps' AND column_name = 'responsible_role');
SET @sql := IF(@exists = 0, 'ALTER TABLE process_steps ADD COLUMN responsible_role VARCHAR(100) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'process_steps' AND column_name = 'default_sla_duration_seconds');
SET @sql := IF(@exists = 0, 'ALTER TABLE process_steps ADD COLUMN default_sla_duration_seconds BIGINT NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Request table columns
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'requests' AND column_name = 'started_at');
SET @sql := IF(@exists = 0, 'ALTER TABLE requests ADD COLUMN started_at TIMESTAMP NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'requests' AND column_name = 'completed_at');
SET @sql := IF(@exists = 0, 'ALTER TABLE requests ADD COLUMN completed_at TIMESTAMP NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'requests' AND column_name = 'created_by_id');
SET @sql := IF(@exists = 0, 'ALTER TABLE requests ADD COLUMN created_by_id BINARY(16) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FileAttachment table columns
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'file_attachments' AND column_name = 'content_type');
SET @sql := IF(@exists = 0, 'ALTER TABLE file_attachments ADD COLUMN content_type VARCHAR(100) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'file_attachments' AND column_name = 'storage_path');
SET @sql := IF(@exists = 0, 'ALTER TABLE file_attachments ADD COLUMN storage_path VARCHAR(500) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'file_attachments' AND column_name = 'description');
SET @sql := IF(@exists = 0, 'ALTER TABLE file_attachments ADD COLUMN description VARCHAR(500) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Assignment table columns
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'assignments' AND column_name = 'assigned_by_id');
SET @sql := IF(@exists = 0, 'ALTER TABLE assignments ADD COLUMN assigned_by_id BINARY(16) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'assignments' AND column_name = 'notes');
SET @sql := IF(@exists = 0, 'ALTER TABLE assignments ADD COLUMN notes TEXT NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Delay table columns
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'delays' AND column_name = 'responsible_user_id');
SET @sql := IF(@exists = 0, 'ALTER TABLE delays ADD COLUMN responsible_user_id BINARY(16) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'delays' AND column_name = 'justification');
SET @sql := IF(@exists = 0, 'ALTER TABLE delays ADD COLUMN justification TEXT NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'delays' AND column_name = 'justified_by_id');
SET @sql := IF(@exists = 0, 'ALTER TABLE delays ADD COLUMN justified_by_id BINARY(16) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'delays' AND column_name = 'justified_at');
SET @sql := IF(@exists = 0, 'ALTER TABLE delays ADD COLUMN justified_at TIMESTAMP NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'delays' AND column_name = 'is_justified');
SET @sql := IF(@exists = 0, 'ALTER TABLE delays ADD COLUMN is_justified BOOLEAN NOT NULL DEFAULT FALSE', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'delays' AND column_name = 'original_assignment_id');
SET @sql := IF(@exists = 0, 'ALTER TABLE delays ADD COLUMN original_assignment_id BINARY(16) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'delays' AND column_name = 'is_shadow_delay');
SET @sql := IF(@exists = 0, 'ALTER TABLE delays ADD COLUMN is_shadow_delay BOOLEAN NOT NULL DEFAULT FALSE', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- EscalationRule table columns
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'escalation_rules' AND column_name = 'process_step_id');
SET @sql := IF(@exists = 0, 'ALTER TABLE escalation_rules ADD COLUMN process_step_id BINARY(16) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'escalation_rules' AND column_name = 'threshold_percentage');
SET @sql := IF(@exists = 0, 'ALTER TABLE escalation_rules ADD COLUMN threshold_percentage INT NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'escalation_rules' AND column_name = 'cooldown_seconds');
SET @sql := IF(@exists = 0, 'ALTER TABLE escalation_rules ADD COLUMN cooldown_seconds BIGINT NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'escalation_rules' AND column_name = 'escalation_user_id');
SET @sql := IF(@exists = 0, 'ALTER TABLE escalation_rules ADD COLUMN escalation_user_id BINARY(16) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- FeatureFlag table columns (BIGINT id model)
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'feature_flags' AND column_name = 'impact');
SET @sql := IF(@exists = 0, 'ALTER TABLE feature_flags ADD COLUMN impact VARCHAR(50) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'feature_flags' AND column_name = 'updated_by');
SET @sql := IF(@exists = 0, 'ALTER TABLE feature_flags ADD COLUMN updated_by VARCHAR(255) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'feature_flags' AND column_name = 'updated_at');
SET @sql := IF(@exists = 0, 'ALTER TABLE feature_flags ADD COLUMN updated_at TIMESTAMP NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'feature_flags' AND column_name = 'required_roles');
SET @sql := IF(@exists = 0, 'ALTER TABLE feature_flags ADD COLUMN required_roles JSON NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'feature_flags' AND column_name = 'dependencies');
SET @sql := IF(@exists = 0, 'ALTER TABLE feature_flags ADD COLUMN dependencies JSON NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- AuditLog table columns (BIGINT id model)
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'audit_logs' AND column_name = 'user_agent');
SET @sql := IF(@exists = 0, 'ALTER TABLE audit_logs ADD COLUMN user_agent VARCHAR(500) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'audit_logs' AND column_name = 'legal_hold_reason');
SET @sql := IF(@exists = 0, 'ALTER TABLE audit_logs ADD COLUMN legal_hold_reason TEXT NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'audit_logs' AND column_name = 'legal_hold_by');
SET @sql := IF(@exists = 0, 'ALTER TABLE audit_logs ADD COLUMN legal_hold_by VARCHAR(255) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'audit_logs' AND column_name = 'legal_hold_at');
SET @sql := IF(@exists = 0, 'ALTER TABLE audit_logs ADD COLUMN legal_hold_at TIMESTAMP NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- SLA table columns
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'slas' AND column_name = 'process_step_id');
SET @sql := IF(@exists = 0, 'ALTER TABLE slas ADD COLUMN process_step_id BINARY(16) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'slas' AND column_name = 'role_id');
SET @sql := IF(@exists = 0, 'ALTER TABLE slas ADD COLUMN role_id BINARY(16) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'slas' AND column_name = 'role_name');
SET @sql := IF(@exists = 0, 'ALTER TABLE slas ADD COLUMN role_name VARCHAR(100) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'slas' AND column_name = 'allowed_duration_seconds');
SET @sql := IF(@exists = 0, 'ALTER TABLE slas ADD COLUMN allowed_duration_seconds BIGINT NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'slas' AND column_name = 'description');
SET @sql := IF(@exists = 0, 'ALTER TABLE slas ADD COLUMN description TEXT NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'slas' AND column_name = 'active');
SET @sql := IF(@exists = 0, 'ALTER TABLE slas ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'slas' AND column_name = 'updated_at');
SET @sql := IF(@exists = 0, 'ALTER TABLE slas ADD COLUMN updated_at TIMESTAMP NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- role_permissions permission column
SET @exists := (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'role_permissions' AND column_name = 'permission');
SET @sql := IF(@exists = 0, 'ALTER TABLE role_permissions ADD COLUMN permission VARCHAR(255) NULL', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- EscalationHistory table creation (singular name expected by JPA)
CREATE TABLE IF NOT EXISTS escalation_history (
  id BINARY(16) PRIMARY KEY,
  assignment_id BINARY(16) NOT NULL,
  escalated_from_user_id BINARY(16) NULL,
  escalated_to_user_id BINARY(16) NULL,
  escalated_to_role_id BINARY(16) NULL,
  reason TEXT NULL,
  escalated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conditional index creation helper
-- Example: create unique index if not present

-- Unique indexes
SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_user_email');
SET @sql := IF(@exists = 0, 'CREATE UNIQUE INDEX idx_user_email ON users(email)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'idx_user_username');
SET @sql := IF(@exists = 0, 'CREATE UNIQUE INDEX idx_user_username ON users(username)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'roles' AND index_name = 'idx_role_name');
SET @sql := IF(@exists = 0, 'CREATE UNIQUE INDEX idx_role_name ON roles(name)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Non-unique indexes (from @Index annotations)
SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'processes' AND index_name = 'idx_process_name');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_process_name ON processes(name)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'processes' AND index_name = 'idx_process_version');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_process_version ON processes(name, version)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'process_steps' AND index_name = 'idx_step_process');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_step_process ON process_steps(process_id)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'process_steps' AND index_name = 'idx_step_sequence');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_step_sequence ON process_steps(process_id, sequence_order)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'requests' AND index_name = 'idx_request_process');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_request_process ON requests(process_id)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'requests' AND index_name = 'idx_request_creator');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_request_creator ON requests(created_by_id)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'requests' AND index_name = 'idx_request_status');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_request_status ON requests(status)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'requests' AND index_name = 'idx_request_created');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_request_created ON requests(created_at)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assignments' AND index_name = 'idx_assignment_request');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_assignment_request ON assignments(request_id)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assignments' AND index_name = 'idx_assignment_user');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_assignment_user ON assignments(assigned_to_id)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assignments' AND index_name = 'idx_assignment_step');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_assignment_step ON assignments(process_step_id)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'assignments' AND index_name = 'idx_assignment_status');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_assignment_status ON assignments(status)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'delays' AND index_name = 'idx_delay_assignment');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_delay_assignment ON delays(assignment_id)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'delays' AND index_name = 'idx_delay_responsible');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_delay_responsible ON delays(responsible_user_id)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'delays' AND index_name = 'idx_delay_created');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_delay_created ON delays(created_at)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @exists := (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'escalation_history' AND index_name = 'idx_escalation_assignment');
SET @sql := IF(@exists = 0, 'CREATE INDEX idx_escalation_assignment ON escalation_history(assignment_id)', NULL); PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ==========================
-- Section 2: Master Data Seed (roles, permissions, admin, feature flags, default process)
-- ==========================

-- Roles
INSERT INTO roles (id, name, description, active, created_at, updated_at)
SELECT UUID_TO_BIN(UUID()), 'ADMIN', 'System Administrator - Full access', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');

INSERT INTO roles (id, name, description, active, created_at, updated_at)
SELECT UUID_TO_BIN(UUID()), 'AUDITOR', 'Compliance Officer - Audit & delay reports', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'AUDITOR');

INSERT INTO roles (id, name, description, active, created_at, updated_at)
SELECT UUID_TO_BIN(UUID()), 'HOD', 'Head of Department - Oversight & final approval', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'HOD');

INSERT INTO roles (id, name, description, active, created_at, updated_at)
SELECT UUID_TO_BIN(UUID()), 'SECTION_OFFICER', 'Section Officer - Review & approval', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'SECTION_OFFICER');

INSERT INTO roles (id, name, description, active, created_at, updated_at)
SELECT UUID_TO_BIN(UUID()), 'CLERK', 'Clerical Staff - Verification & forwarding', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'CLERK');

INSERT INTO roles (id, name, description, active, created_at, updated_at)
SELECT UUID_TO_BIN(UUID()), 'CITIZEN', 'Citizen - Request creation & tracking', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'CITIZEN');

-- Role Permissions
INSERT INTO role_permissions (role_id, permission)
SELECT r.id, 'MANAGE_FEATURE_FLAGS'
FROM roles r WHERE r.name = 'ADMIN'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission = 'MANAGE_FEATURE_FLAGS'
);

INSERT INTO role_permissions (role_id, permission)
SELECT r.id, 'VIEW_AUDIT_LOGS'
FROM roles r WHERE r.name IN ('ADMIN','AUDITOR')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission = 'VIEW_AUDIT_LOGS'
);

INSERT INTO role_permissions (role_id, permission)
SELECT r.id, 'VIEW_ASSIGNED_REQUESTS'
FROM roles r WHERE r.name IN ('CLERK','SECTION_OFFICER','HOD')
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission = 'VIEW_ASSIGNED_REQUESTS'
);

INSERT INTO role_permissions (role_id, permission)
SELECT r.id, 'CREATE_REQUEST'
FROM roles r WHERE r.name = 'CITIZEN'
AND NOT EXISTS (
  SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission = 'CREATE_REQUEST'
);

-- Admin User (admin/admin123)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, department, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), 'admin', 'admin@hdas.local', '$2b$10$rVJTUBaS9GDOO56q6zaPeO0/y/xH0mmeqox2BNh.WuWZK6HCvYpoi', 'Admin', 'User', 'Administration', TRUE, NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.username = 'admin'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Feature Flags (BIGINT id, no UUID)
INSERT INTO feature_flags (name, description, enabled, impact, category, created_at, updated_at)
SELECT 'ESCALATION', 'Enable escalation management', FALSE, 'MEDIUM', 'WORKFLOW', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE name = 'ESCALATION');

INSERT INTO feature_flags (name, description, enabled, impact, category, created_at, updated_at)
SELECT 'AUDIT_COMPLIANCE', 'Enable audit compliance features', FALSE, 'MEDIUM', 'COMPLIANCE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE name = 'AUDIT_COMPLIANCE');

INSERT INTO feature_flags (name, description, enabled, impact, category, created_at, updated_at)
SELECT 'ADVANCED_ACCOUNTABILITY', 'Enable advanced accountability tracking', FALSE, 'LOW', 'ANALYTICS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE name = 'ADVANCED_ACCOUNTABILITY');

INSERT INTO feature_flags (name, description, enabled, impact, category, created_at, updated_at)
SELECT 'GOVERNANCE_ANALYSIS', 'Enable governance analysis', FALSE, 'LOW', 'ANALYTICS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE name = 'GOVERNANCE_ANALYSIS');

INSERT INTO feature_flags (name, description, enabled, impact, category, created_at, updated_at)
SELECT 'TRANSPARENCY', 'Enable transparency features', FALSE, 'LOW', 'UI', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM feature_flags WHERE name = 'TRANSPARENCY');

-- Default Process + Steps
INSERT INTO processes (id, name, description, version, active, created_at, updated_at)
SELECT UUID_TO_BIN(UUID()), 'Birth Certificate Issuance', 'Process for issuing birth certificates', 'v1', TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM processes WHERE name = 'Birth Certificate Issuance');

INSERT INTO process_steps (id, process_id, name, description, sequence_order, responsible_role, default_sla_duration_seconds, active, created_at, updated_at)
SELECT UUID_TO_BIN(UUID()), p.id, 'Document Verification', 'Verify submitted documents', 1, 'CLERK', 28800, TRUE, NOW(), NOW()
FROM processes p
WHERE p.name = 'Birth Certificate Issuance'
AND NOT EXISTS (
  SELECT 1 FROM process_steps s WHERE s.process_id = p.id AND s.name = 'Document Verification'
);

INSERT INTO process_steps (id, process_id, name, description, sequence_order, responsible_role, default_sla_duration_seconds, active, created_at, updated_at)
SELECT UUID_TO_BIN(UUID()), p.id, 'Section Officer Review', 'Section Officer reviews request', 2, 'SECTION_OFFICER', 86400, TRUE, NOW(), NOW()
FROM processes p
WHERE p.name = 'Birth Certificate Issuance'
AND NOT EXISTS (
  SELECT 1 FROM process_steps s WHERE s.process_id = p.id AND s.name = 'Section Officer Review'
);

INSERT INTO process_steps (id, process_id, name, description, sequence_order, responsible_role, default_sla_duration_seconds, active, created_at, updated_at)
SELECT UUID_TO_BIN(UUID()), p.id, 'Final Approval', 'HOD final approval', 3, 'HOD', 43200, TRUE, NOW(), NOW()
FROM processes p
WHERE p.name = 'Birth Certificate Issuance'
AND NOT EXISTS (
  SELECT 1 FROM process_steps s WHERE s.process_id = p.id AND s.name = 'Final Approval'
);

-- ====================================================
-- Additional Feature Module Tables (to match backend schema)
-- ====================================================

-- Delay Reason Taxonomy
CREATE TABLE IF NOT EXISTS delay_reason_taxonomy (
  id BINARY(16) PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  subcategory VARCHAR(100),
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  INDEX idx_taxonomy_category (category),
  INDEX idx_taxonomy_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delegations
CREATE TABLE IF NOT EXISTS delegations (
  id BINARY(16) PRIMARY KEY,
  assignment_id BINARY(16) NOT NULL,
  original_user_id BINARY(16) NOT NULL,
  delegated_to_id BINARY(16) NOT NULL,
  delegated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason TEXT,
  retain_accountability BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE RESTRICT,
  FOREIGN KEY (original_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (delegated_to_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_delegation_assignment (assignment_id),
  INDEX idx_delegation_original (original_user_id),
  INDEX idx_delegation_delegated (delegated_to_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Delay Debt Scores
CREATE TABLE IF NOT EXISTS delay_debt_scores (
  id BINARY(16) PRIMARY KEY,
  user_id BINARY(16) NOT NULL,
  role_id BINARY(16),
  total_delay_seconds BIGINT NOT NULL DEFAULT 0,
  total_delays_count INT NOT NULL DEFAULT 0,
  average_delay_seconds BIGINT NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  UNIQUE KEY uk_delay_debt_user_role (user_id, role_id),
  INDEX idx_delay_debt_user (user_id),
  INDEX idx_delay_debt_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SLA Exclusion Rules
CREATE TABLE IF NOT EXISTS sla_exclusion_rules (
  id BINARY(16) PRIMARY KEY,
  process_step_id BINARY(16),
  rule_type VARCHAR(50) NOT NULL,
  exclusion_start TIMESTAMP NOT NULL,
  exclusion_end TIMESTAMP NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version_num BIGINT NOT NULL DEFAULT 0,
  FOREIGN KEY (process_step_id) REFERENCES process_steps(id) ON DELETE RESTRICT,
  INDEX idx_exclusion_step (process_step_id),
  INDEX idx_exclusion_type (rule_type),
  INDEX idx_exclusion_dates (exclusion_start, exclusion_end)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================
-- Analytics Views
-- ====================================================

-- Request Timeline View
CREATE OR REPLACE VIEW v_request_timeline AS
SELECT 
  r.id AS request_id,
  r.title,
  r.status AS request_status,
  r.started_at,
  r.completed_at,
  a.id AS assignment_id,
  a.status AS assignment_status,
  ps.name AS step_name,
  ps.sequence_order,
  u.username AS assigned_to,
  a.assigned_at,
  a.started_at AS assignment_started_at,
  a.completed_at AS assignment_completed_at,
  a.allowed_duration_seconds,
  a.actual_duration_seconds
FROM requests r
LEFT JOIN assignments a ON r.id = a.request_id
LEFT JOIN process_steps ps ON a.process_step_id = ps.id
LEFT JOIN users u ON a.assigned_to_id = u.id
ORDER BY r.created_at DESC, ps.sequence_order ASC;

-- Delay Summary View
CREATE OR REPLACE VIEW v_delay_summary AS
SELECT 
  d.id AS delay_id,
  d.assignment_id,
  d.responsible_user_id,
  u.username AS responsible_username,
  d.delay_seconds,
  d.reason,
  d.reason_category,
  d.detected_at,
  d.justified,
  a.request_id,
  ps.name AS step_name,
  r.title AS request_title
FROM delays d
JOIN assignments a ON d.assignment_id = a.id
JOIN users u ON d.responsible_user_id = u.id
JOIN process_steps ps ON a.process_step_id = ps.id
JOIN requests r ON a.request_id = r.id;

-- End of consolidated schema and seed
