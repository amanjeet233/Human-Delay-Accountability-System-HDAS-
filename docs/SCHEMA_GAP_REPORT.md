# HDAS Schema Gap Report (MySQL vs JPA)

Date: 2026-01-24
Scope: Non-destructive analysis only. Production data assumed present.

## Missing Tables
- delay_debt_scores: Aggregates per user/role.
- escalation_history: Assignment-centric history (current has escalation_histories request-centric).
- Parallel structures recommended due to mismatch:
  - slas_new (step-centric, role fields).
  - delegations_new (assignment-based delegation).
  - role_permissions_text (element collection of text permissions).

## Missing Columns
- users: active (bool), version_num (bigint), updated_at (timestamp).
- roles: version_num (bigint).
- process_steps: responsible_role (varchar 100), default_sla_duration_seconds (bigint).
- requests: started_at (timestamp), completed_at (timestamp), created_by_id (varchar 36). Index on created_at.
- file_attachments: content_type (varchar 100), storage_path (varchar 500), description (varchar 500).
- assignments: assigned_by_id (varchar 36), notes (text). Index on process_step_id.
- delays: responsible_user_id (varchar 36), justification (text), justified_by_id (varchar 36), justified_at (timestamp), is_justified (bool), original_assignment_id (varchar 36), is_shadow_delay (bool). Index on detected_at.
- delay_justifications: justification_text (text), approved_by_id (varchar 36), approved_at (timestamp).
- escalation_rules: process_step_id (varchar 36), threshold_percentage (int), cooldown_seconds (bigint), escalation_user_id (varchar 36).
- feature_flags: impact (varchar 50), updated_by (varchar 255), updated_at (timestamp), required_roles (json), dependencies (json).
- audit_logs: user_agent (varchar 500), legal_hold_reason (text), legal_hold_by (varchar 255), legal_hold_at (timestamp).

## Wrong Data Types (do not change in place; plan phased additions)
- IDs: JPA prefers UUID `BINARY(16)`; current uses `VARCHAR(36)` or `BIGINT`.
- requests.title length: 500 expected vs 255 current.
- delays.delay_seconds: BIGINT expected vs INT current.
- assignments.allowed_duration_seconds/actual_duration_seconds: BIGINT expected vs INT current.
- process_steps default duration: seconds (BIGINT) expected vs minutes (INT) current.
- feature_flags.id: BIGINT identity in JPA vs VARCHAR(36) UUID current.

## Missing Indexes
- requests: idx_request_created on created_at.
- file_attachments: idx_attachment_request on request_id.
- process_steps: idx_step_process, idx_step_sequence.
- assignments: idx_assignment_step.
- delays: idx_delay_responsible, idx_delay_created.
- escalation_rules: idx_escalation_step, idx_escalation_active.
- Ensure users unique indexes: idx_user_email, idx_user_username.

## Foreign Key Gaps
- role_permissions_text: (role_id -> roles.id) with text `permission` keys (parallel to existing).
- user_roles: current UNIQUE(user_id) enforces single role; JPA allows many-to-many. Keep as-is; note type mismatch (BIGINT vs UUID).
- requests: created_by_id -> users.id (additive), current uses created_by_user_id.
- file_attachments: JPA models request-only; current has assignment_id, uploaded_by_user_id (keep).
- delays: add FKs for responsible_user_id, justified_by_id, original_assignment_id.
- delay_justifications: add FK approved_by_id -> users.id.
- escalation_rules: add FK process_step_id -> process_steps.id and escalation_user_id -> users.id.
- escalation_history: add assignment-centric FKs.
- slas_new: add FK process_step_id -> process_steps.id and role_id -> roles.id.
- delegations_new: add FKs assignment_id/original_user_id/delegated_to_id.

## Notes
- No DROP or data changes proposed.
- Use additive columns/tables and backfill in controlled phases.
- Validate via application services after migration.
