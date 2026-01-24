# HDAS Role README — Citizen / Applicant

## 1. ROLE OVERVIEW
- **Role name**
  Citizen / Applicant
- **Real-world government equivalent**
  Citizen / Service Applicant (public user)
- **Purpose of this role in HDAS**
  Submit service requests, upload supporting documents, and track request progress/timeline.
- **Authority level**
  Low

## 2. DASHBOARD OVERVIEW
- **Dashboard route**
  `/citizen/dashboard`
- **Main sections visible on dashboard**
  - New Request primary action
  - Status cards (Pending / Approved / Rejected)
  - Pending Requests slider
  - In-Progress Requests slider
  - Timeline view
- **Widgets / cards / tables shown**
  - `CitizenStatusCards`
  - `PendingRequestsSlider`, `InProgressRequestsSlider`
  - `CitizenTimeline`

## 3. FEATURES STATUS TABLE (IMPORTANT)
| Feature | Description | Status | Notes |
|--------|-------------|--------|-------|
| Citizen Dashboard UI | Citizen dashboard layout + widgets | 🟡 UI Ready (Backend Pending) | Current dashboard page uses simulated/mock values; not wired to backend APIs yet |
| Create Request | Submit a new request | 🟡 UI Ready (Backend Pending) | Backend endpoint exists but returns a basic mock response; persistence + workflow initiation not implemented |
| View Own Requests | List citizen’s own requests | 🔴 Not Started | Backend currently returns an empty list; frontend list page not confirmed |
| Request Timeline | Track progress timeline | 🟡 UI Ready (Backend Pending) | Backend returns empty timeline; frontend timeline uses mock events |
| Upload Documents | Upload supporting documents | 🟡 UI Ready (Backend Pending) | Backend accepts `file` as string param placeholder; real file upload/storage pending |
| User / Role Management | Manage users/roles | 🔒 Restricted (Not allowed for this role) | Admin-only |
| Process / SLA Configuration | Configure workflows/SLA | 🔒 Restricted (Not allowed for this role) | Admin-only |

## 4. ALLOWED ACTIONS
- **Submit new request**
  - API: `POST /api/citizen/requests`
  - UI entry: dashboard “New Request” action
- **View own requests**
  - API: `GET /api/citizen/requests`
- **View request timeline**
  - API: `GET /api/citizen/requests/{id}/timeline`
- **Upload documents**
  - API: `POST /api/citizen/requests/{id}/documents`

## 5. RESTRICTED ACTIONS
- Must never access or modify:
  - Admin dashboards/modules (`/admin/*`)
  - User creation/updates/role assignment
  - Process definitions / step routing
  - SLA configuration and feature flags
- Must never see:
  - Other citizens’ requests
  - Any system-wide analytics beyond public transparency pages (if enabled)

## 6. BACKEND DEPENDENCIES
- **APIs used by this role**
  - `GET /api/citizen/dashboard`
  - `POST /api/citizen/requests`
  - `GET /api/citizen/requests`
  - `GET /api/citizen/requests/{id}/timeline`
  - `POST /api/citizen/requests/{id}/documents`
- **Security requirements**
  - Must enforce `@RequireRole(CITIZEN)`
  - Must enforce per-action permissions (e.g., `CREATE_REQUEST`, `VIEW_OWN_REQUESTS`, `UPLOAD_DOCUMENTS`)
- **Data visibility scope**
  - Own data only (requests created by the logged-in citizen)

## 7. FRONTEND COMPONENTS
- **Pages**
  - `frontend/app/citizen/dashboard/page.tsx`
- **Major components**
  - `CitizenLayout`
  - `CitizenStatusCards`
  - `CitizenRequestSlider` components
  - `CitizenTimeline`
  - `NewRequestButton`
- **Layout rules**
  - Must use role guard for CITIZEN-only pages
  - Must not include admin/authority navigation items

## 8. FUTURE EXTENSIONS
- **Coming Soon (Future Features)**
  - Citizen “My Requests” list page with filters (status/date/process).
  - Request detail page (read-only view for citizen) including:
    - Current step/assignee (high-level)
    - SLA status (high-level)
    - Uploaded document list
  - Notifications (UI-only first): status change alerts and SLA risk alerts.
  - Document upload improvements:
    - Multi-file upload
    - File type/size validation
    - Download links for previously uploaded documents

- **Backend Wiring Gaps (Not linked / mocked / empty)**
  - `GET /api/citizen/dashboard`
    - Exists, but dashboard UI currently uses simulated values (not calling this endpoint).
  - `POST /api/citizen/requests`
    - Returns a basic mock response (`REQ-<timestamp>`); does not persist to DB or start the real workflow.
  - `GET /api/citizen/requests`
    - Currently returns an empty list; must be implemented to return only the authenticated citizen’s requests.
  - `GET /api/citizen/requests/{id}/timeline`
    - Returns an empty timeline; must be backed by real workflow/assignment/audit events.
  - `POST /api/citizen/requests/{id}/documents`
    - Placeholder signature uses `@RequestParam("file") String fileData`; real multipart upload + storage not implemented.

- **Safe extension areas**
  - Citizen-only UI components and `/citizen/*` routes.
  - Server-side validations for request creation fields (title/description/process selection).

- **Warnings for developers (role boundary)**
  - Do not expand citizen scope to view department/system-level data.
  - Do not allow role discovery or privilege escalation from frontend.

## 9. CHANGE LOG (EMPTY INITIALLY)
| Date | Change description | Role impacted |
|------|--------------------|--------------|
| | | |
