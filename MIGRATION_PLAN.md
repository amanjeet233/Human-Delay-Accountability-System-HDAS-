# HDAS MySQL Schema Alignment Plan (Non-Destructive)

Date: 2026-01-24

Goals:
- Align production MySQL schema to JPA entity expectations non-destructively
- No DROP statements and no data modifications
- Additive changes only: new tables, new columns, new indexes, and new foreign keys

Assumptions:
- Existing production data must remain intact
- Current schema differs significantly (UUID vs BIGINT/VARCHAR IDs, naming)
- We will introduce parallel structures or additive columns where mismatch is large

## Strategy-Only Executive Plan

This section classifies mismatches and defines safe patterns and phases. No SQL generation or schema modification is proposed here.

### Buckets (Classification)
- A: Safe to ALTER directly (non-breaking, additive, nullable, indexes, compatible FKs)
- B: Requires additive columns + backfill (derive values, maintain both until cutover)
- C: Requires parallel columns (old + new) with phased migration (dual-read/write, later switch)
- D: Requires table shadowing (new table, sync, cutover later; existing table retained)

### Major Areas and Patterns
- ID type mismatches (UUID BINARY vs BIGINT/VARCHAR): Prefer C (parallel PK/UK columns) for columns; D (table shadowing) when PK semantics or relationships prevent parallelization.
- Table name mismatches: Use D (shadow table with target name), application-level sync and cutover; do not rename legacy tables.
- FK semantic mismatches: If target relationship differs materially (e.g., request-centric vs assignment-centric), use D (new relationship table) or B/C for additive FK columns with staged backfill.
- Extra columns not in JPA: Defer; keep as-is. Map/ignore via ORM; evaluate removal only in future deprecation windows (not in scope).

### Migration Plan Table (Entity | Risk | Strategy | Phase)
| Entity | Risk | Strategy (Bucket) | Phase |
|---|---|---|---|
| `users` (active/version/updated_at) | Low | A (additive columns, indexes) | 1 |
| `roles` (version) | Low | A | 1 |
| `process_steps` (responsible_role, seconds) | Low | A/B (add seconds column) | 1–2 |
| `requests` (creator/started/completed) | Low | A (additive columns, indexes) | 1 |
| `file_attachments` (content_type, paths) | Low | A | 1 |
| `assignments` (assigned_by, notes) | Low | A | 1 |
| `delays` (responsible/justification fields) | Medium | A/B (add columns, backfill) | 1–2 |
| `delay_justifications` (approved_by/at) | Medium | A/B | 1–2 |
| `escalation_rules` (step/user/threshold/cooldown) | Medium | A/B | 1–2 |
| `feature_flags` (impact, metadata, JSON) | Low | A/B (JSON init) | 1–2 |
| `audit_logs` (legal holds, agent) | Low | A | 1 |
| `role_permissions_text` (text permissions) | Low | D (new parallel table) | 1 |
| `escalation_history` (assignment-centric) | Medium | D (shadow new table) | 1–2 |
| `slas` (step-centric with role) | High | D (shadow `slas_new`) | 1–2 |
| `delegations` (assignment-based) | High | D (shadow `delegations_new`) | 1–2 |
| `delay_debt_scores` (aggregates) | Low | D (new table) | 1 |
| ID type (UUID vs BIGINT/VARCHAR) | High | C (parallel IDs) or D (shadow tables) | 2–3 |
| FK semantics (user_roles uniqueness, request vs assignment links) | Medium–High | B/C/D (add columns or shadow relationship tables) | 1–3 |
| Extra legacy columns (not in JPA) | Low | Defer (no change) | N/A |

### Phases
- Phase 1: Add-only changes
  - Create shadow tables where needed (D)
  - Add additive columns and indexes (A/B)
  - Add FKs only when types already match; otherwise defer to Phase 2
- Phase 2: Backfill strategy
  - Derive and populate new columns (B)
  - Establish dual-write/dual-read in application for parallel columns (C)
  - Sync shadow tables (D) via ETL/jobs or app services; validate referential integrity
