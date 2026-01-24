# Phase-5 Runtime Verification Runbook (Hibernate ddl-auto=validate)

Date: 2026-01-24
Scope: Production-safe runtime checks, no schema changes.

## Objectives
- Ensure schema structure matches JPA mappings for validation.
- Confirm application starts and core endpoints respond.
- Provide rollback safety if validation fails.

## Commands
### Build (optional)
```bash
mvn -q -DskipTests package
```

### Start backend with validation (Windows PowerShell)
```powershell
java -jar backend\target\human-delay-accountability-system-1.0.0.jar `
  --spring.profiles.active=prod `
  --spring.jpa.hibernate.ddl-auto=validate `
  --logging.level.org.hibernate.tool.hbm2ddl=DEBUG |
  Tee-Object -FilePath backend\logs\validate-run.log
```

### Health & Auth checks
```bash
curl -s http://localhost:8080/actuator/health
curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'
```

### Parse logs
```bash
cd scripts/phase-validation
npm install
npm run parse-log ../../backend/logs/validate-run.log
```

## Red/Green Log Patterns
- Green:
  - "Schema validator/validation complete"
  - "Started <App> in <n> seconds"
  - "Tomcat initialized with port(s): 8080"
- Red (blockers):
  - "Schema-validation: missing table [name]"
  - "Schema-validation: missing column [table.column]"
  - "Schema-validation: wrong column type for column [table.column]"
  - "BeanCreationException: ... entityManagerFactory"
  - "SchemaManagementException"

## PASS Criteria
- Logs contain validator completion and app started; Tomcat port displayed.
- No schema-validation errors or bean creation failures.
- Endpoints respond: health returns status UP; login issues JWT.

## Rollback Safety
- If validation fails:
  - Stop the app.
  - Restart with validation disabled to resume service:
    ```powershell
    java -jar backend\target\human-delay-accountability-system-1.0.0.jar --spring.profiles.active=prod --spring.jpa.hibernate.ddl-auto=none
    ```
  - Inspect backend\logs\validate-run.log and fix additive structures only (no destructive changes).
- Temporarily disable problematic features/entities:
  - Use feature flags to avoid hitting unmigrated shadow tables.
  - Limit package scan or repository wiring via profiles, if configured.

## GO / NO-GO Decision
- GO: All PASS criteria met; validator complete; app started; health/login OK; parse-log reports green signals.
- NO-GO: Any red pattern present or endpoints failing; revert to ddl-auto=none and triage.
