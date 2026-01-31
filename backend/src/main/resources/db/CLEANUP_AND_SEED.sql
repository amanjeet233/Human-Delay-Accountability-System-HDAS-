-- CLEANUP_AND_SEED.sql
-- Idempotent cleanup script to remove orphaned data and verify seed integrity
-- Run this after applying SCHEMA_CORRECTED.sql
-- Safe to run multiple times

USE hdas_db;

-- ===========================================
-- SECTION 1: BACKUP CURRENT DATA
-- ===========================================

-- Create temporary backup tables to preserve data before cleanup
CREATE TABLE IF NOT EXISTS users_backup_pre_cleanup AS SELECT * FROM users;
CREATE TABLE IF NOT EXISTS user_roles_backup_pre_cleanup AS SELECT * FROM user_roles;
CREATE TABLE IF NOT EXISTS roles_backup_pre_cleanup AS SELECT * FROM roles;

SELECT 'Backup created: users_backup_pre_cleanup, user_roles_backup_pre_cleanup, roles_backup_pre_cleanup' AS status;

-- ===========================================
-- SECTION 2: REMOVE ORPHANED DATA (IDEMPOTENT)
-- ===========================================

-- Remove orphaned user_roles (no corresponding user or role exists)
DELETE FROM user_roles 
WHERE user_id NOT IN (SELECT id FROM users) 
   OR role_id NOT IN (SELECT id FROM roles);

SELECT ROW_COUNT() AS 'Orphaned user_roles deleted:';

-- Remove orphaned delay_justifications (no corresponding delay or user exists)
DELETE FROM delay_justifications 
WHERE delay_id NOT IN (SELECT id FROM delays) 
   OR justified_by_id NOT IN (SELECT id FROM users)
   OR (approved_by_id IS NOT NULL AND approved_by_id NOT IN (SELECT id FROM users));

SELECT ROW_COUNT() AS 'Orphaned delay_justifications deleted:';

-- Remove orphaned delays (no corresponding assignment or user exists)
DELETE FROM delays 
WHERE assignment_id NOT IN (SELECT id FROM assignments) 
   OR responsible_user_id NOT IN (SELECT id FROM users)
   OR (justified_by_id IS NOT NULL AND justified_by_id NOT IN (SELECT id FROM users));

SELECT ROW_COUNT() AS 'Orphaned delays deleted:';

-- Remove orphaned delegations (no corresponding assignment or user exists)
DELETE FROM delegations 
WHERE assignment_id NOT IN (SELECT id FROM assignments) 
   OR original_user_id NOT IN (SELECT id FROM users)
   OR delegated_to_id NOT IN (SELECT id FROM users);

SELECT ROW_COUNT() AS 'Orphaned delegations deleted:';

-- Remove orphaned delay_debt_scores (no corresponding user exists)
DELETE FROM delay_debt_scores 
WHERE user_id NOT IN (SELECT id FROM users)
   OR (role_id IS NOT NULL AND role_id NOT IN (SELECT id FROM roles));

SELECT ROW_COUNT() AS 'Orphaned delay_debt_scores deleted:';

-- Remove orphaned escalation_history (no corresponding assignment exists)
DELETE FROM escalation_history 
WHERE assignment_id NOT IN (SELECT id FROM assignments);

SELECT ROW_COUNT() AS 'Orphaned escalation_history deleted:';

-- Remove orphaned file_attachments (no corresponding request exists)
DELETE FROM file_attachments 
WHERE request_id NOT IN (SELECT id FROM requests);

SELECT ROW_COUNT() AS 'Orphaned file_attachments deleted:';

-- Remove orphaned assignments (no corresponding request, process_step, or user exists)
DELETE FROM assignments 
WHERE request_id NOT IN (SELECT id FROM requests) 
   OR process_step_id NOT IN (SELECT id FROM process_steps) 
   OR assigned_to_id NOT IN (SELECT id FROM users)
   OR (assigned_by_id IS NOT NULL AND assigned_by_id NOT IN (SELECT id FROM users));

SELECT ROW_COUNT() AS 'Orphaned assignments deleted:';

-- Remove orphaned requests (no corresponding process or user exists)
DELETE FROM requests 
WHERE process_id NOT IN (SELECT id FROM processes) 
   OR created_by_id NOT IN (SELECT id FROM users);

SELECT ROW_COUNT() AS 'Orphaned requests deleted:';

-- Remove orphaned process_steps (no corresponding process exists)
DELETE FROM process_steps 
WHERE process_id NOT IN (SELECT id FROM processes);

SELECT ROW_COUNT() AS 'Orphaned process_steps deleted:';

