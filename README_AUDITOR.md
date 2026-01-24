# HDAS Role README — Auditor / Vigilance (Read-only)

## 1. ROLE OVERVIEW
- **Role name**
  Auditor / Vigilance (Read-only)
- **Real-world government equivalent**
  Vigilance Officer / Internal Auditor / Compliance Auditor
- **Purpose of this role in HDAS**
  Independently inspect system activity, delays, SLA breaches, and compliance posture using read-only access to logs and reports.
- **Authority level**
  Read-only

## 2. DASHBOARD OVERVIEW
- **Dashboard route**
  `/auditor/dashboard`
- **Main sections visible on dashboard**
  - Audit logs table (filters may be added later)
  - Basic stats derived from logs (user actions / request actions / SLA breaches)
  - Export tools (CSV/PDF)
- **Widgets / cards / tables shown**
  - Audit logs list/table
  - Summary counts computed client-side
  - Export button

## 3. FEATURES STATUS TABLE (IMPORTANT)
| Feature | Description | Status | Notes |
|--------|-------------|--------|-------|
| Auditor Dashboard UI | Dashboard layout + audit log list | ✅ Working | Frontend calls `GET /api/auditor/audit-logs` |
| View Audit Logs | View system audit log entries | ✅ Working | Backend returns mock list in `AuditorController` |
| Filter Audit Logs | Filter by date/user/action | 🟡 UI Ready (Backend Pending) | Backend supports query params; UI filters not confirmed |
| Export Audit Logs | Export logs to CSV/PDF | 🟡 UI Ready (Backend Pending) | Frontend exports CSV locally; backend export endpoints exist but are mocked |
| Delay Reports | View aggregated delay metrics | 🟡 UI Ready (Backend Pending) | Backend returns empty report object; UI route not confirmed |
| Transparency View | Read-only transparency datasets | 🟡 UI Ready (Backend Pending) | Backend returns empty dataset object |
| Compliance Summary | Compliance posture summary | 🟡 UI Ready (Backend Pending) | Backend returns empty summary object |
| Modify Users / Roles | Any write access | 🔒 Restricted (Not allowed for this role) | Must remain read-only |
| Configure Processes / SLA / Feature Flags | System configuration | 🔒 Restricted (Not allowed for this role) | Admin-only |

## 4. ALLOWED ACTIONS
- **View dashboard**
  - API: `GET /api/auditor/dashboard`
- **View audit logs**
  - API: `GET /api/auditor/audit-logs?from=&to=&user=&action=`
  - UI: audit logs table on `/auditor/dashboard`
- **View delay reports**
  - API: `GET /api/auditor/delay-reports`
- **View transparency view**
  - API: `GET /api/auditor/transparency-view`
- **Export** (read-only export actions)
  - API: `POST /api/auditor/export/audit-logs`
  - API: `POST /api/auditor/export/delay-reports`
  - UI: export controls

## 5. RESTRICTED ACTIONS
- Must never be allowed to:
  - Create/update/delete users
  - Assign roles or reset passwords
  - Approve/reject/forward requests in the workflow
  - Configure processes, SLA, or feature flags
- Must never receive:
  - Any write-capable token permissions
  - Any UI controls that mutate state

## 6. BACKEND DEPENDENCIES
- **APIs used by this role**
  - `GET /api/auditor/dashboard`
  - `GET /api/auditor/audit-logs`
  - `GET /api/auditor/delay-reports`
  - `GET /api/auditor/transparency-view`
  - `POST /api/auditor/export/audit-logs`
  - `POST /api/auditor/export/delay-reports`
  - `GET /api/auditor/compliance-summary`
- **Security requirements**
  - Must enforce `@RequireRole(AUDITOR)`
  - Must enforce read-only permissions:
    - `VIEW_AUDIT_LOGS`, `VIEW_DELAY_REPORTS`, `EXPORT_DATA`
  - Must ensure exports do not become write-capable or alter state
- **Data visibility scope**
  - System-wide read-only visibility

## 7. FRONTEND COMPONENTS
- **Pages**
  - `frontend/app/auditor/dashboard/page.tsx`
- **Major components**
  - `AuditorLayout`
  - Audit log list/table
  - Export controls
- **Layout rules**
  - Auditor navigation must not expose any write-capable modules
  - Auditor UI must avoid embedding admin forms or actions

## 8. FUTURE EXTENSIONS
- **Coming Soon (Future Features)**
  - Advanced audit log querying:
    - Pagination
    - Saved filters
    - Export scopes (time window, entity types)
  - Read-only compliance dashboard:
    - SLA breach trendlines
    - Department risk ranking
    - Repeated-offender patterns (users/steps)
  - Evidence bundles:
    - Signed exports
    - Immutable hash trail for exported datasets

- **Backend Wiring Gaps (Not linked / mocked / empty)**
  - `GET /api/auditor/audit-logs`
    - Returns mocked list in controller; needs DB-backed audit table + query filtering.
  - `GET /api/auditor/delay-reports`
    - Returns empty aggregate object; must be computed from persisted request/assignment timings.
  - `GET /api/auditor/transparency-view`
    - Returns empty object; needs real read-only datasets and policy-based redaction.
  - `GET /api/auditor/compliance-summary`
    - Returns empty object; needs compliance logic and real metrics.
  - Export endpoints
    - `POST /api/auditor/export/audit-logs` and `/export/delay-reports` return mocked confirmations; server-side export generation is pending.

- **Safe extension areas**
  - Add additional read-only analytics pages under `/auditor/*`.
  - Improve filtering, pagination, and export format support.

- **Warnings for developers (role boundary)**
  - Keep Auditor strictly read-only at both API and UI layers.
  - Never reuse admin controllers/services in auditor flows unless guaranteed read-only.

## 9. CHANGE LOG (EMPTY INITIALLY)
| Date | Change description | Role impacted |
|------|--------------------|--------------|
| | | |
