-- Create initial database schema for HDAS
 
 -- Users table
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

 -- Roles table
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

 -- User roles junction table
 CREATE TABLE IF NOT EXISTS user_roles (
     user_id BINARY(16) NOT NULL,
     role_id BINARY(16) NOT NULL,
     PRIMARY KEY (user_id, role_id),
     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
     FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
     INDEX idx_user_role_user (user_id),
     INDEX idx_user_role_role (role_id)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 -- Role permissions table
 CREATE TABLE IF NOT EXISTS role_permissions (
     role_id BINARY(16) NOT NULL,
     permission VARCHAR(255) NOT NULL,
     PRIMARY KEY (role_id, permission),
     FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
     INDEX idx_role_permission (permission)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 -- Audit logs table
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

 -- Escalation history table
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
     INDEX idx_escalation_history_assignment (assignment_id),
     INDEX idx_escalation_history_created (escalated_at)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 -- SLA exclusion rules table
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
     INDEX idx_exclusion_step (process_step_id),
     INDEX idx_exclusion_type (rule_type),
     INDEX idx_exclusion_dates (exclusion_start, exclusion_end)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

 -- Insert default admin user
 INSERT INTO users (id, username, email, password_hash, first_name, last_name, department, active, created_at, updated_at, version_num)
 VALUES (UNHEX(REPLACE(UUID(), '-', '')), 'admin', 'admin@hdas.local', '$2a$10$S3dnYfypZ/coG1WbPz77F.EJswZO1NvF33S.oIs6I48iRTj3rZ4se', 'System', 'Administrator', 'IT', TRUE, NOW(), NOW(), 0)
 ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

 -- Insert default admin role
 INSERT INTO roles (id, name, description, active, created_at, updated_at, version_num)
 VALUES (UNHEX(REPLACE(UUID(), '-', '')), 'ADMIN', 'System Administrator with full access', TRUE, NOW(), NOW(), 0)
 ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Assign admin role to admin user
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id 
FROM users u, roles r 
WHERE u.username = 'admin' AND r.name = 'ADMIN'
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);

 -- Insert admin permissions
 INSERT INTO role_permissions (role_id, permission)
 SELECT r.id, p.permission
 FROM roles r, 
      (SELECT 'ALL_PERMISSIONS' as permission UNION ALL
       SELECT 'USER_MANAGE' UNION ALL
       SELECT 'ROLE_MANAGE' UNION ALL
       SELECT 'SYSTEM_CONFIG' UNION ALL
       SELECT 'AUDIT_VIEW' UNION ALL
       SELECT 'ESCALATION_MANAGE' UNION ALL
       SELECT 'SLA_MANAGE') p
 WHERE r.name = 'ADMIN'
 ON DUPLICATE KEY UPDATE permission = VALUES(permission);
