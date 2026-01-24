## Security Profiles

- Default (secure): Role/JWT security is active in all profiles except `simple`. Leave `SPRING_PROFILES_ACTIVE` unset or use `dev`/`prod`.
- Simple (dev-only): Permissive chain for local UI/dev. Use `simple` profile.

### Run commands

- Secure default (dev):
  - PowerShell script: start the backend on port 8081
    - `./start-backend.ps1`
  - Maven run (port 8080):
    - `mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev`

- Simple dev mode:
  - Maven run (port 8080):
    - `mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=simple`
  - Jar run (after `mvn package`):
    - `java -jar backend/target/human-delay-accountability-system-1.0.0.jar --spring.profiles.active=simple`

### Health checks

- Check service status:
  - `http://localhost:8080/actuator/health` (Maven default)
  - `http://localhost:8081/actuator/health` (start-backend.ps1)

Notes
- Interceptor-based checks are disabled in `simple` profile to avoid overlap.
- JWT/role-based security remains the default in non-`simple` profiles.
# HDAS Role README — Admin (System & Process Owner)

## 1. ROLE OVERVIEW
- **Role name**
  Admin (System & Process Owner)
- **Real-world government equivalent**
  District/System Administrator (e-Governance system owner) / Process Owner
- **Purpose of this role in HDAS**
  Owns system configuration and governance controls. Admin manages users and roles, configures processes and SLA rules, manages feature flags, and has system-wide visibility.
- **Authority level**
  High

## 2. DASHBOARD OVERVIEW
- **Dashboard route**
  `/admin/dashboard`
- **Main sections visible on dashboard**
  - KPI cards (total/pending/in-progress/delayed/escalated/on-time %)
  - Charts (trend/analytics visualizations)
  - Request slider (high-level overview)
  - All tasks table (system-wide)
  - Quick actions (links to configuration modules)
- **Widgets / cards / tables shown**
  - `AdminKPICards`
  - `AdminCharts`
  - `RequestSlider`
  - `AllTasksTable`
  - `QuickActionCards`

## 3. FEATURES STATUS TABLE (IMPORTANT)
| Feature | Description | Status | Notes |
|--------|-------------|--------|-------|
| Admin Dashboard UI | Admin landing dashboard with KPI/charts | 🟡 UI Ready (Backend Pending) | Dashboard currently uses simulated values; not wired to backend dashboard API |
| User Management | Create/update/delete users; reset password; activate/deactivate | ✅ Working | Backend endpoints exist under `/api/admin/users*`; frontend page `/admin/users` fetches `/api/admin/users` |
| Role Assignment | Assign/update role for a user | ✅ Working | Backend endpoints exist (`PUT /api/admin/users/{id}/role`, `POST /api/admin/users/{id}/assign-role`); UI under `/admin/roles` may be partially wired |
| Role Configuration | Manage roles/permissions | 🟡 UI Ready (Backend Pending) | Some UI routes exist; backend role-management endpoints beyond user-role assignment are not confirmed in AdminController |
| Process Configuration | Create/update process definitions | 🟡 UI Ready (Backend Pending) | Backend has `GET/POST /api/admin/processes` with mocked data persistence; UI routes exist under `/admin/processes` |
| SLA Configuration | Define SLAs per step | 🟡 UI Ready (Backend Pending) | Backend has `POST /api/admin/sla` (mocked); UI route exists `/admin/sla` |
| Feature Flags | Enable/disable modules (escalation/audit/compliance/etc.) | 🟡 UI Ready (Backend Pending) | UI route exists `/admin/feature-flags`; backend integration status depends on FeatureFlagService endpoints |
| System-wide Data Visibility | View all requests/tasks across system | 🟡 UI Ready (Backend Pending) | Controller permissions indicate support; UI uses placeholders in multiple places |
| Governance Analytics | Advanced governance dashboards | 🔴 Not Started | Repo has analytics/governance routes, but admin integration status not confirmed |

## 4. ALLOWED ACTIONS
- **User lifecycle management**
  - API: `POST /api/admin/users`
  - API: `PUT /api/admin/users/{id}`
  - API: `DELETE /api/admin/users/{id}`
  - UI: `/admin/users`
- **Role assignment / updates**
  - API: `PUT /api/admin/users/{id}/role`
  - API: `POST /api/admin/users/{id}/assign-role`
  - UI: `/admin/roles` (and/or inline actions)
