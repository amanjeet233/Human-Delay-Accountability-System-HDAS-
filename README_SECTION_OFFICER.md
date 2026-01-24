# HDAS Role README — Section Officer (SO)

## 1. ROLE OVERVIEW
- **Role name**
  Section Officer (SO)
- **Real-world government equivalent**
  Section Officer / Case Supervising Officer (mid-level approving authority)
- **Purpose of this role in HDAS**
  Review requests verified by Clerks, approve or reject within delegated authority, and forward/escalate cases to the Department Head (HOD) when required.
- **Authority level**
  Medium

## 2. DASHBOARD OVERVIEW
- **Dashboard route**
  `/so/dashboard`
- **Main sections visible on dashboard**
  - Summary statistics (Assigned / Pending Review / Approved / Rejected)
  - Review queue table
  - Approve / Reject / Forward (Escalate) actions via modals
  - SLA status display and breach warnings
- **Widgets / cards / tables shown**
  - Review Queue table (requests with SLA, priority, verified-by)
  - Modal dialogs: Approve, Reject, Forward/Escalate

## 3. FEATURES STATUS TABLE (IMPORTANT)
| Feature | Description | Status | Notes |
|--------|-------------|--------|-------|
| SO Review Queue | List of requests assigned to SO | ✅ Working | Frontend calls `GET /api/so/requests` |
| SLA Warning Display | Highlight nearing/breached SLA | ✅ Working | Rendered from `slaWarning` + `slaWarningMessage` |
| Approve Request | Approve verified request | ✅ Working | API: `PUT /api/so/requests/{id}/approve` |
| Reject Request | Reject request at SO stage | ✅ Working | API: `PUT /api/so/requests/{id}/reject` |
| Forward / Escalate to HOD | Forward request with escalation reason | ✅ Working | API: `PUT /api/so/requests/{id}/forward` |
| SO Dashboard Summary (Backend) | KPI stats endpoint | ✅ Working | API exists: `GET /api/so/dashboard` (returns mock stats) |
| Escalation Alerts | View escalation alerts list | 🟡 UI Ready (Backend Pending) | Backend provides `GET /api/so/escalations` but UI page not confirmed |
| Process / SLA Configuration | Configure workflows/SLA | 🔒 Restricted (Not allowed for this role) | Admin-only |
| User / Role Management | Manage users/roles | 🔒 Restricted (Not allowed for this role) | Admin-only |

## 4. ALLOWED ACTIONS
- **View assigned requests**
  - API: `GET /api/so/requests`
  - UI: Review Queue table
- **Approve**
  - API: `PUT /api/so/requests/{id}/approve`
  - UI: Approve modal/button
- **Reject**
  - API: `PUT /api/so/requests/{id}/reject`
  - UI: Reject modal/button
- **Forward/Escalate**
  - API: `PUT /api/so/requests/{id}/forward`
  - UI: Forward/Escalate modal with escalation reason
- **View dashboard summary**
  - API: `GET /api/so/dashboard`

## 5. RESTRICTED ACTIONS
- Must never be allowed to:
  - Manage users, roles, passwords
  - Configure processes, SLA, feature flags
  - Access auditor-only evidence/export functions
  - Make final decision (final approve/final reject) meant for HOD

## 6. BACKEND DEPENDENCIES
- **APIs used by this role**
  - `GET /api/so/dashboard`
  - `GET /api/so/requests`
  - `PUT /api/so/requests/{id}/approve`
  - `PUT /api/so/requests/{id}/reject`
  - `PUT /api/so/requests/{id}/forward`
  - `GET /api/so/review-queue`
  - `GET /api/so/escalations`
- **Security requirements**
  - Must enforce `@RequireRole(SECTION_OFFICER)`
  - Must enforce permissions:
    - `APPROVE_REQUEST`, `REJECT_REQUEST`, `FORWARD_REQUEST`
- **Data visibility scope**
  - Assigned requests / section-level tasks only (not system-wide)

## 7. FRONTEND COMPONENTS
- **Pages**
  - `frontend/app/so/dashboard/page.tsx`
  - (Legacy/alternate path exists in repo: `frontend/app/section-officer/dashboard/`)
- **Major components**
  - `SectionOfficerLayout`
  - Review queue table
  - Approve/Reject/Forward modals
  - SLA indicator logic
- **Layout rules**
  - SO pages must not expose Admin configuration navigation
  - SO actions must not be available on non-assigned requests

## 8. FUTURE EXTENSIONS
- **Coming Soon (Future Features)**
  - Escalation alerts page (dedicated view) + notification badge.
  - Queue enhancements:
    - Sort/filter by SLA risk, priority, verified-at, escalation reason.
    - Bulk actions (only if policy allows; otherwise keep single-action).
  - Standardized rejection reasons (enum-driven) and mandatory notes policy.

- **Backend Wiring Gaps (Not linked / mocked / empty)**
  - `GET /api/so/requests`
    - Currently backed by mock list; must be DB-backed “assigned-to-SO” query.
  - `PUT /api/so/requests/{id}/approve`
    - Returns success map; must persist approval decision + transition workflow.
  - `PUT /api/so/requests/{id}/reject`
    - Returns success map; must persist rejection reason/notes + end/rollback workflow per rules.
  - `PUT /api/so/requests/{id}/forward`
    - Returns success map; must persist escalation reason/notes and reassign to HOD.
  - `GET /api/so/escalations`
    - Backend returns mock list; UI wiring for alerts page is pending.

- **Safe extension areas**
  - Improve SO filtering/search within assigned queue.
  - Add richer escalation taxonomy (backend enum + UI dropdown).

- **Warnings for developers (role boundary)**
  - Do not add user/role management to SO.
  - Do not allow SO to bypass final HOD decision stage.

## 9. CHANGE LOG (EMPTY INITIALLY)
| Date | Change description | Role impacted |
|------|--------------------|--------------|
| | | |
