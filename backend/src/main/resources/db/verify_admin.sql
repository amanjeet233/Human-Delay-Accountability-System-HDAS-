-- HDAS Admin Verification Script (MySQL)
-- Purpose: Validate users/roles/user_roles and confirm admin setup
-- Usage:
--   mysql -u <user> -p < backend/src/main/resources/db/verify_admin.sql

-- Ensure we run against the intended database
SELECT DATABASE() AS current_database;

-- 1) Tables existence
SELECT table_name
FROM information_schema.tables
WHERE table_schema = DATABASE()
  AND table_name IN ('users','roles','user_roles')
ORDER BY table_name;

-- 2) Row counts for sanity
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'roles' AS table_name, COUNT(*) AS row_count FROM roles
UNION ALL
SELECT 'user_roles' AS table_name, COUNT(*) AS row_count FROM user_roles;

-- 3) Admin existence
SELECT COUNT(*) AS admin_exists
FROM users
WHERE username = 'admin';

-- 4) Admin active flag
SELECT u.username, u.active AS is_active
FROM users u
WHERE u.username = 'admin';

-- 5) Admin has ADMIN role (boolean check)
SELECT COUNT(*) AS admin_has_admin_role
FROM user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
WHERE u.username = 'admin'
  AND r.name = 'ADMIN';

-- 6) Admin role details (list all roles for admin)
SELECT u.username, r.name AS role_name
FROM user_roles ur
JOIN users u ON u.id = ur.user_id
JOIN roles r ON r.id = ur.role_id
WHERE u.username = 'admin'
ORDER BY r.name;

-- 7) Confirm role names stored without ROLE_ prefix
SELECT name AS stored_role_name
FROM roles
WHERE name IN ('ADMIN','AUDITOR','HOD','SECTION_OFFICER','CLERK','CITIZEN')
ORDER BY name;
