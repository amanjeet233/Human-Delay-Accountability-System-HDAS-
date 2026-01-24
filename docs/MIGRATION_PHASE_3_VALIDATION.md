# Phase-3: Hibernate ddl-auto=validate Readiness (Strategy Only)

Date: 2026-01-24
Scope: Non-destructive, no data movement, no SQL. Minimum additions required for validation to pass, with clear deferrals.

## Classification of Potential Validation Errors
- A (Compatible – ignore): Legacy extra columns, legacy indexes not declared in JPA, naming differences for non-mapped legacy tables.
- B (Additive column / FK required): JPA expects a column/FK that is currently missing but can be safely added (nullable/default), types already compatible.
- C (Parallel column required): JPA expects UUID/BINARY(16) or different type; add parallel column (keep legacy intact), application dual-read later.
- D (Shadow table required): JPA entity expects substantially different structure; create/ensure parallel table exists (no rename/drop), cutover later.

## Validation Blockers (Entity | Issue | Fix Type | Required?)
| Entity | Issue | Fix Type | Required? |
|---|---|---|---|
| users | Missing `active`, `version_num`, `updated_at` | B (add columns) | Yes |
| users | Unique constraints on `email`, `username` expected | B (add unique indexes/constraints) | Yes |
| roles | Missing `version_num` | B | Yes |
| roles | Unique `name` expected | B | Yes |
| process_steps | Missing `responsible_role`, `default_sla_duration_seconds` | B | Yes |
| requests | Missing `started_at`, `completed_at`, `created_by_id` | B | Yes |
| file_attachments | Missing `content_type`, `storage_path`, `description` | B | Yes |
| assignments | Missing `assigned_by_id`, `notes` | B | Yes |
| delays | Missing `responsible_user_id`, `justification`, `justified_by_id`, `justified_at`, `is_justified`, `original_assignment_id`, `is_shadow_delay` | B | Yes |
| delay_justifications | Missing `justification_text`, `approved_by_id`, `approved_at` | B | Yes |
| escalation_rules | Missing `process_step_id`, `threshold_percentage`, `cooldown_seconds`, `escalation_user_id` | B | Yes |
| feature_flags | Missing `impact`, `updated_by`, `updated_at`, `required_roles` (JSON), `dependencies` (JSON) | B | Yes |
| audit_logs | Missing `user_agent`, `legal_hold_reason`, `legal_hold_by`, `legal_hold_at` | B | Yes |
| role_permissions_text | Table must exist for JPA element-collection | D (shadow table) | Yes (if JPA maps to text) |
| escalation_history | Table must exist (assignment-centric) | D | Yes |
| slas_new or slas (step-centric) | JPA expects step-centric structure | C/D (parallel columns or shadow table) | Yes |
| delegations_new | Table must exist (assignment-based) | D | Yes |
| delay_debt_scores | Table must exist (aggregates) | D | Yes |
| UUID PKs (all entities) | JPA expects `BINARY(16)` alongside legacy | C (parallel UUID columns) | Yes (if entity maps UUID) |
| FKs (see list) | JPA relationships require FKs present | B/C/D (depending on types/tables) | Yes |

## Minimum Additions Required (No SQL here)

### Tables that must exist (as mapped by JPA)
- role_permissions_text
- escalation_history
- slas_new (or ensure `slas` meets step-centric mapping if JPA points to `slas`)
- delegations_new
- delay_debt_scores

### Columns that must exist
- users: active, version_num, updated_at
- roles: version_num
- process_steps: responsible_role, default_sla_duration_seconds
- requests: started_at, completed_at, created_by_id
- file_attachments: content_type, storage_path, description
- assignments: assigned_by_id, notes
- delays: responsible_user_id, justification, justified_by_id, justified_at, is_justified, original_assignment_id, is_shadow_delay
- delay_justifications: justification_text, approved_by_id, approved_at
- escalation_rules: process_step_id, threshold_percentage, cooldown_seconds, escalation_user_id
- feature_flags: impact, updated_by, updated_at, required_roles (JSON), dependencies (JSON)
- audit_logs: user_agent, legal_hold_reason, legal_hold_by, legal_hold_at
- UUID parallel columns (where JPA maps UUID): `*_uuid` BINARY(16) or JPA-specified names

### FK constraints Hibernate expects (types must be compatible)
- requests.created_by_id → users.id
- assignments.assigned_by_id → users.id
- delays.responsible_user_id → users.id
- delays.justified_by_id → users.id
- delays.original_assignment_id → assignments.id
- delay_justifications.approved_by_id → users.id
- escalation_rules.process_step_id → process_steps.id
- escalation_rules.escalation_user_id → users.id
- escalation_history.assignment_id → assignments.id
- escalation_history.escalated_to_user_id / escalated_from_user_id → users.id
- escalation_history.escalated_to_role_id → roles.id
- slas_new.process_step_id → process_steps.id; slas_new.role_id → roles.id
- delegations_new.assignment_id → assignments.id; delegations_new.original_user_id → users.id; delegations_new.delegated_to_id → users.id
- delay_debt_scores.user_id → users.id; delay_debt_scores.role_id → roles.id

### Indexes/Constraints Hibernate may check
- Unique: users.email, users.username
- Unique: roles.name
- Primary keys and not-null column constraints as per JPA annotations
- Optional indexes (performance, not validated): created_at on requests; attachment/request relationship; step/process and sequence for process_steps; etc.

## Required for Validation vs Safe to Ignore
- Required for validation:
  - Existence of all mapped tables and columns listed above.
  - FK constraints for JPA relationships where types already match.
  - Unique constraints declared via JPA annotations (e.g., users.email, users.username, roles.name).
  - Parallel UUID columns where JPA maps UUID (even if not used in reads yet).
- Safe to ignore until later:
  - Legacy-only tables/columns not mapped in JPA.
  - Non-annotated performance indexes.
  - Backfill of values (Phase-2 handles data); validation checks structure only.
  - Cutover to new shadow tables and UUID primary key switchovers.

## Decision: READY FOR SQL GENERATION?
- Yes, with caveats:
  - Generate only additive SQL to create the listed tables/columns/constraints.
  - Do NOT enforce FKs where types mismatch; defer with Phase-2 C/D strategies.
  - Maintain idempotency (`IF NOT EXISTS` semantics) and avoid locks during peak hours.
  - High-risk areas (SLA step-centric, delegations assignment-based, global UUID transitions) should be generated as shadow/parallel structures, not enforced cutovers.