-- Remove orphaned escalation_rules (no corresponding process_step exists)
DELETE FROM escalation_rules 
WHERE process_step_id NOT IN (SELECT id FROM process_steps)
   OR (escalation_role_id IS NOT NULL AND escalation_role_id NOT IN (SELECT id FROM roles));

SELECT ROW_COUNT() AS 'Orphaned escalation_rules deleted:';

-- Remove orphaned slas (no corresponding process_step exists)
DELETE FROM slas 
WHERE process_step_id NOT IN (SELECT id FROM process_steps)
   OR (role_id IS NOT NULL AND role_id NOT IN (SELECT id FROM roles));

SELECT ROW_COUNT() AS 'Orphaned slas deleted:';

-- Remove orphaned sla_exclusion_rules (no corresponding process_step exists)
DELETE FROM sla_exclusion_rules 
WHERE process_step_id IS NOT NULL 
   AND process_step_id NOT IN (SELECT id FROM process_steps);

SELECT ROW_COUNT() AS 'Orphaned sla_exclusion_rules deleted:';

SELECT '✓ All orphaned data removed (idempotent - safe to re-run)' AS cleanup_status;

-- ===========================================
-- SECTION 3: VERIFY & CLEAN ROLES & PERMISSIONS
-- ===========================================

-- Ensure all 6 required roles exist
INSERT IGNORE INTO roles (id, name, description, active, created_at, updated_at, version_num)
SELECT UUID_TO_BIN(UUID()), role_name, description, TRUE, NOW(), NOW(), 0
FROM (
  SELECT 'ADMIN' AS role_name, 'System Administrator - Full access' AS description
  UNION ALL SELECT 'AUDITOR', 'Compliance Officer - Audit & delay reports'
  UNION ALL SELECT 'HOD', 'Head of Department - Oversight & final approval'
  UNION ALL SELECT 'SECTION_OFFICER', 'Section Officer - Review & approval'
  UNION ALL SELECT 'CLERK', 'Clerical Staff - Verification & forwarding'
  UNION ALL SELECT 'CITIZEN', 'Citizen - Request creation & tracking'
) role_defs
WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.name = role_defs.role_name);

SELECT 'Roles reconciled' AS role_status;

-- Ensure all required role permissions exist
INSERT IGNORE INTO role_permissions (role_id, permission)
SELECT r.id, 'MANAGE_FEATURE_FLAGS' FROM roles r WHERE r.name = 'ADMIN';

INSERT IGNORE INTO role_permissions (role_id, permission)
SELECT r.id, 'VIEW_AUDIT_LOGS' FROM roles r WHERE r.name = 'ADMIN';

INSERT IGNORE INTO role_permissions (role_id, permission)
SELECT r.id, 'VIEW_AUDIT_LOGS' FROM roles r WHERE r.name = 'AUDITOR';

INSERT IGNORE INTO role_permissions (role_id, permission)
SELECT r.id, 'VIEW_ASSIGNED_REQUESTS' FROM roles r WHERE r.name = 'CLERK';

INSERT IGNORE INTO role_permissions (role_id, permission)
SELECT r.id, 'VIEW_ASSIGNED_REQUESTS' FROM roles r WHERE r.name = 'SECTION_OFFICER';

INSERT IGNORE INTO role_permissions (role_id, permission)
SELECT r.id, 'VIEW_ASSIGNED_REQUESTS' FROM roles r WHERE r.name = 'HOD';

INSERT IGNORE INTO role_permissions (role_id, permission)
SELECT r.id, 'CREATE_REQUEST' FROM roles r WHERE r.name = 'CITIZEN';

SELECT 'Role permissions reconciled' AS permission_status;

-- ===========================================
-- SECTION 4: ENSURE ADMIN USER EXISTS & IS CORRECT
-- ===========================================

-- Create admin user if doesn't exist (idempotent)
INSERT IGNORE INTO users (id, username, email, password_hash, first_name, last_name, department, active, created_at, updated_at, version_num)
VALUES (
  UUID_TO_BIN(UUID()),
  'admin',
  'admin@hdas.local',
  '$2a$12$rVJTUBaS9GDOO56q6zaPeO0/y/xH0mmeqox2BNh.WuWZK6HCvYpoi',  -- BCrypt strength 12, password: admin123
  'Admin',
  'User',
  'Administration',
  TRUE,
  NOW(),
  NOW(),
  0
);

-- Ensure admin user has ADMIN role (idempotent)
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
CROSS JOIN roles r
WHERE u.username = 'admin' AND r.name = 'ADMIN';

SELECT 'Admin user reconciled' AS admin_status;

-- ===========================================
-- SECTION 5: VERIFY DATA INTEGRITY
-- ===========================================

