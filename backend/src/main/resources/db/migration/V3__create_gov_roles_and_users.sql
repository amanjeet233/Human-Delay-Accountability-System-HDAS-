-- Create government-aligned roles and users for HDAS
-- Migration V3

-- Clear existing test data (optional - uncomment if you want to reset)
-- DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE username IN ('citizen', 'clerk', 'so', 'hod', 'auditor'));
-- DELETE FROM users WHERE username IN ('citizen', 'clerk', 'so', 'hod', 'auditor');

-- Insert Government-Aligned Roles
INSERT INTO roles (id, name, description, active, created_at, updated_at, version_num)
VALUES 
    (UNHEX('00000000000000000000000000000001'), 'CITIZEN', 'Citizen / Applicant - Can submit and track service requests', TRUE, NOW(), NOW(), 0),
    (UNHEX('00000000000000000000000000000002'), 'CLERK', 'Clerk (Dealing Assistant) - Can process assigned tasks and update request status', TRUE, NOW(), NOW(), 0),
    (UNHEX('00000000000000000000000000000003'), 'SECTION_OFFICER', 'Section Officer (SO) - Can manage team, handle escalations, and approve requests', TRUE, NOW(), NOW(), 0),
    (UNHEX('00000000000000000000000000000004'), 'HOD', 'Department Head / HOD - Can manage department, review escalations, and configure processes', TRUE, NOW(), NOW(), 0),
    (UNHEX('00000000000000000000000000000005'), 'ADMIN', 'Admin (System & Process Owner) - Full system access and configuration', TRUE, NOW(), NOW(), 0),
    (UNHEX('00000000000000000000000000000006'), 'AUDITOR', 'Auditor / Vigilance (Read-only) - Can view audit logs, generate compliance reports', TRUE, NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE 
    description = VALUES(description),
    active = VALUES(active),
    updated_at = NOW();

-- Insert Role Permissions
INSERT INTO role_permissions (role_id, permission)
VALUES 
    -- CITIZEN permissions
    ((SELECT id FROM roles WHERE name = 'CITIZEN'), 'READ_OWN_REQUESTS'),
    ((SELECT id FROM roles WHERE name = 'CITIZEN'), 'CREATE_REQUESTS'),
    ((SELECT id FROM roles WHERE name = 'CITIZEN'), 'UPDATE_OWN_REQUESTS'),
    ((SELECT id FROM roles WHERE name = 'CITIZEN'), 'VIEW_DASHBOARD'),
    
    -- CLERK permissions
    ((SELECT id FROM roles WHERE name = 'CLERK'), 'READ_ASSIGNED_TASKS'),
    ((SELECT id FROM roles WHERE name = 'CLERK'), 'UPDATE_TASKS'),
    ((SELECT id FROM roles WHERE name = 'CLERK'), 'CREATE_COMMENTS'),
    ((SELECT id FROM roles WHERE name = 'CLERK'), 'VIEW_DASHBOARD'),
    ((SELECT id FROM roles WHERE name = 'CLERK'), 'READ_REQUESTS'),
    
    -- SECTION_OFFICER permissions
    ((SELECT id FROM roles WHERE name = 'SECTION_OFFICER'), 'READ_TEAM_TASKS'),
    ((SELECT id FROM roles WHERE name = 'SECTION_OFFICER'), 'MANAGE_TEAM'),
    ((SELECT id FROM roles WHERE name = 'SECTION_OFFICER'), 'HANDLE_ESCALATIONS'),
    ((SELECT id FROM roles WHERE name = 'SECTION_OFFICER'), 'APPROVE_REQUESTS'),
    ((SELECT id FROM roles WHERE name = 'SECTION_OFFICER'), 'GENERATE_REPORTS'),
    ((SELECT id FROM roles WHERE name = 'SECTION_OFFICER'), 'VIEW_DASHBOARD'),
    ((SELECT id FROM roles WHERE name = 'SECTION_OFFICER'), 'READ_REQUESTS'),
    
    -- HOD permissions
    ((SELECT id FROM roles WHERE name = 'HOD'), 'MANAGE_DEPARTMENT'),
    ((SELECT id FROM roles WHERE name = 'HOD'), 'REVIEW_ESCALATIONS'),
    ((SELECT id FROM roles WHERE name = 'HOD'), 'CONFIGURE_PROCESSES'),
    ((SELECT id FROM roles WHERE name = 'HOD'), 'MANAGE_FEATURE_FLAGS'),
    ((SELECT id FROM roles WHERE name = 'HOD'), 'GENERATE_REPORTS'),
    ((SELECT id FROM roles WHERE name = 'HOD'), 'VIEW_DASHBOARD'),
    ((SELECT id FROM roles WHERE name = 'HOD'), 'READ_ALL_REQUESTS'),
    ((SELECT id FROM roles WHERE name = 'HOD'), 'MANAGE_SLA'),
    
    -- ADMIN permissions
    ((SELECT id FROM roles WHERE name = 'ADMIN'), 'ALL_PERMISSIONS'),
    
    -- AUDITOR permissions
    ((SELECT id FROM roles WHERE name = 'AUDITOR'), 'READ_AUDIT_LOGS'),
    ((SELECT id FROM roles WHERE name = 'AUDITOR'), 'GENERATE_COMPLIANCE_REPORTS'),
    ((SELECT id FROM roles WHERE name = 'AUDITOR'), 'MANAGE_LEGAL_HOLDS'),
    ((SELECT id FROM roles WHERE name = 'AUDITOR'), 'VIEW_DASHBOARD'),
    ((SELECT id FROM roles WHERE name = 'AUDITOR'), 'READ_ALL_REQUESTS')
ON DUPLICATE KEY UPDATE permission = VALUES(permission);

-- Create Sample Users for Each Role
INSERT INTO users (id, username, email, password_hash, first_name, last_name, department, active, created_at, updated_at, version_num)
VALUES 
    -- Citizen User
    (UNHEX('00000000000000000000000000000011'), 'citizen', 'citizen@hdas.local', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ramesh', 'Kumar', 'Public', TRUE, NOW(), NOW(), 0),
    
    -- Clerk User
    (UNHEX('00000000000000000000000000000012'), 'clerk', 'clerk@hdas.local', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Amit', 'Sharma', 'Revenue Department', TRUE, NOW(), NOW(), 0),
    
    -- Section Officer User
    (UNHEX('00000000000000000000000000000013'), 'so', 'so@hdas.local', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Priya', 'Singh', 'Revenue Department', TRUE, NOW(), NOW(), 0),
    
    -- HOD User
    (UNHEX('00000000000000000000000000000014'), 'hod', 'hod@hdas.local', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rajesh', 'Verma', 'Revenue Department', TRUE, NOW(), NOW(), 0),
    
    -- Admin User (update existing)
    (UNHEX('00000000000000000000000000000015'), 'admin', 'admin@hdas.local', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'System', 'Administrator', 'IT Governance', TRUE, NOW(), NOW(), 0),
    
    -- Auditor User
    (UNHEX('00000000000000000000000000000016'), 'auditor', 'auditor@hdas.local', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Suresh', 'Menon', 'Vigilance Department', TRUE, NOW(), NOW(), 0)
ON DUPLICATE KEY UPDATE 
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    department = VALUES(department),
    updated_at = NOW();

-- Assign Roles to Users
INSERT INTO user_roles (user_id, role_id)
VALUES 
    -- Citizen gets CITIZEN role
    ((SELECT id FROM users WHERE username = 'citizen'), (SELECT id FROM roles WHERE name = 'CITIZEN')),
    
    -- Clerk gets CLERK role
    ((SELECT id FROM users WHERE username = 'clerk'), (SELECT id FROM roles WHERE name = 'CLERK')),
    
    -- Section Officer gets SECTION_OFFICER role
    ((SELECT id FROM users WHERE username = 'so'), (SELECT id FROM roles WHERE name = 'SECTION_OFFICER')),
    
    -- HOD gets HOD role
    ((SELECT id FROM users WHERE username = 'hod'), (SELECT id FROM roles WHERE name = 'HOD')),
    
    -- Admin gets ADMIN role
    ((SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM roles WHERE name = 'ADMIN')),
    
    -- Auditor gets AUDITOR role
    ((SELECT id FROM users WHERE username = 'auditor'), (SELECT id FROM roles WHERE name = 'AUDITOR'))
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id);
