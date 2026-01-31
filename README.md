# Human Delay Accountability System (HDAS) 🏛️

A comprehensive, enterprise-grade accountability platform for transparent public service delivery. HDAS enables citizens to track service requests, empowers officials with workflow management, and ensures SLA compliance through automated escalations, real-time analytics, and immutable audit trails.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.35-black.svg)](https://nextjs.org/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://openjdk.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Tech Stack](#-tech-stack)
4. [Architecture](#-architecture)
5. [Role-Based Access Control](#-role-based-access-control)
6. [Getting Started](#-getting-started)
7. [API Documentation](#-api-documentation)
8. [Security](#-security)
9. [Database Schema](#-database-schema)
10. [Development](#-development)
11. [Deployment](#-deployment)
12. [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

### Purpose
HDAS (Human Delay Accountability System) is built to:
- **Eliminate service delivery delays** through automated SLA tracking
- **Ensure accountability** at every level of government hierarchy
- **Empower citizens** with transparent request tracking
- **Enable data-driven governance** through analytics dashboards
- **Maintain compliance** with immutable audit trails

### Problem Statement
Traditional government service delivery faces:
- ❌ Opaque request processing with no citizen visibility
- ❌ Delays due to lack of accountability
- ❌ Manual escalation workflows prone to human error
- ❌ No real-time analytics for decision making
- ❌ Difficulty in identifying bottlenecks

### HDAS Solution
- ✅ Real-time request tracking for citizens
- ✅ Automated SLA-based escalations
- ✅ Role-based dashboards with actionable insights
- ✅ Complete audit trail (who, what, when, why)
- ✅ Analytics-driven performance monitoring

---

## 🚀 Key Features

### For Citizens
- **Self-Registration**: Register and create account (pending admin approval)
- **Request Submission**: Submit service requests with document attachments
- **Real-Time Tracking**: Track request status, assigned officer, and delays
- **Transparency**: View delay justifications and escalation history
- **Notifications**: Email/SMS alerts on status changes

### For Officials
- **Unified Dashboard**: See all assigned tasks with SLA indicators
- **Workflow Management**: Approve/reject/forward requests with remarks
- **Delay Justification**: Record valid reasons for delays (recorded in audit)
- **Team Collaboration**: Assign tasks to subordinates
- **Performance Metrics**: View personal and team KPIs

### For Management (HOD)
- **Department Overview**: Monitor all requests in department
- **Resource Allocation**: Assign tasks to section officers
- **Bottleneck Detection**: Identify overdue tasks and delayed officers
- **Report Generation**: Export compliance and performance reports

### For Auditors
- **Read-Only Access**: View all system activities without edit permissions
- **Audit Trail Analysis**: Search logs by officer, date, request type
- **Compliance Reporting**: Generate audit reports for governance
- **Anomaly Detection**: Flag suspicious delay patterns

### For Administrators
- **User Management**: Create/deactivate users, assign roles
- **System Configuration**: Manage feature flags, SLA thresholds
- **Security Controls**: Monitor login attempts, reset passwords
- **Data Export**: Backup and export system data

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 14.2.35 | React framework with App Router |
| **React** | 18.2.0 | UI component library |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Tailwind CSS** | 3.4.0 | Utility-first CSS framework |
| **Recharts** | 2.12.0 | Data visualization (charts/graphs) |
| **Axios** | 1.6.5 | HTTP client with interceptors |
| **Lucide Icons** | Latest | Modern icon library |

**Design System:**
- **Theme**: Teal (#004D40 sidebar, #00897B primary, #80CBC4 accent)
- **Style**: Glassmorphism (backdrop-blur-[25px], transparent overlays)
- **Typography**: Inter font family
- **Responsive**: Mobile-first design with breakpoints

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Spring Boot** | 3.2.0 | Java application framework |
| **Java** | 21 (LTS) | Programming language |
| **Spring Security** | 6.x | Authentication & authorization |
| **Spring Data JPA** | 3.2.x | Database ORM |
| **MySQL Connector** | 8.x | Database driver |
| **BCrypt** | Built-in | Password hashing |
| **JWT** | jsonwebtoken | Token-based auth |
| **Lombok** | Latest | Boilerplate reduction |
| **Spring Actuator** | Built-in | Health checks & monitoring |

### Database
| Component | Technology | Notes |
|----------|------------|-------|
| **RDBMS** | MySQL 8.0 | InnoDB engine for ACID compliance |
| **Migrations** | Flyway | Version-controlled schema changes |
| **Pooling** | HikariCP | Connection pool (default in Spring Boot) |
| **Indexing** | B-Tree | On username, email, request_id |

---

## Architecture Diagram (ASCII)
```
+----------------------------+        +---------------------------+        +--------------------------+
|   Citizens & Officials     | <----> | Frontend (Next.js 14)    | <----> | Backend (Spring Boot 3.2)|
|   Browser (HTTPS)          |        | App Router, Tailwind CSS  |        | Security, Services, JPA  |
+----------------------------+        +---------------------------+        +--------------------------+
                                                     |                             |
                                                     v                             v
                                          Feature Flags (DB)                 MySQL 8 (InnoDB)

                                          Audit Logs & Governance Dashboards (role-based)
```

---

## Role Access Matrix
| Capability / Module | ADMIN | HOD | SECTION_OFFICER | CLERK | AUDITOR | CITIZEN |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Admin console (users, roles) | ✓ |  |  |  |  |  |
| Department management |  | ✓ |  |  |  |  |
| Team management & assignments |  |  | ✓ |  |  |  |
| Task execution (my tasks) |  |  |  | ✓ |  |  |
| Request submission & tracking |  |  |  |  |  | ✓ |
| Accountability dashboard | ✓ | ✓ | ✓ | ✓ | ✓ (read-only) | ✓ (own) |
| Audit logs & compliance | ✓ | ✓ |  |  | ✓ (read-only) |  |
| Feature flags management | ✓ |  |  |  |  |  |

Notes:
- Roles are stored without the `ROLE_` prefix (e.g., `ADMIN`). Authorities are applied as `ROLE_ADMIN` at runtime.
- API route protection aligns with role responsibilities (see `RoleBasedSecurityConfig`).

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Citizens   │  │  Officials   │  │   Admins     │             │
│  │   (Browser)  │  │  (Browser)   │  │  (Browser)   │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
└─────────┼──────────────────┼──────────────────┼───────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                             │
│                  ┌────────────────────────┐                         │
│                  │   Next.js 14 Frontend  │                         │
│                  │  - App Router          │                         │
│                  │  - JWT Auth            │                         │
│                  │  - Role Guards         │                         │
│                  │  - Axios Interceptors  │                         │
│                  └───────────┬────────────┘                         │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTP/HTTPS (REST API)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                              │
│                  ┌────────────────────────┐                         │
│                  │  Spring Boot Backend   │                         │
│                  │  ┌──────────────────┐  │                         │
│                  │  │  Controllers     │  │  - AuthController       │
│                  │  │  (REST API)      │  │  - UserController       │
│                  │  └────────┬─────────┘  │  - RequestController    │
│                  │           │            │  - DepartmentController │
│                  │  ┌────────▼─────────┐  │                         │
│                  │  │  Service Layer   │  │  - Business Logic       │
│                  │  │  (Transaction)   │  │  - SLA Calculations     │
│                  │  └────────┬─────────┘  │  - Workflow Rules       │
│                  │           │            │                         │
│                  │  ┌────────▼─────────┐  │                         │
│                  │  │  Security Layer  │  │  - JWT Validation       │
│                  │  │  (Spring Sec)    │  │  - Role Authorization   │
│                  │  └────────┬─────────┘  │  - BCrypt Password      │
│                  │           │            │                         │
│                  │  ┌────────▼─────────┐  │                         │
│                  │  │  Repository      │  │  - Spring Data JPA      │
│                  │  │  (Data Access)   │  │  - Entity Management    │
│                  │  └────────┬─────────┘  │                         │
│                  └───────────┼────────────┘                         │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ JDBC
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
│                  ┌────────────────────────┐                         │
│                  │   MySQL 8 Database     │                         │
│                  │  ┌──────────────────┐  │                         │
│                  │  │ Users & Roles    │  │                         │
│                  │  │ Requests         │  │                         │
│                  │  │ Departments      │  │                         │
│                  │  │ Audit Logs       │  │                         │
│                  │  │ Feature Flags    │  │                         │
│                  │  └──────────────────┘  │                         │
│                  └────────────────────────┘                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle Flow
```
1. Citizen Registration
   ├─ POST /api/auth/register
   ├─ User created with status=PENDING
   └─ Admin approval required (active=false)

2. Admin Activation
   ├─ Admin updates user: active=true, status=ACTIVE
   └─ Citizen can now login

3. Request Submission (Citizen)
   ├─ POST /api/requests
   ├─ Request status: SUBMITTED
   ├─ Auto-assigned to department
   └─ SLA timer starts

4. Request Assignment (HOD)
   ├─ HOD assigns to Section Officer
   ├─ Request status: ASSIGNED
   └─ Email notification sent

5. Task Processing (Clerk)
   ├─ Clerk processes task
   ├─ If delayed: Record justification
   ├─ Request status: IN_PROGRESS
   └─ Update SLA tracking

6. Approval/Rejection (Section Officer)
   ├─ Review clerk's work
   ├─ APPROVE: Move to HOD
   ├─ REJECT: Back to clerk with remarks
   └─ Audit log created

7. Final Approval (HOD)
   ├─ Review complete workflow
   ├─ Request status: APPROVED/REJECTED
   ├─ Citizen notification
   └─ Close request
```

---

## 🔐 Role-Based Access Control

### Role Hierarchy
```
ADMIN (Super User)
  │
  ├─── AUDITOR (Read-Only Observer)
  │
  ├─── HOD (Head of Department)
  │     │
  │     └─── SECTION_OFFICER (Team Lead)
  │           │
  │           └─── CLERK (Task Executor)
  │
  └─── CITIZEN (Service Requestor)
```

### Detailed Role Permissions

#### 👨‍💼 ADMIN
**Access Level**: Full System Control

**Capabilities:**
- ✅ User Management
  - Create/edit/delete user accounts
  - Assign/revoke roles
  - Activate/suspend accounts
  - Reset passwords
  - View all user activity logs

- ✅ System Configuration
  - Manage feature flags (enable/disable modules)
  - Configure SLA thresholds
  - Set up departments and hierarchies
  - Manage system-wide settings

- ✅ Data Management
  - Export all system data
  - Generate comprehensive reports
  - Database maintenance operations
  - Backup and restore

- ✅ Security & Compliance
  - View audit logs (all users)
  - Monitor login attempts
  - Configure security policies
  - Manage API access

**API Endpoints:**
```
GET    /api/admin/users                  # List all users
POST   /api/admin/users                  # Create user
PUT    /api/admin/users/{id}             # Update user
DELETE /api/admin/users/{id}             # Delete user
GET    /api/admin/audit-logs             # View audit logs
POST   /api/admin/feature-flags/{name}   # Toggle feature
GET    /api/admin/system/health          # System metrics
```

#### 🏛️ HOD (Head of Department)
**Access Level**: Department-Wide Management

**Capabilities:**
- ✅ Department Overview
  - View all requests in department
  - Monitor SLA compliance rates
  - Track officer performance
  - Generate department reports

- ✅ Resource Allocation
  - Assign requests to section officers
  - Redistribute workload
  - Prioritize urgent requests
  - Set team SLA targets

- ✅ Approval Authority
  - Final approve/reject requests
  - Escalate to higher authority
  - Override section officer decisions
  - Send back for revision

- ✅ Team Management
  - View section officer teams
  - Monitor individual performance
  - Access delay justifications
  - Review audit trails

**API Endpoints:**
```
GET    /api/hod/dashboard                # Department metrics
GET    /api/hod/requests                 # All dept requests
PUT    /api/hod/requests/{id}/assign     # Assign to SO
POST   /api/hod/requests/{id}/approve    # Final approval
GET    /api/hod/officers/performance     # Team KPIs
GET    /api/hod/reports/sla-compliance   # SLA report
```

#### 👨‍💼 SECTION_OFFICER
**Access Level**: Team Management

**Capabilities:**
- ✅ Team Task Management
  - Assign tasks to clerks
  - Monitor clerk performance
  - Review completed tasks
  - Redistribute pending work

- ✅ Quality Control
  - Approve clerk's work
  - Reject with feedback
  - Request additional information
  - Escalate complex cases

- ✅ Workflow Coordination
  - Forward requests to HOD
  - Coordinate with other sections
  - Manage task priorities
  - Track team SLA

- ✅ Reporting
  - Generate team reports
  - View delay justifications
  - Monitor workload distribution
  - Track resolution times

**API Endpoints:**
```
GET    /api/section-officer/tasks        # My team's tasks
PUT    /api/section-officer/tasks/{id}/assign  # Assign to clerk
POST   /api/section-officer/tasks/{id}/approve # Approve task
POST   /api/section-officer/tasks/{id}/reject  # Reject task
GET    /api/section-officer/team/performance   # Team metrics
```

#### 📝 CLERK
**Access Level**: Task Execution

**Capabilities:**
- ✅ Task Processing
  - View assigned tasks
  - Update task status
  - Upload supporting documents
  - Submit for approval

- ✅ Information Gathering
  - Request additional documents from citizens
  - Contact citizens for clarification
  - Verify submitted information
  - Complete forms/checklists

- ✅ Delay Management
  - Record delay justifications
  - Request deadline extensions
  - Update progress notes
  - Mark tasks as blocked

- ✅ Personal Workflow
  - View personal task queue
  - Track personal SLA compliance
  - View performance metrics
  - Access training materials

**API Endpoints:**
```
GET    /api/clerk/tasks                  # My assigned tasks
PUT    /api/clerk/tasks/{id}/start       # Start task
PUT    /api/clerk/tasks/{id}/complete    # Mark complete
POST   /api/clerk/tasks/{id}/delay       # Record delay reason
POST   /api/clerk/tasks/{id}/upload      # Upload document
GET    /api/clerk/performance            # My KPIs
```

#### 🔍 AUDITOR
**Access Level**: Read-Only System-Wide Access

**Capabilities:**
- ✅ Audit Trail Review
  - View all system activities
  - Search logs by multiple criteria
  - Export audit reports
  - Track user actions

- ✅ Compliance Monitoring
  - Generate compliance reports
  - Identify policy violations
  - Track SLA breaches
  - Monitor security events

- ✅ Analytics Access
  - View all dashboards (read-only)
  - Access performance metrics
  - Review delay patterns
  - Analyze trends

- ✅ Investigation Support
  - Deep-dive into specific requests
  - Track complete request history
  - View all justifications
  - Generate investigation reports

**API Endpoints:**
```
GET    /api/auditor/audit-logs           # All audit logs
GET    /api/auditor/requests             # All requests (read-only)
GET    /api/auditor/compliance-report    # Compliance metrics
GET    /api/auditor/users/{id}/activity  # User activity log
GET    /api/auditor/analytics            # System analytics
```

#### 👥 CITIZEN
**Access Level**: Personal Request Management

**Capabilities:**
- ✅ Request Management
  - Submit new service requests
  - Track request status
  - View assigned officer
  - Upload required documents

- ✅ Transparency & Tracking
  - View request timeline
  - See processing delays
  - Read delay justifications
  - Track escalations

- ✅ Communication
  - Reply to officer queries
  - Provide additional information
  - Receive status notifications
  - Rate service quality

- ✅ Personal Profile
  - Update contact information
  - View request history
  - Download completed documents
  - Manage notification preferences

**API Endpoints:**
```
POST   /api/requests                     # Submit new request
GET    /api/requests                     # My requests
GET    /api/requests/{id}                # Request details
PUT    /api/requests/{id}/documents      # Upload document
POST   /api/requests/{id}/message        # Send message
GET    /api/citizen/profile              # My profile
```

### Permission Matrix (Detailed)

| Module / Feature | ADMIN | HOD | SECTION_OFFICER | CLERK | AUDITOR | CITIZEN |
|-----------------|:-----:|:---:|:---------------:|:-----:|:-------:|:-------:|
| **Authentication** |
| Login | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Change Password | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reset Password | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **User Management** |
| Create Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View All Users | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Activate/Suspend | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Request Management** |
| Submit Request | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Own Requests | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| View Team Requests | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| View Dept Requests | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View All Requests | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Assign Requests | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Process Tasks | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve/Reject | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Delay Management** |
| Record Delay Reason | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| View Delay Reasons | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve Extension | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Analytics & Reports** |
| Personal Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Team Analytics | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Dept Analytics | ❌ | ✅ | ❌ | ❌ | ✅ | ❌ |
| System Analytics | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Export Reports | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| **Audit & Compliance** |
| View Own Activity | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Team Activity | ❌ | ✅ | ✅ | ❌ | ✅ | ❌ |
| View All Activity | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Generate Audit Report | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **System Config** |
| Feature Flags | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| SLA Thresholds | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Dept Management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Legend:**
- ✅ Full Access
- 📖 Read-Only
- ❌ No Access

---

## 🚀 Getting Started

### Prerequisites

#### Required Software
- **Java**: OpenJDK 21 (LTS)
  ```bash
  java -version  # Should show version 21.x
  ```

- **Maven**: 3.9+ for build management
  ```bash
  mvn -version  # Should show Maven 3.9+
  ```

- **Node.js**: 18.x or 20.x (LTS)
  ```bash
  node --version  # Should show v18.x or v20.x
  npm --version   # Should show 9.x or 10.x
  ```

- **MySQL**: 8.0 or higher
  ```bash
  mysql --version  # Should show 8.0.x
  ```

- **Git**: For version control
  ```bash
  git --version
  ```

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd "HUMAN DELAY ACCOUNTABILITY SYSTEM2"
```

#### 2. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE hdas_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user (optional, for production)
CREATE USER 'hdas_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON hdas_db.* TO 'hdas_user'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;

# Import consolidated schema
mysql -u root -p hdas_db < SCHEMA_CONSOLIDATED.sql
```

#### 3. Backend Configuration

**File**: `backend/application.env` (or `src/main/resources/application-dev.properties`)

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/hdas_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_mysql_password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Server Configuration
server.port=8080

# JWT Configuration (add to application.properties)
jwt.secret=your_256_bit_secret_key_here_change_in_production
jwt.expiration=86400000

# Seed Data (dev only)
hdas.seed.enabled=true
hdas.admin.password=admin123
```

#### 4. Start Backend
```bash
cd backend
mvn clean install  # First time build
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Health Check**: http://localhost:8080/actuator/health
```json
{
  "status": "UP"
}
```

#### 5. Frontend Configuration

**File**: `frontend/.env.local`
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

#### 6. Start Frontend
```bash
cd frontend
npm install          # First time only
npm run dev -- -p 3001
```

**Access**: http://localhost:3001

### Quick Start (Windows Users)

Use the automated batch file:
```bash
start.bat
```

This will:
1. ✅ Detect available ports
2. ✅ Start backend on 8080
3. ✅ Start frontend on 3001
4. ✅ Open browser automatically
5. ✅ Create `.env.local` automatically

---

## 📡 API Documentation

### Authentication Endpoints

#### Register New User (Citizen)
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (201 Created):
{
  "username": "johndoe",
  "email": "john@example.com",
  "role": "CITIZEN",
  "status": "PENDING"
}
```

**Note**: User created with `active=false`, requires admin activation.

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "username": "admin",
    "fullName": "System Administrator",
    "email": "admin@hdas.gov",
    "role": "ADMIN",
    "active": true
  }
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>

Response (200 OK):
{
  "message": "Logged out successfully"
}
```

### User Management (Admin Only)

#### List All Users
```http
GET /api/admin/users
Authorization: Bearer <admin-token>

Response (200 OK):
[
  {
    "id": "uuid",
    "username": "clerk1",
    "fullName": "Clerk One",
    "email": "clerk1@hdas.gov",
    "role": "CLERK",
    "active": true,
    "status": "ACTIVE",
    "createdAt": "2026-01-15T10:30:00Z"
  }
]
```

#### Activate Pending User
```http
PUT /api/admin/users/{userId}/activate
Authorization: Bearer <admin-token>

Response (200 OK):
{
  "message": "User activated successfully",
  "user": {
    "id": "uuid",
    "active": true,
    "status": "ACTIVE"
  }
}
```

### Request Management

#### Submit Request (Citizen)
```http
POST /api/requests
Authorization: Bearer <citizen-token>
Content-Type: application/json

{
  "requestType": "BIRTH_CERTIFICATE",
  "description": "Birth certificate for my daughter",
  "priority": "NORMAL",
  "documents": [
    {
      "name": "hospital_record.pdf",
      "url": "/uploads/abc123.pdf"
    }
  ]
}

Response (201 Created):
{
  "requestId": "REQ-2026-00001",
  "status": "SUBMITTED",
  "submittedAt": "2026-02-01T09:00:00Z",
  "slaDeadline": "2026-02-15T09:00:00Z"
}
```

#### Track Request (Citizen)
```http
GET /api/requests/REQ-2026-00001
Authorization: Bearer <citizen-token>

Response (200 OK):
{
  "requestId": "REQ-2026-00001",
  "status": "IN_PROGRESS",
  "currentOfficer": {
    "name": "Clerk One",
    "designation": "Clerk"
  },
  "timeline": [
    {
      "status": "SUBMITTED",
      "timestamp": "2026-02-01T09:00:00Z",
      "actor": "John Doe"
    },
    {
      "status": "ASSIGNED",
      "timestamp": "2026-02-01T10:30:00Z",
      "actor": "HOD Singh",
      "remarks": "Assigned to Section A"
    },
    {
      "status": "IN_PROGRESS",
      "timestamp": "2026-02-01T11:00:00Z",
      "actor": "Clerk One"
    }
  ],
  "delays": [],
  "slaStatus": "ON_TIME"
}
```

### For Complete API Documentation
See: [backend/API_CONTRACTS.md](backend/API_CONTRACTS.md)

---

## 🔒 Security

### Authentication Flow

1. **Registration**:
   - Citizen submits registration form
   - Password hashed with BCrypt (10 rounds)
   - User created with `status=PENDING`, `active=false`
   - Cannot login until admin activates

2. **Admin Activation**:
   - Admin reviews pending registrations
   - Sets `active=true`, `status=ACTIVE`
   - User can now login

3. **Login**:
   - User submits credentials
   - Backend validates username/password
   - Checks `active=true` (throws error if false)
   - Generates JWT token (24h expiry)
   - Returns token + user data

4. **Authenticated Requests**:
   - Frontend stores JWT in `localStorage`
   - Axios interceptor adds `Authorization: Bearer <token>`
   - Backend validates token on each request
   - Checks role permissions

5. **Logout**:
   - Frontend clears `localStorage`
   - Redirects to login page

### Password Security
- **Hashing**: BCrypt with salt rounds = 10
- **Storage**: Never stored in plaintext
- **Transmission**: HTTPS required in production
- **Validation**: Min 8 chars, must include uppercase, lowercase, number

### Token Management
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiry**: 24 hours (configurable)
- **Storage**: LocalStorage (client-side)
- **Refresh**: Not implemented (user must re-login after 24h)

### Authorization
- **Role-Based**: Each endpoint checks user role
- **Hierarchy-Aware**: HOD can access Section Officer data
- **Least Privilege**: Users only see their scope

### Security Best Practices
- ✅ SQL Injection prevention (JPA Parameterized Queries)
- ✅ XSS protection (React escapes by default)
- ✅ CSRF protection (disabled for stateless JWT)
- ✅ CORS configured for frontend origin only
- ✅ Audit logging on all state-changing operations

### Production Recommendations
- 🔐 Enable HTTPS (TLS 1.3)
- 🔐 Use environment variables for secrets
- 🔐 Rotate JWT secret regularly
- 🔐 Implement rate limiting on login endpoint
- 🔐 Add CAPTCHA on registration
- 🔐 Enable database encryption at rest
- 🔐 Use secure session cookies instead of localStorage

---

## 🗄️ Database Schema

### Core Tables

#### `users` Table
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, ACTIVE, SUSPENDED, DELETED
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_status (status)
);
```

#### `roles` Table
```sql
CREATE TABLE roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,  -- ADMIN, HOD, SECTION_OFFICER, CLERK, AUDITOR, CITIZEN
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `user_roles` Table (Join Table)
```sql
CREATE TABLE user_roles (
  user_id VARCHAR(36) NOT NULL,
  role_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);
```

#### `requests` Table
```sql
CREATE TABLE requests (
  id VARCHAR(36) PRIMARY KEY,
  request_id VARCHAR(50) UNIQUE NOT NULL,  -- REQ-2026-00001
  request_type VARCHAR(100) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'SUBMITTED',
  priority VARCHAR(20) DEFAULT 'NORMAL',
  citizen_id VARCHAR(36) NOT NULL,
  assigned_officer_id VARCHAR(36),
  department_id VARCHAR(36),
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sla_deadline TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES users(id),
  FOREIGN KEY (assigned_officer_id) REFERENCES users(id),
  INDEX idx_request_id (request_id),
  INDEX idx_status (status),
  INDEX idx_citizen (citizen_id)
);
```

#### `audit_logs` Table
```sql
CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(36),
  details TEXT,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_action (action)
);
```

### Entity Relationships
```
users (1) ─────────── (M) user_roles (M) ─────────── (1) roles
  │                                                         
  │ (1:M)                                                  
  ├─── requests (citizen_id)
  │
  │ (1:M)
  ├─── requests (assigned_officer_id)
  │
  │ (1:M)
  └─── audit_logs

departments (1) ─────────── (M) requests
```

---

## 👨‍💻 Development

### Project Structure

```
HUMAN DELAY ACCOUNTABILITY SYSTEM2/
├── backend/                          # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/hdas/
│   │   │   │   ├── controller/      # REST Controllers
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── UserController.java
│   │   │   │   │   └── RequestController.java
│   │   │   │   ├── service/         # Business Logic
│   │   │   │   │   ├── UserService.java
│   │   │   │   │   └── RequestService.java
│   │   │   │   ├── repository/      # Data Access Layer
│   │   │   │   │   ├── UserRepository.java
│   │   │   │   │   └── RequestRepository.java
│   │   │   │   ├── domain/          # JPA Entities
│   │   │   │   │   ├── user/
│   │   │   │   │   │   ├── User.java
│   │   │   │   │   │   ├── Role.java
│   │   │   │   │   │   └── UserStatus.java
│   │   │   │   │   └── request/
│   │   │   │   │       └── Request.java
│   │   │   │   ├── security/        # Auth & Authorization
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   │   └── UserDetailsServiceImpl.java
│   │   │   │   └── dto/             # Data Transfer Objects
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       ├── application-dev.properties
│   │   │       └── db/migration/    # Flyway Scripts
│   │   │           ├── V1__initial_schema.sql
│   │   │           └── V2__add_user_status.sql
│   │   └── test/                    # Unit & Integration Tests
│   ├── pom.xml                      # Maven Dependencies
│   └── REGISTRATION_IMPLEMENTATION.md
│
├── frontend/                         # Next.js Frontend
│   ├── app/                         # App Router Pages
│   │   ├── layout.tsx               # Root Layout
│   │   ├── page.tsx                 # Homepage
│   │   ├── login/page.tsx           # Login Page
│   │   ├── register/page.tsx        # Registration Page
│   │   ├── dashboard/page.tsx       # Main Dashboard
│   │   ├── admin/                   # Admin Module
│   │   │   ├── users/page.tsx
│   │   │   ├── roles/page.tsx
│   │   │   └── feature-flags/page.tsx
│   │   ├── citizen/                 # Citizen Module
│   │   │   ├── requests/page.tsx
│   │   │   └── track/page.tsx
│   │   ├── clerk/                   # Clerk Module
│   │   │   └── tasks/page.tsx
│   │   ├── section-officer/         # SO Module
│   │   │   └── team/page.tsx
│   │   └── hod/                     # HOD Module
│   │       └── department/page.tsx
│   ├── components/                  # Reusable Components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── Navigation.tsx
│   │   ├── RoleGuard.tsx           # Authorization Component
│   │   ├── FeatureGuard.tsx        # Feature Flag Component
│   │   └── Toast.tsx               # Notification Component
│   ├── lib/                        # Utilities
│   │   ├── api.ts                  # API Client (Axios)
│   │   ├── authContext.tsx         # Auth State Management
│   │   └── roleAccess.ts           # Permission Helpers
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── docs/                            # Documentation
│   ├── API_CONTRACTS.md
│   ├── FRONTEND_ARCHITECTURE_SUMMARY.md
│   ├── SECURITY_REFACTORING_SUMMARY.md
│   └── RELEASE_AUDIT_REPORT.md
│
├── scripts/                         # Automation Scripts
│   ├── reset-admin-password.bat
│   └── phase-validation/
│
├── logs/                            # Application Logs
├── SCHEMA_CONSOLIDATED.sql          # Database Schema
├── start.bat                        # Quick Start Script
├── start-all.bat
├── stop-frontend.bat
└── README.md                        # This File
```

### Development Workflow

#### Backend Development

1. **Create New Feature Branch**
```bash
git checkout -b feature/add-notification-service
```

2. **Add New Entity**
```java
@Entity
@Table(name = "notifications")
@Builder
@Data
public class Notification {
    @Id
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    private String message;
    private boolean read;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

3. **Create Repository**
```java
public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserIdAndReadFalse(String userId);
}
```

4. **Implement Service**
```java
@Service
public class NotificationService {
    @Autowired
    private NotificationRepository repository;
    
    public void sendNotification(String userId, String message) {
        Notification notification = Notification.builder()
            .id(UUID.randomUUID().toString())
            .user(userRepository.findById(userId).orElseThrow())
            .message(message)
            .read(false)
            .build();
        repository.save(notification);
    }
}
```

5. **Add Controller Endpoint**
```java
@GetMapping("/api/notifications")
public ResponseEntity<List<Notification>> getUnreadNotifications() {
    User user = getCurrentUser();
    return ResponseEntity.ok(notificationService.getUnread(user.getId()));
}
```

6. **Test**
```bash
mvn test
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Frontend Development

1. **Create New Component**
```tsx
// components/NotificationBell.tsx
'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { apiClient } from '@/lib/api';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    apiClient.get('/api/notifications/unread-count')
      .then(res => setUnreadCount(res.data.count));
  }, []);
  
  return (
    <button className="relative">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
```

2. **Add to Layout**
```tsx
// app/layout.tsx
import { NotificationBell } from '@/components/NotificationBell';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Topbar>
          <NotificationBell />
        </Topbar>
        {children}
      </body>
    </html>
  );
}
```

3. **Test**
```bash
npm run dev -- -p 3001
```

### Code Standards

#### Java (Backend)
- **Naming**: PascalCase for classes, camelCase for methods/variables
- **Annotations**: Use Lombok `@Data`, `@Builder` for DTOs
- **Validation**: Use `@Valid` and `@NotNull` annotations
- **Exception Handling**: Custom exceptions with `@ControllerAdvice`

#### TypeScript (Frontend)
- **Naming**: PascalCase for components, camelCase for functions
- **Type Safety**: Always define interfaces/types
- **Async**: Use `async/await` instead of `.then()`
- **Error Handling**: Use try-catch blocks

---

## 🚢 Deployment

### Production Checklist

#### Backend
- [ ] Change `spring.jpa.hibernate.ddl-auto=validate` (no auto-schema changes)
- [ ] Set strong `jwt.secret` (min 256 bits)
- [ ] Configure database connection pooling
- [ ] Enable HTTPS (TLS 1.3)
- [ ] Set up reverse proxy (Nginx/Apache)
- [ ] Configure CORS for production domain
- [ ] Enable Spring Security CSRF
- [ ] Set up centralized logging (ELK/Splunk)
- [ ] Configure database backups (daily)
- [ ] Set up monitoring (Prometheus/Grafana)

#### Frontend
- [ ] Set `NEXT_PUBLIC_API_URL` to production backend
- [ ] Build production bundle: `npm run build`
- [ ] Enable Next.js optimizations
- [ ] Configure CDN for static assets
- [ ] Set up SSL certificate
- [ ] Enable compression (Gzip/Brotli)
- [ ] Configure CSP headers
- [ ] Set up error tracking (Sentry)

#### Database
- [ ] Create dedicated database user (not root)
- [ ] Set restrictive permissions (`SELECT`, `INSERT`, `UPDATE`, `DELETE` only)
- [ ] Enable slow query log
- [ ] Set up replication (master-slave)
- [ ] Configure automated backups
- [ ] Enable audit logging
- [ ] Tune InnoDB buffer pool size
- [ ] Add indexes on frequently queried columns

### Docker Deployment (Recommended)

#### docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: hdas_db
    volumes:
      - mysql-data:/var/lib/mysql
      - ./SCHEMA_CONSOLIDATED.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"
    networks:
      - hdas-network

  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/hdas_db
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - hdas-network

  frontend:
    build: ./frontend
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8080
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - hdas-network

volumes:
  mysql-data:

networks:
  hdas-network:
    driver: bridge
```

#### Deploy
```bash
docker-compose up -d
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Error**: `Failed to configure a DataSource`

**Solution**:
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/hdas_db
spring.datasource.username=root
spring.datasource.password=your_password
```

#### 2. Frontend Network Error

**Error**: `Network Error` on login/registration

**Solution**:
```bash
# 1. Check backend is running
curl http://localhost:8080/actuator/health

# 2. Check CORS configuration in backend
@CrossOrigin(origins = "http://localhost:3001")

# 3. Verify .env.local
cat frontend/.env.local
# Should show: NEXT_PUBLIC_API_URL=http://localhost:8080
```

#### 3. JWT Token Invalid

**Error**: `401 Unauthorized` on authenticated requests

**Solution**:
```typescript
// Check token is being sent
// frontend/lib/api.ts
request.headers.Authorization = `Bearer ${token}`;

// Check token expiry (24h default)
// Backend logs will show: "JWT signature does not match"
```

#### 4. User Cannot Login After Registration

**Error**: `User account is disabled`

**Solution**:
```sql
-- User needs admin activation
UPDATE users 
SET active = TRUE, status = 'ACTIVE' 
WHERE username = 'citizen1';
```

#### 5. Database Migration Errors

**Error**: `Table 'hdas_db.users' doesn't exist`

**Solution**:
```bash
# Re-import schema
mysql -u root -p hdas_db < SCHEMA_CONSOLIDATED.sql

# Or run Flyway migration
mvn flyway:migrate
```

### Debug Mode

#### Backend Debug Logging
```properties
# application-dev.properties
logging.level.com.hdas=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.security=TRACE
```

#### Frontend Debug
```bash
# Enable verbose logging
npm run dev -- -p 3001 --turbo
```

### Performance Issues

#### Slow Database Queries
```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Check slow queries
SHOW VARIABLES LIKE 'slow_query_log_file';
```

#### High Memory Usage (Backend)
```bash
# Increase JVM heap
export JAVA_OPTS="-Xms512m -Xmx2048m"
mvn spring-boot:run
```

---

## 📞 Support & Contact

### Development Team
- **Project Lead**: [Your Name]
- **Backend Lead**: [Backend Developer]
- **Frontend Lead**: [Frontend Developer]
- **Database Admin**: [DBA Name]

### Documentation
- **API Docs**: [backend/API_CONTRACTS.md](backend/API_CONTRACTS.md)
- **Frontend Guide**: [docs/FRONTEND_ARCHITECTURE_SUMMARY.md](docs/FRONTEND_ARCHITECTURE_SUMMARY.md)
- **Security Audit**: [docs/SECURITY_REFACTORING_SUMMARY.md](docs/SECURITY_REFACTORING_SUMMARY.md)
- **Quick Start**: [START_HERE.md](START_HERE.md)

### Issue Reporting
1. Check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
2. Search existing issues
3. Create new issue with:
   - Environment (OS, Java version, Node version)
   - Steps to reproduce
   - Error logs
   - Screenshots

### Contributing
1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Spring Boot Team** - Excellent framework
- **Next.js Team** - Modern React framework
- **Tailwind CSS** - Utility-first CSS
- **Recharts** - Beautiful charts library
- **Lucide** - Icon library

---

## 📈 Project Status

**Current Version**: 2.0.0
**Status**: Active Development
**Last Updated**: February 1, 2026

### Recent Changes (v2.0.0)
- ✅ Complete frontend rebuild with Next.js 14
- ✅ Glassmorphism UI design system
- ✅ JWT-based authentication
- ✅ Citizen self-registration with admin approval
- ✅ User status workflow (PENDING → ACTIVE)
- ✅ Role-based access control (6 roles)
- ✅ Premium dashboard with analytics charts

### Upcoming Features (Roadmap)
- 🚧 Real-time notifications (WebSocket)
- 🚧 Email/SMS alerts
- 🚧 Document management system
- 🚧 Advanced analytics with ML predictions
- 🚧 Mobile app (React Native)
- 🚧 Multi-language support (i18n)
- 🚧 Dark mode theme

---

**Made with ❤️ for transparent governance and citizen empowerment**