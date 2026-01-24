# 🚀 Human Delay Accountability System (HDAS)

## 📌 Overview
Transparent, role-based SLA enforcement for public service requests — auditable workflows, delay tracking, and governance insights.

## 🧱 Architecture
| Layer | Technology |
|-----|------------|
| Frontend | Next.js (App Router) |
| Backend | Spring Boot (Java 21) |
| Security | JWT + Spring Security (BCrypt) |
| Database | MySQL 8 (InnoDB, utf8mb4) |

## 👥 User Roles
| Role | Icon | Responsibility |
|----|----|----|
| Admin | 🛠️ | Users, roles, processes, SLA, feature flags |
| Citizen | 👤 | Submit requests, upload documents, track timeline |
| Clerk | 🧾 | Verify requests, add delay reasons, forward |
| Section Officer | 🗂️ | Approve/reject/forward verified requests |
| HOD | 🏛️ | Final decisions, department SLA oversight |
| Auditor | 🔍 | Read-only audits and transparency views |

## ⚙️ Core Features
- ⏱ SLA Tracking
- 📈 Escalation Engine
- 🔐 Role-based Access (RBAC)
- 🧾 Audit Logs
- 🚦 Feature Flags

## 🔐 Authentication & Security
- JWT-based authentication
- BCrypt password hashing
- Strict role-permission mapping on API endpoints and UI routes
- Profiles: `dev`/`prod` (secure), `simple` (permissive, dev-only)

## 🚩 Feature Flags
| Flag | Module | Status | Notes |
|---|---|---|---|
| escalation | Escalation flows | Enabled | SO → HOD escalation actions |
| audit | Audit logs | UI Ready | Backend export endpoints in progress |
| compliance | Compliance dashboard | UI Ready | Backend aggregates pending |
| transparency | Read-only datasets | UI Ready | Policy-based redaction pending |

## 🗄️ Database Overview
- UUID primary keys (`BINARY(16)`) with normalized relations and indexes
- Master schema + seeds in [SCHEMA_CONSOLIDATED.sql](SCHEMA_CONSOLIDATED.sql) (idempotent)
- Validation-friendly structure for Hibernate/JPA

## ▶️ Setup & Run
### Database (MySQL 8)
```powershell
# Interactive
mysql -u <user> -p < SCHEMA_CONSOLIDATED.sql

# Non-interactive
mysql -u <user> --password=<password> < SCHEMA_CONSOLIDATED.sql
```
Update DB settings in [backend/src/main/resources/application.yml](backend/src/main/resources/application.yml).

### Backend (Spring Boot)
```powershell
# Dev run (port 8080)
mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev

# Package + run
mvn -f backend/pom.xml clean package
java -jar backend/target/human-delay-accountability-system-1.0.0.jar --spring.profiles.active=dev
```
Health check: `http://localhost:8080/actuator/health`

### Frontend (Next.js)
```powershell
cd frontend
npm install
npm run dev
```
Dev server: `http://localhost:3001`

## 🔑 Admin Credentials (DEV ONLY ⚠️)
- Provisioned via seeds or environment config in development.
- Rotate credentials and configure secrets per environment; never reuse dev creds in production.

## 📂 Folder Structure
```text
.
├─ backend/
│  ├─ src/main/java/... (controllers, services, config)
│  ├─ src/main/resources/
│  │  └─ application.yml
│  └─ pom.xml
├─ frontend/
│  ├─ app/ (role dashboards, pages)
│  ├─ components/ (shared UI)
│  ├─ lib/ (api client, auth, feature flags)
│  └─ package.json
├─ docs/ (reports, migration runbooks, audits)
├─ SCHEMA_CONSOLIDATED.sql
├─ README.md
└─ scripts/
   └─ phase-validation/ (validation utilities)
```

## 📊 Project Status
- Stable and ready for demo/submission
- Backend/Frontend verified; analytics/export wiring under iteration

## 📜 License / Disclaimer
- See [LICENSE](LICENSE) for terms.
- Harden security and rotate credentials before production deployment.