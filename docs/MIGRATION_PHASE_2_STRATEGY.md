# Phase-2 Backfill Strategy (No SQL, No Schema Changes)

Date: 2026-01-24
Scope: Strategy and sequencing only; idempotent operations; production-safe.

## Backfill Plan Table (Table | Old Field | New Field | Method | Risk)
| Table | Old Field | New Field | Method | Risk |
|---|---|---|---|---|
| users | (n/a) | active | Initialize TRUE where NULL; preserve explicit deactivated users | Low |
| users | (n/a) | version_num | Derive from existing audit/versioning if present; else NULL | Low |
| users | (derived) | updated_at | Copy last known change timestamp from audit_logs; else created_at | Low |
| process_steps | default_sla_minutes (legacy) | default_sla_duration_seconds | Convert minutes × 60; leave NULL if source missing | Low |
| requests | created_by_user_id | created_by_id | Direct copy; validate existence in users; log missing | Low |
| requests | (derived) | started_at | Earliest assignment.created_at for request; fallback request.created_at | Low |
| requests | (derived) | completed_at | Latest assignment.completed_at when all done; else NULL | Low |
| file_attachments | (existing metadata) | content_type/storage_path/description | Populate from stored metadata; leave NULL if unknown | Low |
| assignments | (audit) | assigned_by_id | From audit_logs actor on assignment create; fallback system admin | Low |
| assignments | (n/a) | notes | Initialize empty string; preserve existing remarks if any | Low |
| delays | (derived from assignment/user) | responsible_user_id | Assigned_to_user_id at delay detection time | Medium |
| delays | (legacy text) | justification | Copy from existing reason/comment fields | Medium |
| delays | (audit) | justified_by_id/justified_at | From audit_logs approval event; else NULL | Medium |
| delays | (relation) | original_assignment_id | Previous assignment linked to same request/user | Medium |
| delays | (derived) | is_justified/is_shadow_delay | Boolean flags set by existence of approval or migration source | Medium |
| delay_justifications | (audit) | approved_by_id/approved_at | From approval events; ensure user exists | Medium |
| escalation_rules | trigger_minutes | cooldown_seconds | Convert minutes × 60; leave NULL where undefined | Medium |
| escalation_rules | (relation) | process_step_id | Map from request-centric to step via assignments.process_step_id | Medium |
| escalation_rules | (actor) | escalation_user_id | Select designated user for escalation; else NULL with role-only | Medium |
| feature_flags | (admin/user) | impact/updated_by/updated_at | From last flag change audit; defaults: impact="neutral" | Low |
| feature_flags | (roles list) | required_roles (JSON) | Build array from roles with access; empty array if unknown | Low |
| feature_flags | (dependencies list) | dependencies (JSON) | Derive from app config feature dependencies; empty array if none | Low |
| audit_logs | (runtime) | user_agent | Populate from request logs if available; else NULL | Low |
| audit_logs | (legal) | legal_hold_reason/legal_hold_by/legal_hold_at | Populate from compliance/legal holds table; else NULL | Low |
| role_permissions_text | role_permissions.permission_id | permission (text) | Lookup permission name; write unique text per role | Low |
| escalation_history (new) | escalation_histories.* | assignment-centric fields | Map by request_id → assignments.id; copy actors/timestamps | Medium |
| slas_new | slas.* | step-centric row | For each process_step, derive role and duration; seconds = minutes × 60 | High |
| delegations_new | delegations.* | assignment-based row | Join to assignment by request/user at time of delegation | High |
| delay_debt_scores | delays.* | aggregated metrics | Aggregate per user/role; recomputable; initialize totals | Low |

## UUID (BINARY(16)) and FK Synchronization Strategy
- UUID Derivation:
  - If legacy IDs are VARCHAR(36) UUIDs: derive BINARY(16) via canonical hex conversion; ensure bitwise-stable mapping.
  - If legacy IDs are BIGINT: generate stable UUIDs (v5 namespace or deterministic hash-based) and persist in a mapping table to avoid collisions.
- Mapping Tables:
  - Maintain `*_id_map` tables per entity: legacy_id (BIGINT/VARCHAR) ↔ uuid_binary (BINARY(16)), with unique constraints.
  - Idempotency: lookups before inserts; never overwrite existing mappings.
- FK Synchronization:
  - For parallel columns (C): populate new FK columns using mapping tables; enforce application dual-read/dual-write during transition.
  - For shadow tables (D): write rows with UUID-based references while maintaining legacy relations in old tables; keep referential integrity checks in app services.
  - Re-run safety: operations are keyed on legacy_id; repeated runs only fill missing UUIDs.

## Shadow Tables Sync Plan (`*_new`)
- Direction: Old → New (source of truth remains legacy during Phase-2).
- Frequency: Batch ETL daily/hourly based on churn; critical paths can use app-layer dual write for near-real-time.
- Mechanisms:
  - Batch: ETL job reads changes since last watermark (timestamp/id), upserts into `*_new`.
  - Dual Write (optional): Application writes to both old and new tables behind a feature flag.
- Cutover Readiness:
  - Row counts match within tolerance; missing rows explained.
  - Checksums/hashes on key fields per row sample.
  - Referential integrity validated (FK targets exist) in `*_new`.

## Phase-2 Read/Write Behavior
- Reads: Prefer legacy fields/tables to avoid user-visible changes; enable selective shadow reads for validation paths.
- Writes: Dual-write for entities with parallel columns/tables (C/D) where feasible; otherwise legacy-only with scheduled batch sync to new structures.
- Feature Flags: Gate dual-write and shadow reads; allow safe rollback by toggling flags.

## Phase-2 Checklist
- Phase-2.1: Preparation
  - Define `*_id_map` tables and seed initial mappings (no schema change here; conceptual readiness).
  - Catalog source-to-target field mappings and transformations per table.
  - Configure ETL/ops pipelines with watermarking and idempotent upserts.
  - Enable feature flags for dual-write/read in non-prod.
- Phase-2.2: Backfill Execution
  - Run batch backfills for B/C/D items with logging and retry.
  - Activate dual-write in staging for high-risk areas (`slas_new`, `delegations_new`).
  - Populate UUID FK columns using mapping tables; verify per-entity integrity.
- Phase-2.3: Consistency Verification
  - Compare counts between old and new structures.
  - Spot-check random samples; compute hash over critical fields.
  - Validate referential integrity in new tables/columns using app queries.
  - Confirm idempotency by re-running backfill with zero net changes.
- Phase-2.4: Ready-for-Validate Criteria
  - Application can read from new columns/tables behind flags with identical results.
  - Dual-write produces identical data between old and new for a representative period.
  - UUID mappings complete for all referenced entities; no unmapped legacy IDs.
  - Known HIGH-RISK items (`slas_new`, `delegations_new`, ID type transitions) either stabilized under dual-write or explicitly deferred.

## High-Risk Items to Defer
- SLA step-centric transformation (`slas_new`) where process models differ significantly.
- Assignment-based delegations (`delegations_new`) where historic linkage is ambiguous.
- Global PK type transitions to UUID where legacy BIGINT lacks deterministic mapping—require extended dual-write window.
