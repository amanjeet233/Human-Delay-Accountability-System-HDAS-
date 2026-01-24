# Changelog

All notable changes to this project will be documented in this file.

## v1.0.4 — 2026-01-24

- Documentation consolidation and professional presentation
  - Rewrote root README with enterprise-grade sections (architecture, roles, features, security, DB, setup, badges).
  - Removed redundant role-specific README files (Admin/Auditor/Citizen/Clerk/HOD/Section Officer) — merged content into root README.
  - Moved non-runtime reports/runbooks to `docs/` to keep the repository root clean.
- CI
  - Added backend build GitHub Actions workflow (`.github/workflows/backend-build.yml`) to verify Maven build.
  - Added build status badge to README.
- Database
  - Added `SCHEMA_CONSOLIDATED.sql` as the canonical, idempotent schema + seed file.

### Release Notes

This release focuses on documentation cleanup and professional presentation for GitHub submission. No functional changes to backend, frontend, or database code.

To publish a GitHub Release for `v1.0.4`:
1. Open the repository on GitHub → Releases → "Draft a new release".
2. Select tag `v1.0.4`, set title "v1.0.4 Docs & CI".
3. Paste the notes above.

## v1.0.3 — 2026-01-24

- Cleanup: removed dead/debug code and demo artifacts
  - Deleted demo tests (e.g., `PasswordTest.java`), hardcoded credentials (`mysql-login.in`), local-only scripts, and orphaned routes.
  - Removed unused guard component `RoleProtection.tsx` and orphaned `app/analytics/page.tsx`.
  - Cleaned dev logs; ensured `backend/boot-dev.txt` and `backend/logs/` are not tracked.
- Security and access
  - Verified `RoleGuard` strict role checks across dashboards and detail pages.
  - Ensured no page renders without proper role; consistent redirects to `/403` or `/unauthorized`.
- Feature flags
  - Confirmed UI gating via `FeatureGuard` remains intact and separate from auth.
- Repository hygiene
  - Updated `.gitignore` to exclude heavy outputs: `frontend/.next/`, `frontend/node_modules/`, `backend/logs/`, and all nested `logs`.
  - Verified `node_modules`, `.next`, `target`, and logs are excluded for GitHub safety.
- Tags
  - Pushed tags: `v1.0.3` and `cleanup-20260124-1600`.

### Release Notes

This release focuses on repository hygiene, access guard alignment, and consistent ignore rules to keep the GitHub footprint lean.

To publish a GitHub Release for `v1.0.3`:
1. Open the repository on GitHub → Releases → "Draft a new release".
2. Select tag `v1.0.3`, set title "v1.0.3 Cleanup".
3. Paste the notes above.