- Phase 3: Validation readiness for `ddl-auto=validate`
  - Switch application reads to new columns/tables
  - Freeze writes to legacy paths (feature flags/ops window)
  - Run validation in staging, then production post-cutover

### Recommendations (Defer vs Fix Now)
- Fix Now (Phase 1): All additive columns, indexes, JSON metadata, new analytical tables (`delay_debt_scores`), and shadow tables creation without cutover.
- Plan/Backfill (Phase 2): ID type parallelization, assignment-centric histories, SLA and delegation shadow tables population, FK additions requiring type harmonization.
- Defer: Any destructive renames/drops; removal of extra legacy columns; constraints that would block production writes.

Phasing Overview:
1. Create missing tables (new tables only)
2. Add missing columns (nullable or with safe defaults)
3. Add indexes for query performance
4. Add foreign keys where safe and types match
5. Backfill planning (separate ops run) for derived/UUID columns – documented, not executed here

## 1) Missing Tables (CREATE only)

### delay_debt_scores
Represents aggregated delay metrics per user/role.

```sql
CREATE TABLE IF NOT EXISTS delay_debt_scores (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  role_id BIGINT NULL,
  total_delay_seconds BIGINT NOT NULL DEFAULT 0,
  total_delays_count INT NOT NULL DEFAULT 0,
  average_delay_seconds BIGINT NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delay_debt_user ON delay_debt_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_delay_debt_role ON delay_debt_scores(role_id);
```

### escalation_history (JPA-aligned)
Existing table `escalation_histories` uses request-centric FKs. JPA expects assignment-centric.