- **Password reset**
  - API: `PUT /api/admin/users/{id}/reset-password`
  - UI: `/admin/users`
- **User status (active/inactive)**
  - API: `PUT /api/admin/users/{id}/status`
  - UI: `/admin/users`
- **View all users**
  - API: `GET /api/admin/users`
- **Process configuration**
  - API: `GET /api/admin/processes`
  - API: `POST /api/admin/processes`
  - UI: `/admin/processes`
- **SLA configuration**
  - API: `POST /api/admin/sla`
  - UI: `/admin/sla`

## 5. RESTRICTED ACTIONS
- Must never be allowed to:
  - Perform operational approvals/rejections meant for workflow roles (Clerk/SO/HOD)
  - Act as Auditor (audit review should remain read-only and separated)
- Must keep hidden from other roles:
  - All admin routes under `/admin/*`
  - Any user/role management, process configuration, SLA, feature flag modules

## 6. BACKEND DEPENDENCIES
- **APIs used by this role**
  - `GET /api/admin/dashboard`
  - `GET /api/admin/users`
  - `POST /api/admin/users`
  - `PUT /api/admin/users/{id}`
  - `DELETE /api/admin/users/{id}`
  - `PUT /api/admin/users/{id}/role`
  - `POST /api/admin/users/{id}/assign-role`
  - `PUT /api/admin/users/{id}/reset-password`
  - `PUT /api/admin/users/{id}/status`
  - `GET /api/admin/processes`
  - `POST /api/admin/processes`
  - `POST /api/admin/sla`
- **Security requirements**
  - Must enforce `@RequireRole(ADMIN)`
  - Must enforce per-action permissions:
    - `CREATE_USERS`, `UPDATE_USERS`, `DELETE_USERS`, `ASSIGN_ROLES`, `CONFIGURE_PROCESSES`, `MANAGE_FEATURE_FLAGS`, `VIEW_ALL_DATA`, `VIEW_ANALYTICS`
- **Data visibility scope**
  - System-wide

## 7. FRONTEND COMPONENTS
- **Pages**
  - `frontend/app/admin/dashboard/page.tsx`
  - `frontend/app/admin/users/page.tsx`
  - `frontend/app/admin/processes/*`
  - `frontend/app/admin/sla/page.tsx`
  - `frontend/app/admin/feature-flags/page.tsx`
  - `frontend/app/admin/roles/*`
- **Major components**
  - `AdminLayout`
  - `AdminKPICards`, `AdminCharts`
  - `RequestSlider`, `AllTasksTable`, `QuickActionCards`
  - User table + modals on `/admin/users`
- **Layout rules**
  - Admin pages must remain isolated under `/admin/*`
  - Guard access by role (deny for non-admin)

## 8. FUTURE EXTENSIONS
- **Coming Soon (Future Features)**
  - Real admin dashboard metrics from backend:
    - Total/pending/in-progress/delayed/escalated counts
    - On-time SLA % computed from persisted assignment timing
  - Full role/permission editor (admin-only):
    - Create/update/delete roles
    - Assign permissions per role
    - Migration strategy for existing users
  - Process designer (admin-only):
    - Step sequencing
    - Role assignment per step
    - Versioned process definitions
  - Feature flags management:
    - Persist flags
    - Enforce flags across UI + API

- **Backend Wiring Gaps (Not linked / mocked / empty)**
  - `GET /api/admin/dashboard`
    - Endpoint exists but admin UI dashboard currently uses simulated values (no API call).
  - `GET /api/admin/processes` / `POST /api/admin/processes`
    - Returns mock process definitions; persistence is not implemented.
  - `POST /api/admin/sla`
    - Returns mock SLA creation response; persistence/rules enforcement not implemented.
  - Feature flags
    - UI route exists (`/admin/feature-flags`), but wiring depends on feature-flag endpoints/services not fully confirmed here.
  - Governance analytics pages
    - UI routes may exist under analytics/governance; backend analytics APIs are not confirmed.

- **Safe extension areas**
  - Add new admin-only modules under `/admin/*`.
  - Extend `AdminController` with new configuration APIs (keep them admin-only).

- **Warnings for developers (role boundary)**
  - **Never** allow other roles to call admin APIs.
  - Keep role boundaries strict: admin config ≠ operational workflow actions.

## 9. CHANGE LOG (EMPTY INITIALLY)
| Date | Change description | Role impacted |
|------|--------------------|--------------|
| | | |
