# HDAS Role README — Department Head / HOD

## 1. ROLE OVERVIEW
- **Role name**
  Department Head / HOD
- **Real-world government equivalent**
  Head of Office / Head of Department (final departmental authority)
- **Purpose of this role in HDAS**
  Provide final departmental decision for escalated or high-impact requests, ensure SLA accountability at department level, and close the workflow with a final approve/final reject.
- **Authority level**
  High

## 2. DASHBOARD OVERVIEW
- **Dashboard route**
  `/hod/dashboard`
- **Main sections visible on dashboard**
  - Final approval queue
  - Department-level delay/SLA overview
  - Escalation overview
  - Critical delayed requests list
- **Widgets / cards / tables shown**
  - Final approval queue table (requests)
  - SLA breach summary widgets
  - Escalation overview widgets

## 3. FEATURES STATUS TABLE (IMPORTANT)
| Feature | Description | Status | Notes |
|--------|-------------|--------|-------|
| HOD Assigned Requests (API) | List requests assigned to HOD | ✅ Working | API: `GET /api/hod/requests` returns mock list |
| Final Approve (API) | Final approval action | 🔴 Not Started | Current `HODController` exposes `/requests/{id}/approve` (not final approve) |
| Final Reject (API) | Final rejection action | 🔴 Not Started | Current `HODController` exposes `/requests/{id}/reject` (not final reject) |
| HOD Dashboard Summary (API) | KPI stats | ✅ Working | API: `GET /api/hod/dashboard` returns mock stats |
| Approval Queue (API) | List pending approvals | ✅ Working | API: `GET /api/hod/approval-queue` returns mock queue |
| Escalations (API) | View escalated requests | ✅ Working | API: `GET /api/hod/escalations` returns mock list |
| Resolve Escalation (API) | Resolve escalation with resolution notes | ✅ Working | API: `PUT /api/hod/escalations/{id}/resolve` |
| Department Delay Overview (API) | Aggregate delay stats | ✅ Working | API: `GET /api/hod/delays` returns mock stats |
| HOD Dashboard UI | HOD dashboard layout & widgets | 🔴 Not Started | `frontend/app/hod/dashboard/page.tsx` currently has inconsistent/incomplete wiring (mixed components + undefined vars) |
| Configuration Access | Admin-like configuration ability | 🔒 Restricted (Not allowed for this role) | HOD must not manage users/roles/process config per role boundary |

## 4. ALLOWED ACTIONS
- **Review assigned/escalated requests**
  - API: `GET /api/hod/requests`
  - UI: HOD dashboard request list/queue
- **Approve requests within HOD authority**
  - API: `PUT /api/hod/requests/{id}/approve`
- **Reject requests within HOD authority**
  - API: `PUT /api/hod/requests/{id}/reject`
- **Resolve escalations**
  - API: `PUT /api/hod/escalations/{id}/resolve`
- **View department delay overview**
  - API: `GET /api/hod/delays`

## 5. RESTRICTED ACTIONS
- Must never be allowed to:
  - Manage users or roles (create/update/delete/assign)
  - Configure processes, SLA rules, or feature flags
  - Access Admin-only dashboards (`/admin/*`)
  - Access Auditor-only evidence/export features (`/auditor/*`)

## 6. BACKEND DEPENDENCIES
- **APIs used by this role**
  - `GET /api/hod/dashboard`
  - `GET /api/hod/requests`
  - `GET /api/hod/approval-queue`
  - `PUT /api/hod/requests/{id}/approve`
  - `PUT /api/hod/requests/{id}/reject`
  - `GET /api/hod/escalations`
  - `PUT /api/hod/escalations/{id}/resolve`
  - `GET /api/hod/delays`
- **Security requirements**
  - Must enforce `@RequireRole(HOD)`
  - Must enforce permissions:
    - `APPROVE_REQUEST`, `REJECT_REQUEST`, `HANDLE_ESCALATIONS`
- **Data visibility scope**
  - Department-wide scope (within the HOD’s department)

## 7. FRONTEND COMPONENTS
- **Pages**
  - `frontend/app/hod/dashboard/page.tsx`
- **Major components (present in repo)**
  - `HODLayout`
  - `FinalApprovalQueue`
  - `DepartmentDelayGraph`
  - `EscalationOverview`
  - `SLABreachSummary`
  - `CriticalDelayedRequests`
- **Layout rules**
  - Must use role guard for HOD-only pages
  - Must not expose Admin configuration navigation links

## 8. FUTURE EXTENSIONS
- **Coming Soon (Future Features)**
  - Final decision workflow completion:
    - “Final Approve” and “Final Reject” actions that close the request lifecycle.
    - Mandatory reason/notes policy for final rejection.
  - Department-level SLA dashboard:
    - SLA breach trendline
    - Top delayed processes/steps
    - Escalation reasons distribution
  - Critical queue enhancements:
    - Filter by SLA breach severity
    - Prioritization rules (policy-driven)

- **Backend Wiring Gaps (Not linked / mocked / empty)**
  - HOD dashboard UI file (`frontend/app/hod/dashboard/page.tsx`)
    - Currently inconsistent/incomplete (mix of components + undefined references). Needs cleanup + API wiring.
  - `GET /api/hod/requests`
    - Returns mock data; needs DB-backed “assigned-to-HOD” query.
  - Final decision endpoints
    - Current controller provides `PUT /api/hod/requests/{id}/approve` and `/reject`.
    - If the lifecycle requires distinct final actions, introduce `final-approve` / `final-reject` and persist final decision fields.
  - `GET /api/hod/delays` / `/dashboard` / `/approval-queue` / `/escalations`
    - All return mock aggregates/lists; must be backed by real request/assignment data.

- **Safe extension areas**
  - Add HOD-only analytics widgets based on department aggregates.
  - Add more escalation resolution categories.

- **Warnings for developers (role boundary)**
  - Do not allow HOD to manage process configuration (Admin-only).
  - Keep HOD as final decision maker only; do not mix with Auditor/Admin powers.

## 9. CHANGE LOG (EMPTY INITIALLY)
| Date | Change description | Role impacted |
|------|--------------------|--------------|
| | | |
