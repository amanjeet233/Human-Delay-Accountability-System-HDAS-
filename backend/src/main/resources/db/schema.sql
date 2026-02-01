-- ====================================================
-- HUMAN DELAY ACCOUNTABILITY SYSTEM (HDAS)
-- MySQL 8.x Complete Database Schema
-- Enterprise-Grade, Production-Ready
-- ====================================================
--
-- This is the SINGLE SOURCE OF TRUTH for HDAS database schema
-- Contains ALL tables, views, indexes, and initial data needed for:
--   - Backend (Spring Boot 3.x with JPA/Hibernate)
--   - Frontend (Next.js 14 with TypeScript)
--
-- USAGE:
--   mysql -u root -p < backend/src/main/resources/db/schema.sql
--
-- This file includes:
--   1. Core Domain Tables (User, Role, Process, Request, Assignment, Delay, AuditLog)
--   2. Feature Flag Tables (FeatureFlag management)
--   3. Feature Module Tables (Escalation, Compliance, Accountability, Governance, Transparency)
--   4. Analytics Views (Request Timeline, Delay Summary)
--   5. Initial Data (Default Roles, Permissions, Admin User, Feature Flags)
--
-- Database: hdas
-- Engine: InnoDB (enforced)
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- ====================================================

-- Set default storage engine
SET default_storage_engine = InnoDB;

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS hdas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hdas;

-- ====================================================
-- CORE DOMAIN TABLES
-- ====================================================

