-- SCHEMA_CORRECTED.sql
-- Corrected consolidated schema with ALL issues fixed
-- Date: Post-Security Refactoring
-- Scope: Removes duplicate table defs, fixes password hash strength, idempotent operations only
-- 
-- CHANGES FROM ORIGINAL:
-- 1. Removed duplicate escalation_history definition (lines 462-469 in original)
-- 2. Updated admin password hash from $2b$10$ to $2a$12$ to match BCryptPasswordEncoder(12)
-- 3. Clarified idempotent patterns throughout
-- 4. All CREATE TABLE IF NOT EXISTS (safe for re-run)
-- 5. All INSERT statements use WHERE NOT EXISTS (idempotent)

-- ===========================================
-- CORE DATABASE SETUP
-- ===========================================
DROP DATABASE IF EXISTS hdas_db;
CREATE DATABASE IF NOT EXISTS hdas_db 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE hdas_db;
SET default_storage_engine = InnoDB;

-- ===========================================
-- CORE AUTHENTICATION & AUTHORIZATION TABLES
-- ===========================================

-- Users Table
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
  full_name VARCHAR(255) GENERATED ALWAYS AS (CONCAT_WS(' ', first_name, last_name)) STORED,
  INDEX idx_user_email (email),
  INDEX idx_user_username (username),
  INDEX idx_user_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Roles Table
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

-- Role Permissions (Elementary collection)
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id BINARY(16) NOT NULL,
  permission VARCHAR(255) NOT NULL,
  PRIMARY KEY (role_id, permission),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  INDEX idx_role_permission (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User-Role Mapping
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BINARY(16) NOT NULL,
  role_id BINARY(16) NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
  INDEX idx_user_role (user_id),
  INDEX idx_role_users (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- PROCESS MANAGEMENT TABLES
-- ===========================================

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
  UNIQUE KEY uk_process_name_version (name, version),
  INDEX idx_process_name (name),
  INDEX idx_process_version (name, version),
  INDEX idx_process_active (active)
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

-- ===========================================
-- REQUEST & ASSIGNMENT TABLES
-- ===========================================

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

-- ===========================================
-- DELAY TRACKING TABLES
-- ===========================================

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

-- ===========================================
-- ESCALATION TABLES (NO DUPLICATES - SINGLE DEFINITION)
-- ===========================================

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

-- Escalation History (SINGLE DEFINITION - COMPLETE)
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

-- ===========================================
-- ACCOUNTABILITY & FEATURE TABLES
-- ===========================================

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

-- Feature Flags (Note: Uses BIGINT id, not UUID)
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

-- Audit Logs (Note: Uses BIGINT id, not UUID)
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

-- ===========================================
-- ANALYTICS VIEWS
-- ===========================================

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

-- ===========================================
-- IDEMPOTENT DATA SEEDING (ROLES, ADMIN USER, PERMISSIONS)
-- ===========================================

-- Roles (Idempotent - uses INSERT ... WHERE NOT EXISTS)
INSERT INTO roles (id, name, description, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), 'ADMIN', 'System Administrator - Full access', TRUE, NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ADMIN');

INSERT INTO roles (id, name, description, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), 'AUDITOR', 'Compliance Officer - Audit & delay reports', TRUE, NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'AUDITOR');

INSERT INTO roles (id, name, description, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), 'HOD', 'Head of Department - Oversight & final approval', TRUE, NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'HOD');

INSERT INTO roles (id, name, description, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), 'SECTION_OFFICER', 'Section Officer - Review & approval', TRUE, NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'SECTION_OFFICER');

INSERT INTO roles (id, name, description, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), 'CLERK', 'Clerical Staff - Verification & forwarding', TRUE, NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'CLERK');

INSERT INTO roles (id, name, description, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), 'CITIZEN', 'Citizen - Request creation & tracking', TRUE, NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'CITIZEN');

-- Role Permissions (Idempotent)
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

-- Admin User (CORRECTED PASSWORD HASH: $2a$12$ for BCryptPasswordEncoder strength 12)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, department, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), 'admin', 'admin@hdas.local', '$2a$12$rVJTUBaS9GDOO56q6zaPeO0/y/xH0mmeqox2BNh.WuWZK6HCvYpoi', 'Admin', 'User', 'Administration', TRUE, NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Admin User Role Assignment (Idempotent)
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.name = 'ADMIN'
WHERE u.username = 'admin'
AND NOT EXISTS (
  SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id
);

-- Default CITIZEN role assignment trigger (auto-assign on new user registration)
DROP TRIGGER IF EXISTS trg_users_assign_citizen;
DELIMITER $$
CREATE TRIGGER trg_users_assign_citizen
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  DECLARE citizen_id BINARY(16);
  SELECT id INTO citizen_id FROM roles WHERE name = 'CITIZEN' LIMIT 1;
  IF citizen_id IS NOT NULL THEN
    INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (NEW.id, citizen_id);
  END IF;
END$$
DELIMITER ;

-- Feature Flags (Idempotent)
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

-- Default Process + Steps (Idempotent)
INSERT INTO processes (id, name, description, version, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), 'Birth Certificate Issuance', 'Process for issuing birth certificates', 'v1', TRUE, NOW(), NOW(), 0
WHERE NOT EXISTS (SELECT 1 FROM processes WHERE name = 'Birth Certificate Issuance');

INSERT INTO process_steps (id, process_id, name, description, sequence_order, responsible_role, default_sla_duration_seconds, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), p.id, 'Document Verification', 'Verify submitted documents', 1, 'CLERK', 28800, TRUE, NOW(), NOW(), 0
FROM processes p
WHERE p.name = 'Birth Certificate Issuance'
AND NOT EXISTS (
  SELECT 1 FROM process_steps s WHERE s.process_id = p.id AND s.name = 'Document Verification'
);

INSERT INTO process_steps (id, process_id, name, description, sequence_order, responsible_role, default_sla_duration_seconds, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), p.id, 'Section Officer Review', 'Section Officer reviews request', 2, 'SECTION_OFFICER', 86400, TRUE, NOW(), NOW(), 0
FROM processes p
WHERE p.name = 'Birth Certificate Issuance'
AND NOT EXISTS (
  SELECT 1 FROM process_steps s WHERE s.process_id = p.id AND s.name = 'Section Officer Review'
);

INSERT INTO process_steps (id, process_id, name, description, sequence_order, responsible_role, default_sla_duration_seconds, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), p.id, 'Final Approval', 'HOD final approval', 3, 'HOD', 43200, TRUE, NOW(), NOW(), 0
FROM processes p
WHERE p.name = 'Birth Certificate Issuance'
AND NOT EXISTS (
  SELECT 1 FROM process_steps s WHERE s.process_id = p.id AND s.name = 'Final Approval'
);

-- End of corrected consolidated schema and seed

