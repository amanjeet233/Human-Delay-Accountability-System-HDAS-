# Permission-Based Security Design

## Schema

- **permissions**
  - `code` (PK, VARCHAR(100)): Stable permission identifier (e.g., `FORWARD_REQUEST`).
  - `name` (VARCHAR(200)): Human-readable label.
  - `description` (VARCHAR(500)): What this permission allows.
  - `category` (VARCHAR(100)): Logical grouping (citizen, clerk, hod, admin, auditor).
  - `active` (BOOLEAN): Whether the permission is enabled.

- **role_permissions** (existing)
  - `role_id` (FK → roles.id)
  - `permission` (VARCHAR(100))

Notes:
- The app retains the existing `role_permissions` element collection mapping to keep current data working.
- You can optionally normalize to `role_permission_map(role_id, permission_code)` referencing `permissions(code)` via a migration. Until then, `permissions` acts as a metadata catalog.

### SQL (Flyway-compatible snippet)

```sql
CREATE TABLE IF NOT EXISTS permissions (
  code VARCHAR(100) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description VARCHAR(500),
  category VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Seed common permissions
INSERT INTO permissions (code, name, description, category) VALUES
 ('CREATE_REQUEST','Create Request','Citizen can create a new request','CITIZEN'),
 ('UPLOAD_DOCUMENTS','Upload Documents','Citizen can upload documents','CITIZEN'),
 ('VIEW_OWN_REQUESTS','View Own Requests','Citizen can view own requests','CITIZEN'),
 ('VIEW_ASSIGNED_REQUESTS','View Assigned Requests','Staff can view their assignments','CLERK'),
 ('VERIFY_REQUEST','Verify Request','Clerk verifies request','CLERK'),
 ('FORWARD_REQUEST','Forward Request','Forward to next role','STAFF'),
 ('ADD_DELAY_REASON','Add Delay Reason','Record delay reason','CLERK'),
 ('APPROVE_REQUEST','Approve Request','SO approves','SECTION_OFFICER'),
 ('REJECT_REQUEST','Reject Request','SO rejects','SECTION_OFFICER'),
 ('FINAL_APPROVE','Final Approve','HOD approves','HOD'),
 ('FINAL_REJECT','Final Reject','HOD rejects','HOD'),
 ('HANDLE_ESCALATIONS','Handle Escalations','HOD handles escalations','HOD'),
 ('VIEW_DEPARTMENT_SUMMARY','View Department Summary','HOD reports','HOD'),
 ('CREATE_USERS','Create Users','Admin user management','ADMIN'),
 ('UPDATE_USERS','Update Users','Admin user management','ADMIN'),
 ('DELETE_USERS','Delete Users','Admin user management','ADMIN'),
 ('ASSIGN_ROLES','Assign Roles','Admin roles','ADMIN'),
 ('CONFIGURE_PROCESSES','Configure Processes','Admin process setup','ADMIN'),
 ('MANAGE_FEATURE_FLAGS','Manage Feature Flags','Admin features','ADMIN'),
 ('VIEW_ALL_DATA','View All Data','Admin read access','ADMIN'),
 ('VIEW_ANALYTICS','View Analytics','Admin dashboards','ADMIN'),
 ('VIEW_AUDIT_LOGS','View Audit Logs','Auditor visibility','AUDITOR'),
 ('VIEW_DELAY_REPORTS','View Delay Reports','Auditor reports','AUDITOR'),
 ('EXPORT_DATA','Export Data','Auditor export','AUDITOR')
ON CONFLICT (code) DO NOTHING;
```

## Backend Configuration

- **Role → Permission mapping**
  - `Role` entity maps `role_permissions` via `@ElementCollection` (already present).
  - `RoleBasedAccessControl.hasPermission()` now reads permissions from DB using `RoleRepository.findByName(..)`.

- **Method-level security**
  - Use `@RequirePermission` on controller methods, enforced by `RoleBasedSecurityInterceptor`.
  - Example replacements:
    - `@PreAuthorize("hasAnyRole('CLERK','SECTION_OFFICER','HOD')")` → `@RequirePermission(RoleBasedAccessControl.Permission.VIEW_ASSIGNED_REQUESTS)`
    - `@PreAuthorize("hasAnyRole('CLERK','SECTION_OFFICER','HOD','ADMIN')")` → `@RequirePermission(RoleBasedAccessControl.Permission.FORWARD_REQUEST)`

- **Interception**
  - `WebMvcConfig` registers `RoleBasedSecurityInterceptor` for `/api/**`.
  - Interceptor injects `RoleBasedAccessControl` and checks each required permission.

## Migration Guidance (optional)

- To fully normalize:
  1. Create `permissions` table (as above).
  2. Create `role_permission_map(role_id UUID, permission_code VARCHAR(100) FK)`.
  3. Backfill from `role_permissions.permission` into `role_permission_map.permission_code`.
  4. Update `Role` mapping to `@ManyToMany` with `@JoinTable` targeting `role_permission_map`.
  5. Deprecate `role_permissions` element collection.

## Usage Examples

- Staff assignments endpoint:
  - Annotation: `@RequirePermission(RoleBasedAccessControl.Permission.VIEW_ASSIGNED_REQUESTS)`
  - Ensures any role with that permission can access, independent of hardcoded role names.

- Forward options endpoint:
  - Annotation: `@RequirePermission(RoleBasedAccessControl.Permission.FORWARD_REQUEST)`
  - Enforces capability to forward rather than specific role membership.

This design removes hardcoded role checks, centralizes permission management in the database, and enforces method-level security through annotations.