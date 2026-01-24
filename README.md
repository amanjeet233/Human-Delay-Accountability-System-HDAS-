# Human Delay Accountability System (HDAS)

HDAS is a role-based accountability platform for tracking government service requests, enforcing SLA timelines, and maintaining an auditable lifecycle of decisions across departments. It addresses delay transparency by routing requests through defined roles with secure, traceable actions and controlled access.

## Tech Stack

Backend: Spring Boot 3.2, Java 21, Spring Security, JWT, Hibernate, MySQL
Frontend: Next.js (App Router), React, Axios
Auth: JWT-based role authentication

## Roles and Responsibilities

- Admin: system configuration, users, roles, feature flags
- Citizen: submit and track own requests
- Clerk: verify and forward assigned requests, add delay reasons
- Section Officer: review and approve/reject/forward requests
- HOD: final approve/reject, department-level decisions
- Auditor: audit logs and legal hold actions

## Features

- Role-based request lifecycle
- Escalation and delay tracking
- Audit logging
- Secure JWT authentication and RBAC
- PDF/report support
- Feature-flag-based future modules

## Folder Structure

- /backend
- /frontend
- README.md
- start-backend.ps1
- start-frontend.ps1

## How to Run (Local)

### Backend (Java 21, Port 8081)

1. Ensure Java 21 and MySQL are available.
2. Update database settings in backend/src/main/resources/application.yml.
3. Run PowerShell: start-backend.ps1

Backend runs at http://localhost:8081.

### Frontend (Next.js)

1. Install dependencies: frontend/npm install
2. Run PowerShell: start-frontend.ps1

Frontend runs at http://localhost:3001.

## Security Notes

- JWT is required for all protected APIs.
- Role-based API access is enforced.

## Status

- Core features implemented
- Future features are guarded by feature flags