```sql
CREATE TABLE IF NOT EXISTS escalation_history (
  id VARCHAR(36) PRIMARY KEY,
  assignment_id VARCHAR(36) NOT NULL,
  escalated_from_user_id VARCHAR(36) NULL,
  escalated_to_user_id VARCHAR(36) NULL,
  escalated_to_role_id BIGINT NULL,
  reason TEXT,
  escalated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### slas_new (parallel table due to structural mismatch)
Current `slas` is process-centric; JPA expects step-centric with role fields.

```sql
CREATE TABLE IF NOT EXISTS slas_new (
  id VARCHAR(36) PRIMARY KEY,
  process_step_id VARCHAR(36) NOT NULL,
  role_id BIGINT NULL,
  role_name VARCHAR(100) NULL,
  allowed_duration_seconds BIGINT NOT NULL,
  description TEXT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sla_step ON slas_new(process_step_id);
CREATE INDEX IF NOT EXISTS idx_sla_role ON slas_new(role_id);
```

### delegations_new (parallel table due to structural mismatch)
Current `delegations` is user-to-user; JPA expects assignment-based delegation.

```sql
CREATE TABLE IF NOT EXISTS delegations_new (
  id VARCHAR(36) PRIMARY KEY,
  assignment_id VARCHAR(36) NOT NULL,
  original_user_id VARCHAR(36) NOT NULL,
  delegated_to_id VARCHAR(36) NOT NULL,
  delegated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason TEXT NULL,
  retain_accountability BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delegation_assignment ON delegations_new(assignment_id);
CREATE INDEX IF NOT EXISTS idx_delegation_original ON delegations_new(original_user_id);
CREATE INDEX IF NOT EXISTS idx_delegation_delegated ON delegations_new(delegated_to_id);
```

### role_permissions_text (parallel table to support JPA element collection)
Current model uses `permissions` table with `role_permissions(role_id, permission_id)`. JPA expects text permissions.

```sql
CREATE TABLE IF NOT EXISTS role_permissions_text (
  role_id BIGINT NOT NULL,
  permission VARCHAR(255) NOT NULL,
  PRIMARY KEY (role_id, permission)
);
```

## 2) Missing Columns (ALTER only)

Note: Use `ADD COLUMN IF NOT EXISTS` (MySQL 8) where supported.

### users
```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS version_num BIGINT NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL;

-- Indexes (ensure presence)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_username ON users(username);
```

### roles
```sql
ALTER TABLE roles
  ADD COLUMN IF NOT EXISTS version_num BIGINT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_role_name ON roles(name);
```

### process_steps
```sql
ALTER TABLE process_steps
  ADD COLUMN IF NOT EXISTS responsible_role VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS default_sla_duration_seconds BIGINT NULL;

CREATE INDEX IF NOT EXISTS idx_step_process ON process_steps(process_id);
CREATE INDEX IF NOT EXISTS idx_step_sequence ON process_steps(process_id, sequence_order);
```

### requests
```sql
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS created_by_id VARCHAR(36) NULL;

CREATE INDEX IF NOT EXISTS idx_request_process ON requests(process_id);
CREATE INDEX IF NOT EXISTS idx_request_creator ON requests(created_by_id);
CREATE INDEX IF NOT EXISTS idx_request_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_request_created ON requests(created_at);
```

### file_attachments
```sql
ALTER TABLE file_attachments
  ADD COLUMN IF NOT EXISTS content_type VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS storage_path VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS description VARCHAR(500) NULL;

CREATE INDEX IF NOT EXISTS idx_attachment_request ON file_attachments(request_id);
```

### assignments
```sql
ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS assigned_by_id VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS notes TEXT NULL;

CREATE INDEX IF NOT EXISTS idx_assignment_step ON assignments(process_step_id);
CREATE INDEX IF NOT EXISTS idx_assignment_user ON assignments(assigned_to_user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_status ON assignments(status);
```

### delays
```sql
ALTER TABLE delays
  ADD COLUMN IF NOT EXISTS responsible_user_id VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS justification TEXT NULL,
  ADD COLUMN IF NOT EXISTS justified_by_id VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS justified_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS is_justified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS original_assignment_id VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS is_shadow_delay BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_delay_assignment ON delays(assignment_id);
CREATE INDEX IF NOT EXISTS idx_delay_responsible ON delays(responsible_user_id);
CREATE INDEX IF NOT EXISTS idx_delay_created ON delays(detected_at);
```

### delay_justifications
```sql
ALTER TABLE delay_justifications
  ADD COLUMN IF NOT EXISTS justification_text TEXT NULL,
  ADD COLUMN IF NOT EXISTS approved_by_id VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_justification_delay ON delay_justifications(delay_id);
CREATE INDEX IF NOT EXISTS idx_justification_approved ON delay_justifications(approved);
```

### escalation_rules
```sql
ALTER TABLE escalation_rules
  ADD COLUMN IF NOT EXISTS process_step_id VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS threshold_percentage INT NULL,
  ADD COLUMN IF NOT EXISTS cooldown_seconds BIGINT NULL,
  ADD COLUMN IF NOT EXISTS escalation_user_id VARCHAR(36) NULL;

CREATE INDEX IF NOT EXISTS idx_escalation_step ON escalation_rules(process_step_id);
CREATE INDEX IF NOT EXISTS idx_escalation_active ON escalation_rules(trigger_condition);
```

### feature_flags
```sql
ALTER TABLE feature_flags
  ADD COLUMN IF NOT EXISTS impact VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NULL,
  ADD COLUMN IF NOT EXISTS required_roles JSON NULL,
  ADD COLUMN IF NOT EXISTS dependencies JSON NULL;
```

### audit_logs
```sql
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS user_agent VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS legal_hold_reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS legal_hold_by VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS legal_hold_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(username);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_timestamp ON audit_logs(timestamp);
```

## 3) Foreign Keys (ADD where types match)

Note: Only add FKs where column types align with referenced PKs.

```sql
-- delay_debt_scores
ALTER TABLE delay_debt_scores
  ADD CONSTRAINT fk_dds_user FOREIGN KEY (user_id) REFERENCES users(id),
  ADD CONSTRAINT fk_dds_role FOREIGN KEY (role_id) REFERENCES roles(id);

-- escalation_history (new)
ALTER TABLE escalation_history
  ADD CONSTRAINT fk_escal_hist_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  ADD CONSTRAINT fk_escal_hist_to_user FOREIGN KEY (escalated_to_user_id) REFERENCES users(id),
  ADD CONSTRAINT fk_escal_hist_from_user FOREIGN KEY (escalated_from_user_id) REFERENCES users(id),
  ADD CONSTRAINT fk_escal_hist_to_role FOREIGN KEY (escalated_to_role_id) REFERENCES roles(id);

-- slas_new
ALTER TABLE slas_new
  ADD CONSTRAINT fk_sla_step FOREIGN KEY (process_step_id) REFERENCES process_steps(id),
  ADD CONSTRAINT fk_sla_role FOREIGN KEY (role_id) REFERENCES roles(id);

-- delegations_new
ALTER TABLE delegations_new
  ADD CONSTRAINT fk_del_new_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  ADD CONSTRAINT fk_del_new_orig FOREIGN KEY (original_user_id) REFERENCES users(id),
  ADD CONSTRAINT fk_del_new_to FOREIGN KEY (delegated_to_id) REFERENCES users(id);

-- requests
ALTER TABLE requests
  ADD CONSTRAINT fk_req_created_by FOREIGN KEY (created_by_id) REFERENCES users(id);

-- assignments
ALTER TABLE assignments
  ADD CONSTRAINT fk_assign_by FOREIGN KEY (assigned_by_id) REFERENCES users(id);

-- delays
ALTER TABLE delays
  ADD CONSTRAINT fk_delay_resp_user FOREIGN KEY (responsible_user_id) REFERENCES users(id),
  ADD CONSTRAINT fk_delay_just_by FOREIGN KEY (justified_by_id) REFERENCES users(id),
  ADD CONSTRAINT fk_delay_orig_assign FOREIGN KEY (original_assignment_id) REFERENCES assignments(id);

-- delay_justifications
ALTER TABLE delay_justifications
  ADD CONSTRAINT fk_dj_approved_by FOREIGN KEY (approved_by_id) REFERENCES users(id);

-- escalation_rules
ALTER TABLE escalation_rules
  ADD CONSTRAINT fk_er_step FOREIGN KEY (process_step_id) REFERENCES process_steps(id),
  ADD CONSTRAINT fk_er_user FOREIGN KEY (escalation_user_id) REFERENCES users(id),
  ADD CONSTRAINT fk_er_role FOREIGN KEY (escalate_to_role_id) REFERENCES roles(id);
```

## 4) Data Type Mismatch Strategy (No changes in this plan)

- UUID vs BIGINT/VARCHAR PKs: Introduce parallel columns later (e.g., `id_uuid BINARY(16) UNIQUE`) and backfill; not part of this additive-only plan.
- Duration units: JPA uses seconds (BIGINT). Current schema uses minutes/INT; retain existing columns and add new seconds columns where needed (`default_sla_duration_seconds`, `allowed_duration_seconds`, `actual_duration_seconds`). Backfill logic needed.

## 5) Backfill Guidance (Out-of-scope for execution here)

- Populate new columns by deriving from existing data (e.g., map `created_by_user_id` -> `created_by_id`).
- For new JSON columns in `feature_flags`, initialize based on application defaults (empty arrays) or admin curation.
- For parallel tables (`slas_new`, `delegations_new`), populate from existing tables with process/role mapping.
- Validate referential integrity post backfill using application services.

## 6) Validation Checklist

- Ensure application can read from new columns/tables without breaking existing features.
- Monitor index creation time and potential lock contention in production windows.
- Stage changes in a lower environment before applying to production.

---

This plan intentionally avoids destructive operations. Execute statements in controlled batches, with pre-checks against `INFORMATION_SCHEMA` for existence where `IF NOT EXISTS` is not supported for specific index operations.