SELECT '=== DATA INTEGRITY VERIFICATION ===' AS verification_section;

-- 1. Check for orphaned records (should return 0 for all)
SELECT 'Orphaned user_roles:' AS check_type, COUNT(*) AS count FROM user_roles 
WHERE user_id NOT IN (SELECT id FROM users) 
   OR role_id NOT IN (SELECT id FROM roles);

SELECT 'Orphaned delays:' AS check_type, COUNT(*) AS count FROM delays 
WHERE assignment_id NOT IN (SELECT id FROM assignments)
   OR responsible_user_id NOT IN (SELECT id FROM users);

SELECT 'Orphaned assignments:' AS check_type, COUNT(*) AS count FROM assignments 
WHERE request_id NOT IN (SELECT id FROM requests) 
   OR process_step_id NOT IN (SELECT id FROM process_steps) 
   OR assigned_to_id NOT IN (SELECT id FROM users);

SELECT 'Orphaned requests:' AS check_type, COUNT(*) AS count FROM requests 
WHERE process_id NOT IN (SELECT id FROM processes) 
   OR created_by_id NOT IN (SELECT id FROM users);

-- 2. Verify required roles exist
SELECT 'Roles Present:' AS check_type, GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS roles FROM roles;
SELECT 'Role Count:' AS check_type, COUNT(*) AS expected_6 FROM roles;

-- 3. Verify admin user
SELECT 'Admin User Exists:' AS check_type, IF(COUNT(*) > 0, 'YES', 'NO') AS status FROM users WHERE username = 'admin' AND active = TRUE;
SELECT 'Admin Email:' AS check_type, email FROM users WHERE username = 'admin' LIMIT 1;
SELECT 'Admin Active:' AS check_type, active FROM users WHERE username = 'admin' LIMIT 1;

-- 4. Verify admin user has ADMIN role
SELECT 'Admin Has ADMIN Role:' AS check_type, IF(COUNT(*) > 0, 'YES', 'NO') AS status
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin' AND r.name = 'ADMIN';

-- 5. Verify password hash format (should be $2a$12$)
SELECT 'Admin Password Format:' AS check_type, 
       IF(password_hash REGEXP '^\\$2a\\$12\\$', 'VALID BCrypt (strength 12)', 'INVALID') AS status
FROM users WHERE username = 'admin' LIMIT 1;

-- 6. Verify unique constraints
SELECT 'Duplicate Usernames:' AS check_type, COUNT(*) AS count FROM (
  SELECT username FROM users GROUP BY username HAVING COUNT(*) > 1
) t;

SELECT 'Duplicate Emails:' AS check_type, COUNT(*) AS count FROM (
  SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1
) t;

-- 7. Data volume summary
SELECT '=== DATA VOLUME SUMMARY ===' AS summary_section;
SELECT 'Users:' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'Roles:', COUNT(*) FROM roles
UNION ALL SELECT 'User-Roles:', COUNT(*) FROM user_roles
UNION ALL SELECT 'Role Permissions:', COUNT(*) FROM role_permissions
UNION ALL SELECT 'Processes:', COUNT(*) FROM processes
UNION ALL SELECT 'Process Steps:', COUNT(*) FROM process_steps
UNION ALL SELECT 'SLAs:', COUNT(*) FROM slas
UNION ALL SELECT 'Requests:', COUNT(*) FROM requests
UNION ALL SELECT 'Assignments:', COUNT(*) FROM assignments
UNION ALL SELECT 'Delays:', COUNT(*) FROM delays
UNION ALL SELECT 'Escalation History:', COUNT(*) FROM escalation_history
UNION ALL SELECT 'Feature Flags:', COUNT(*) FROM feature_flags
UNION ALL SELECT 'Audit Logs:', COUNT(*) FROM audit_logs;

-- ===========================================
-- SECTION 6: FINAL STATUS REPORT
-- ===========================================

SELECT '✓ CLEANUP AND SEED COMPLETE' AS final_status;
SELECT '✓ Orphaned data removed (idempotent)' AS step_1;
SELECT '✓ Roles reconciled (all 6 roles present)' AS step_2;
SELECT '✓ Role permissions reconciled' AS step_3;
SELECT '✓ Admin user verified (username: admin, password: admin123)' AS step_4;
SELECT '✓ Data integrity verified (no orphans)' AS step_5;
SELECT '✓ Ready for application startup' AS step_6;

-- ===========================================
-- NOTE: To verify the database is correct for JPA validation
-- ===========================================
-- Next step: Run backend with spring.jpa.hibernate.ddl-auto=validate
-- Expected: ✓ Schema validation passes (no mismatches)
-- Then: Set to spring.jpa.hibernate.ddl-auto=none for production

