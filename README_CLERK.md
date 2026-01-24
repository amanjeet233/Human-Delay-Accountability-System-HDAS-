# HDAS Role README — Clerk (Dealing Assistant)

## 1. ROLE OVERVIEW
- **Role name**
  Clerk (Dealing Assistant)
- **Real-world government equivalent**
  Dealing Assistant / Junior Clerk handling initial scrutiny & verification
- **Purpose of this role in HDAS**
  Perform initial verification of assigned requests, add delay reasons, and forward verified cases to the next authority (typically Section Officer).
- **Authority level**
  Medium

## 2. DASHBOARD OVERVIEW
- **Dashboard route**
  `/clerk/dashboard`
- **Main sections visible on dashboard**
  - KPI / summary cards (assigned, pending review, verified, in-progress)
  - Assigned requests table
  - Verify & Forward modals
- **Widgets / cards / tables shown**
  - Requests table (with SLA status and priority)
  - Modal dialogs: Verify, Forward

## 3. FEATURES STATUS TABLE (IMPORTANT)
| Feature | Description | Status | Notes |
|--------|-------------|--------|-------|
| Clerk Assigned Requests Queue | View assigned requests for verification | ✅ Working | Backend endpoint returns mock list; frontend calls `/api/clerk/requests` |
| Verify Request | Mark request verified | ✅ Working | API: `PUT /api/clerk/{id}/verify` |
| Forward Request | Forward verified request to next role | ✅ Working | API: `PUT /api/clerk/{id}/forward` (payload includes `forwardedTo`/`targetRole` depending on implementation) |
| Add Delay Reason | Record delay reason for request | ✅ Working | API: `POST /api/clerk/{id}/delay-reason` |
| Request Timeline (Clerk view) | View request timeline events | 🟡 UI Ready (Backend Pending) | Backend returns a mock timeline list; UI usage not confirmed |
| Reject Request | Reject at clerk stage | 🔒 Restricted (Not allowed for this role) | Clerk must not reject; only verify/forward |
| User / Role Management | Manage users/roles | 🔒 Restricted (Not allowed for this role) | Admin-only |
| Process / SLA Configuration | Configure workflows/SLA | 🔒 Restricted (Not allowed for this role) | Admin-only |

## 4. ALLOWED ACTIONS
- **View assigned requests**
  - API: `GET /api/clerk/requests`
  - UI: “My Assigned Requests” table
- **Verify request**
  - API: `PUT /api/clerk/{id}/verify`
  - UI: Verify button (only when request is in `PENDING_CLERK_REVIEW` / verification state)
- **Forward request**
  - API: `PUT /api/clerk/{id}/forward`
  - UI: Forward button (only after verification)
- **Add delay reason**
  - API: `POST /api/clerk/{id}/delay-reason`
  - UI: (action present in backend; UI wiring may be added later)

## 5. RESTRICTED ACTIONS
- Must never be allowed to:
  - Approve / reject final outcomes
  - Assign roles, create users, reset passwords
  - Configure processes, SLA, feature flags
  - Access `/admin/*`, `/auditor/*` dashboards

## 6. BACKEND DEPENDENCIES
- **APIs used by this role**
  - `GET /api/clerk/dashboard`
  - `GET /api/clerk/requests`
  - `PUT /api/clerk/{id}/verify`
  - `PUT /api/clerk/{id}/forward`
  - `POST /api/clerk/{id}/delay-reason`
  - `GET /api/clerk/{id}/timeline`
- **Security requirements**
  - Must enforce `@RequireRole(CLERK)`
  - Must enforce per-action permissions:
    - `VIEW_ASSIGNED_REQUESTS`, `VERIFY_REQUEST`, `FORWARD_REQUEST`, `ADD_DELAY_REASON`
- **Data visibility scope**
  - Assigned requests only (no department-wide visibility)

## 7. FRONTEND COMPONENTS
- **Pages**
  - `frontend/app/clerk/dashboard/page.tsx`
- **Major components**
  - `ClerkLayout`
  - Requests table with SLA status
  - Verify modal
  - Forward modal
- **Layout rules**
  - Clerk navigation must not expose Admin configuration links
  - All actions must be scoped to assigned requests

## 8. FUTURE EXTENSIONS
- **Coming Soon (Future Features)**
  - Delay reason UI on clerk dashboard (modal/form), including:
    - Standardized delay reason categories
    - Notes + attachments (optional)
  - Request verification checklist UI (document checklist + validation).
  - Queue enhancements (client-side first): sort/filter by priority/SLA/age.
  - Timeline view integration in UI (open timeline per request from queue).

- **Backend Wiring Gaps (Not linked / mocked / empty)**
  - `GET /api/clerk/requests`
    - Returns mock data; needs DB-backed “assigned-to-clerk” query.
  - `PUT /api/clerk/{id}/verify`
    - Currently responds with a success map; must update request/assignment state in DB and emit workflow event.
  - `PUT /api/clerk/{id}/forward`
    - Currently responds with a success map; must reassign to next role (SO) and persist forward notes.
  - `POST /api/clerk/{id}/delay-reason`
    - Backend exists; should persist delay reason + link to request + audit log entry.
  - `GET /api/clerk/{id}/timeline`
    - Returns mock events; should be generated from real workflow events.

- **Safe extension areas**
  - Clerk-only UI components and `/clerk/*` routes.
  - Adding server-side validations for verify/forward payloads.

- **Warnings for developers (role boundary)**
  - Do not add reject/approve powers to Clerk.
  - Do not allow Clerk to see non-assigned requests.

## 9. CHANGE LOG (EMPTY INITIALLY)
| Date | Change description | Role impacted |
|------|--------------------|--------------|
| | | |