-- Users Table (Updated for JPA/Hibernate compatibility)
CREATE TABLE IF NOT EXISTS users (
    id BINARY(16) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    version_num BIGINT NOT NULL DEFAULT 0,
    INDEX idx_user_email (email),
    INDEX idx_user_username (username),
    INDEX idx_user_status (status),
    INDEX idx_user_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Ensure 'status' column exists on users table (for dev environments)
SET @user_status_exists := (
    SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'status'
);
SET @user_status_sql := IF(@user_status_exists = 0,
    'ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT ''ACTIVE'' AFTER active',
    'SELECT 1');
PREPARE user_status_stmt FROM @user_status_sql; EXECUTE user_status_stmt; DEALLOCATE PREPARE user_status_stmt;

-- Ensure index on users.status exists
SET @user_status_idx_exists := (
    SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_user_status'
);
SET @user_status_idx_sql := IF(@user_status_idx_exists = 0,
    'CREATE INDEX idx_user_status ON users(status)',
    'SELECT 1');
PREPARE user_status_idx_stmt FROM @user_status_idx_sql; EXECUTE user_status_idx_stmt; DEALLOCATE PREPARE user_status_idx_stmt;

-- Roles Table (Updated for JPA/Hibernate compatibility)
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

-- Role Permissions Table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BINARY(16) NOT NULL,
    permission VARCHAR(255) NOT NULL,
    PRIMARY KEY (role_id, permission),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_role_permission (permission)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Roles Junction Table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id BINARY(16) NOT NULL,
    role_id BINARY(16) NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_user_role_user (user_id),
    INDEX idx_user_role_role (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Processes Table (Updated for JPA/Hibernate compatibility)
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

-- Process Steps Table (Updated for JPA/Hibernate compatibility)
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

-- SLAs Table (Updated for JPA/Hibernate compatibility)
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

-- Requests Table (Updated for JPA/Hibernate compatibility)
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

-- File Attachments Table (Updated for JPA/Hibernate compatibility)
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

-- Assignments Table (Updated for JPA/Hibernate compatibility)
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

-- Request Status History Table (Tracks status transitions)
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

-- Delays Table (Updated for JPA/Hibernate compatibility)
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

-- ====================================================
-- FEATURE FLAG TABLES
-- ====================================================

-- Feature Flags Table (NEW)
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

-- ====================================================
-- ENHANCED AUDIT LOGS TABLE (UPDATED)
-- ====================================================

-- Audit Logs Table (Enhanced with legal hold and BIGINT ID)
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

-- ====================================================
-- FEATURE MODULE TABLES (Conditional)
-- ====================================================

-- Escalation Rules Table (Updated for JPA/Hibernate compatibility)
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

-- Escalation History Table (Updated for JPA/Hibernate compatibility)
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

-- Delay Justifications Table (Updated for JPA/Hibernate compatibility)
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

-- Delay Reason Taxonomy Table (Updated for JPA/Hibernate compatibility)
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

-- Delegations Table (Updated for JPA/Hibernate compatibility)
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

-- Delay Debt Scores Table (Updated for JPA/Hibernate compatibility)
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

-- SLA Exclusion Rules Table (Updated for JPA/Hibernate compatibility)
CREATE TABLE IF NOT EXISTS sla_exclusion_rules (
    id BINARY(16) PRIMARY KEY,
    process_step_id BINARY(16),
    rule_type VARCHAR(50) NOT NULL, -- HOLIDAY, WEEKEND, EMERGENCY
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
-- VIEWS FOR ANALYTICS
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

-- ====================================================
-- INITIAL DATA (Required for System Operation)
-- ====================================================

-- Insert default roles with proper hierarchy
INSERT INTO roles (id, name, description, active) 
VALUES (UNHEX(REPLACE('00000000-0000-0000-0000-000000000001', '-', '')), 'CITIZEN', 'Citizen - Can submit and track service requests', TRUE)
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO roles (id, name, description, active) 
VALUES (UNHEX(REPLACE('00000000-0000-0000-0000-000000000002', '-', '')), 'CLERK', 'Clerk - Can process assigned tasks and update request status', TRUE)
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO roles (id, name, description, active) 
VALUES (UNHEX(REPLACE('00000000-0000-0000-0000-000000000003', '-', '')), 'SECTION_OFFICER', 'Section Officer - Can manage team, handle escalations, and approve requests', TRUE)
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO roles (id, name, description, active) 
VALUES (UNHEX(REPLACE('00000000-0000-0000-0000-000000000004', '-', '')), 'HOD', 'Head of Department - Can manage department, review escalations, and configure processes', TRUE)
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO roles (id, name, description, active) 
VALUES (UNHEX(REPLACE('00000000-0000-0000-0000-000000000005', '-', '')), 'ADMIN', 'Administrator - Full system access and configuration', TRUE)
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO roles (id, name, description, active) 
VALUES (UNHEX(REPLACE('00000000-0000-0000-0000-000000000006', '-', '')), 'AUDITOR', 'Auditor - Can view audit logs, generate compliance reports, and manage legal holds', TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Insert role permissions
INSERT INTO role_permissions (role_id, permission)
SELECT id, 'READ_OWN_REQUESTS' FROM roles WHERE name = 'CITIZEN'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'CREATE_REQUESTS' FROM roles WHERE name = 'CITIZEN'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'READ_ASSIGNED_TASKS' FROM roles WHERE name = 'CLERK'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'UPDATE_TASKS' FROM roles WHERE name = 'CLERK'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'CREATE_COMMENTS' FROM roles WHERE name = 'CLERK'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'READ_TEAM_TASKS' FROM roles WHERE name = 'SECTION_OFFICER'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'MANAGE_TEAM' FROM roles WHERE name = 'SECTION_OFFICER'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'HANDLE_ESCALATIONS' FROM roles WHERE name = 'SECTION_OFFICER'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'APPROVE_REQUESTS' FROM roles WHERE name = 'SECTION_OFFICER'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'GENERATE_REPORTS' FROM roles WHERE name = 'SECTION_OFFICER'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'MANAGE_DEPARTMENT' FROM roles WHERE name = 'HOD'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'REVIEW_ESCALATIONS' FROM roles WHERE name = 'HOD'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'CONFIGURE_PROCESSES' FROM roles WHERE name = 'HOD'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'MANAGE_FEATURE_FLAGS' FROM roles WHERE name = 'HOD'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'ALL_PERMISSIONS' FROM roles WHERE name = 'ADMIN'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'READ_AUDIT_LOGS' FROM roles WHERE name = 'AUDITOR'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'GENERATE_COMPLIANCE_REPORTS' FROM roles WHERE name = 'AUDITOR'
ON DUPLICATE KEY UPDATE permission=permission;

INSERT INTO role_permissions (role_id, permission)
SELECT id, 'MANAGE_LEGAL_HOLDS' FROM roles WHERE name = 'AUDITOR'
ON DUPLICATE KEY UPDATE permission=permission;

-- ====================================================
-- DEFAULT ADMIN USER CREATION
-- ====================================================
-- Note: This creates the initial admin user for system setup
-- Username: admin
-- Password: admin123
-- Email: admin@hdas.local
-- Role: ADMIN

-- Create admin user with BCrypt hashed password (password: admin123)
INSERT INTO users (id, username, email, password_hash, first_name, last_name, department, active, created_at, updated_at)
VALUES (
  UNHEX(REPLACE(UUID(), '-', '')),
  'admin',
  'admin@hdas.local',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- password: admin123
  'System',
  'Administrator',
  'IT',
  TRUE,
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE username=username;

-- Assign ADMIN role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ADMIN'
ON DUPLICATE KEY UPDATE user_id=user_id;

-- ====================================================
-- FEATURE FLAGS INITIALIZATION
-- ====================================================
-- Initialize default feature flags with all advanced features disabled

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('escalation', 'Automatic SLA breach monitoring and escalation to higher authorities', FALSE, 
 JSON_ARRAY('ADMIN', 'HOD', 'SECTION_OFFICER'), JSON_ARRAY('auditCompliance'), 'HIGH', 'ESCALATION')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('auditCompliance', 'Immutable audit logging and compliance monitoring with legal hold support', FALSE, 
 JSON_ARRAY('ADMIN', 'AUDITOR', 'HOD'), JSON_ARRAY(), 'HIGH', 'CORE')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('advancedEscalationRules', 'Advanced escalation rule types, cooldown policies, and routing controls', FALSE, 
 JSON_ARRAY('ADMIN', 'HOD'), JSON_ARRAY('escalation', 'auditCompliance'), 'MEDIUM', 'ESCALATION')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('autoEscalationEngine', 'Automated engine that evaluates SLA breach risk and triggers escalation rules', FALSE, 
 JSON_ARRAY('ADMIN'), JSON_ARRAY('escalation', 'auditCompliance'), 'HIGH', 'ESCALATION')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('slaBreachAnalytics', 'SLA breach analytics and dashboards (rates, trends, root causes)', FALSE, 
 JSON_ARRAY('ADMIN', 'HOD', 'AUDITOR'), JSON_ARRAY('auditCompliance'), 'MEDIUM', 'GOVERNANCE')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('legalEvidenceExport', 'Legal evidence export packages (signed reports, chain-of-custody ready exports)', FALSE, 
 JSON_ARRAY('ADMIN', 'AUDITOR'), JSON_ARRAY('auditCompliance'), 'HIGH', 'COMPLIANCE')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('interDepartmentTransfer', 'Inter-department transfer workflow for requests (handoff with audit trail)', FALSE, 
 JSON_ARRAY('ADMIN', 'HOD'), JSON_ARRAY('auditCompliance'), 'HIGH', 'PROCESS')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('citizenNotificationSystem', 'Citizen notification system for request status/escalation events', FALSE, 
 JSON_ARRAY('ADMIN'), JSON_ARRAY('realTimeNotifications', 'auditCompliance'), 'MEDIUM', 'NOTIFICATIONS')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('advancedAccountability', 'Delay reason taxonomy, shadow delay tracking, and delay debt scoring', FALSE, 
 JSON_ARRAY('ADMIN', 'HOD', 'SECTION_OFFICER'), JSON_ARRAY('auditCompliance'), 'MEDIUM', 'ACCOUNTABILITY')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('governanceAnalysis', 'System performance analysis, bottleneck identification, and what-if simulations', FALSE, 
 JSON_ARRAY('ADMIN', 'HOD', 'AUDITOR'), JSON_ARRAY('auditCompliance', 'advancedAccountability'), 'MEDIUM', 'GOVERNANCE')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('transparency', 'Public access to anonymized government performance data', FALSE, 
 JSON_ARRAY('ADMIN'), JSON_ARRAY('governanceAnalysis'), 'LOW', 'TRANSPARENCY')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('realTimeNotifications', 'Instant email and push notifications for critical events', FALSE, 
 JSON_ARRAY('ADMIN'), JSON_ARRAY('escalation'), 'MEDIUM', 'ESCALATION')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('mobileApp', 'Native mobile app for field officers and remote access', FALSE, 
 JSON_ARRAY('ADMIN'), JSON_ARRAY(), 'LOW', 'TRANSPARENCY')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO feature_flags (name, description, enabled, required_roles, dependencies, impact, category)
VALUES 
('aiAssistance', 'AI-powered delay prediction and recommendation system', FALSE, 
 JSON_ARRAY('ADMIN'), JSON_ARRAY('governanceAnalysis'), 'HIGH', 'GOVERNANCE')
ON DUPLICATE KEY UPDATE name=name;

-- ====================================================
-- SYSTEM INITIALIZATION COMPLETE
-- ====================================================
-- 
-- The HDAS database is now ready for use with:
-- 1. Complete schema with all tables and indexes
-- 2. Default role hierarchy and permissions
-- 3. Admin user (admin/admin123) for initial setup
-- 4. Feature flags initialized with all advanced features disabled
-- 5. Enhanced audit logging with legal hold support
-- 6. JPA/Hibernate compatible table structures
--
-- Next Steps:
-- 1. Start the backend application
-- 2. Login as admin user
-- 3. Configure system settings and enable required features
-- 4. Create additional users and processes as needed
-- 5. Change default admin password for security
--