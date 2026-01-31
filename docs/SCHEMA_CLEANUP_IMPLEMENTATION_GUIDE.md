# Database Schema & JPA Entity Audit - Implementation Guide

**Status**: 🔴 CRITICAL ISSUES IDENTIFIED  
**Severity**: CRITICAL - Entity duplication, schema conflicts  
**Priority**: Phase 1 - IMMEDIATE fix required before production  

---

## Executive Summary

**CRITICAL FINDINGS**:
1. **Duplicate Entity Definitions**: `com.hdas.model.*` conflicts with `com.hdas.domain.*`
2. **Duplicate Table Definition**: `escalation_history` defined twice in schema
3. **Password Hash Mismatch**: Schema uses BCrypt strength 10, backend expects strength 12
4. **DDL-AUTO Conflict**: `ddl-auto=validate` will fail due to entity duplication

**Impact**: Application may boot, but JPA validation will fail, authentication may fail with wrong password hash, and entity mapping is ambiguous.

**Solution**: Three-phase cleanup with complete verification.

---

## Phase 1: Code Cleanup (IMMEDIATE)

### Step 1.1: Delete Duplicate Model Package Entities

These files are outdated and conflict with proper domain entities:

```bash
# BACKUP FIRST
git add -A && git commit -m "Pre-schema-cleanup backup"

# DELETE old model entities (search for imports first!)
rm backend/src/main/java/com/hdas/model/User.java
rm backend/src/main/java/com/hdas/model/Role.java
rm backend/src/main/java/com/hdas/model/Request.java
rm backend/src/main/java/com/hdas/model/AuditLog.java

# KEEP FeatureFlag.java if referenced elsewhere, otherwise delete
# Check for usages first:
grep -r "com.hdas.model" backend/src --include="*.java" | grep -v ".class"
```

### Step 1.2: Audit Code References

**Search for imports from `com.hdas.model`** (should find NONE after cleanup):

```bash
# This should return EMPTY after cleanup
grep -r "import com.hdas.model" backend/src --include="*.java"

# Only imports from com.hdas.domain should exist
grep -r "import com.hdas.domain" backend/src --include="*.java" | head -20
```

### Step 1.3: Verify Backend Still Compiles

```bash
cd backend
mvn clean compile -q
echo "Build Status: $?"  # Should be 0 (success)
```

---

## Phase 2: Database Schema Cleanup

### Step 2.1: Backup Current Database

```bash
# Export current data (CRITICAL before running cleanup)
mysqldump -u root -p hdas_db > hdas_db_backup_$(date +%Y%m%d_%H%M%S).sql

# Verify backup created
ls -lh hdas_db_backup_*.sql
```

### Step 2.2: Apply Corrected Schema

**Two options**:

#### Option A: Fresh Database (Recommended for Testing)
```bash
mysql -u root -p < backend/src/main/resources/db/SCHEMA_CORRECTED.sql
```

#### Option B: Update Existing Database (Production Caution)
```bash
# Backup first!
mysqldump -u root -p hdas_db > hdas_db_pre_update.sql

# Apply updates (idempotent, safe to re-run)
mysql -u root -p hdas_db < backend/src/main/resources/db/SCHEMA_CORRECTED.sql

# Run cleanup (removes orphaned data)
mysql -u root -p hdas_db < backend/src/main/resources/db/CLEANUP_AND_SEED.sql
```

### Step 2.3: Verify Schema Correctness

```bash
# Run comprehensive verification
mysql -u root -p hdas_db < backend/src/main/resources/db/VERIFICATION_QUERIES.sql

# Output should show:
# ✓ No orphaned records
# ✓ All 6 roles present
# ✓ Admin user active
# ✓ Admin has ADMIN role
# ✓ Password hash valid (BCrypt strength 12)
# ✓ All unique constraints satisfied
```

---

## Phase 3: Application Testing

### Step 3.1: Configure Backend for Validation

**Update `application.properties` or `application-dev.yml`**:

```yaml
# Temporarily set to VALIDATE to verify schema matches JPA entities
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # Checks schema matches, no modifications
```

### Step 3.2: Start Backend with Validation

```bash
cd backend
mvn spring-boot:run

# Expected output:
# - No schema validation errors
# - "Initializing Spring Data JPA..." 
# - "Started Application in X.XXX seconds"
# - Login endpoint accessible at http://localhost:8080/api/auth/login
```

**If Validation Fails**, you'll see errors like:
```
ERROR: Wrong column type for column 'id' in table 'users'
```
⟹ Stop, check the verification queries output, and fix issues.

### Step 3.3: Test Authentication Flow

```bash
# 1. Test login endpoint
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Expected response:
# {
#   "success": true,
#   "message": "Login successful",
#   "data": {
#     "user": {...},
#     "roles": ["ADMIN"],
#     "authorities": ["ROLE_ADMIN"]
#   },
#   "timestamp": "..."
# }

# 2. Test /me endpoint (should require authentication)
curl -X GET http://localhost:8080/api/auth/me \
  -H "Cookie: JSESSIONID=..."  # From login response

# 3. Test role-based access
curl -X GET http://localhost:8080/api/admin/dashboard \
  -H "Cookie: JSESSIONID=..."
```

### Step 3.4: Test User Registration (Auto-assign CITIZEN Role)

```bash
# Register new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Verify CITIZEN role auto-assigned by checking database:
mysql -u root -p hdas_db -e "
SELECT u.username, r.name 
FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'testuser';
"
# Expected: testuser | CITIZEN
```

### Step 3.5: Set to Production Mode

```yaml
# Update application.properties
spring:
  jpa:
    hibernate:
      ddl-auto: none  # No modifications in production
```

---

## Verification Checklist

### Before Running Application

- [ ] Deleted `com.hdas.model.User.java`
- [ ] Deleted `com.hdas.model.Role.java`
- [ ] Deleted `com.hdas.model.Request.java`
- [ ] Deleted `com.hdas.model.AuditLog.java`
- [ ] Backend compiles: `mvn clean compile -q`
- [ ] No imports from `com.hdas.model` package
- [ ] Database backup created: `hdas_db_backup_*.sql`
- [ ] SCHEMA_CORRECTED.sql applied successfully
- [ ] CLEANUP_AND_SEED.sql executed (orphaned data removed)
- [ ] VERIFICATION_QUERIES.sql shows all checks passed

### After Backend Startup

- [ ] Backend starts without schema validation errors
- [ ] Login endpoint responds: `POST /api/auth/login`
- [ ] Admin login works: username=admin, password=admin123
- [ ] /me endpoint returns logged-in user
- [ ] Role-based endpoints work (admin can access /api/admin/*)
- [ ] New user registration auto-assigns CITIZEN role
- [ ] Database shows no orphaned records

### Production Pre-Flight

- [ ] `ddl-auto=none` configured
- [ ] All user passwords updated if needed (BCrypt strength 12)
- [ ] Roles reconciled with application requirements
- [ ] Feature flags configured (disabled by default)
- [ ] Audit logs empty (ready for production data)
- [ ] Backup of current database taken
- [ ] Rollback plan documented (use `hdas_db_backup_*.sql`)

---

## Troubleshooting

### Issue 1: "Wrong column type" Error During Validation

**Symptoms**: 
```
ERROR: Wrong column type for column 'X' in table 'Y'
```

**Solution**:
1. Run `VERIFICATION_QUERIES.sql` to identify the mismatch
2. Check entity definition in `com.hdas.domain.*`
3. Verify SQL column type matches JPA annotation
4. Update either schema or entity as needed
5. Re-run validation

### Issue 2: "No table or view named" Error

**Symptoms**:
```
ERROR: Could not create a lookup table named 'X'
```

**Solution**:
1. Run `VERIFICATION_QUERIES.sql` to check table existence
2. If table missing: Run SCHEMA_CORRECTED.sql
3. If table exists: Check entity mapping (may be wrong @Table name)
4. Update entity or schema to match

### Issue 3: Login Fails (Wrong Password)

**Symptoms**:
```
Error: Invalid credentials
```

**Possible Causes**:
- Password hash strength mismatch (schema has $2b$10$, backend uses $2a$12$)
- Admin password not updated from schema seed
- User deleted or deactivated

**Solution**:
1. Check admin password hash: 
   ```sql
   SELECT username, password_hash FROM users WHERE username = 'admin';
   ```
2. Verify hash starts with `$2a$12$` (not `$2b$10$`)
3. If wrong, update:
   ```sql
   UPDATE users SET password_hash = '$2a$12$rVJTUBaS9GDOO56q6zaPeO0/y/xH0mmeqox2BNh.WuWZK6HCvYpoi' WHERE username = 'admin';
   ```

### Issue 4: "Access Denied" on Role-Based Endpoints

**Symptoms**:
```
403 Forbidden - User does not have authority ROLE_ADMIN
```

**Possible Causes**:
- User doesn't have role assigned
- Role doesn't have permissions configured
- ROLE_ prefix not added during authentication

**Solution**:
1. Check user has role:
   ```sql
   SELECT u.username, r.name FROM user_roles ur
   JOIN users u ON ur.user_id = u.id
   JOIN roles r ON ur.role_id = r.id
   WHERE u.username = 'admin';
   ```
2. Verify role has permissions:
   ```sql
   SELECT permission FROM role_permissions WHERE role_id = (SELECT id FROM roles WHERE name = 'ADMIN');
   ```
3. Check UserDetailsServiceImpl adds ROLE_ prefix:
   - Look for: `.authorities(details.getRoles().stream().map(r -> "ROLE_" + r.getName())...)`

### Issue 5: Orphaned Data Prevents Constraint Violations

**Symptoms**:
```
ERROR: Cannot delete parent row: a foreign key constraint fails
```

**Solution**:
1. Run `CLEANUP_AND_SEED.sql` to remove orphaned data
2. If still failing, check which table has orphaned rows:
   ```sql
   SELECT * FROM [table_name] WHERE [fk_column] NOT IN (SELECT id FROM [referenced_table]);
   ```
3. Manually delete or update orphaned rows
4. Re-run cleanup script

---

## Files Reference

| File | Purpose | Location |
|------|---------|----------|
| SCHEMA_AUDIT_FINDINGS.md | Complete audit report | docs/ |
| SCHEMA_CORRECTED.sql | Corrected schema (no duplicates) | backend/src/main/resources/db/ |
| CLEANUP_AND_SEED.sql | Idempotent cleanup & seed script | backend/src/main/resources/db/ |
| VERIFICATION_QUERIES.sql | Comprehensive verification queries | backend/src/main/resources/db/ |

---

## Entity Package Reference

### Use ONLY `com.hdas.domain.*` Packages
- ✅ `com.hdas.domain.user.User` → users table
- ✅ `com.hdas.domain.user.Role` → roles table
- ✅ `com.hdas.domain.request.Request` → requests table
- ✅ `com.hdas.domain.process.Process` → processes table
- ✅ `com.hdas.domain.process.ProcessStep` → process_steps table
- ✅ `com.hdas.domain.delay.Delay` → delays table
- ✅ `com.hdas.domain.assignment.Assignment` → assignments table
- ✅ `com.hdas.domain.accountability.Delegation` → delegations table
- ✅ `com.hdas.domain.accountability.DelayDebtScore` → delay_debt_scores table
- ✅ `com.hdas.domain.escalation.EscalationRule` → escalation_rules table
- ✅ `com.hdas.domain.escalation.EscalationHistory` → escalation_history table
- ✅ `com.hdas.domain.sla.SLA` → slas table
- ✅ `com.hdas.domain.compliance.DelayJustification` → delay_justifications table

### DELETE IMMEDIATELY (Obsolete)
- ❌ `com.hdas.model.User` - Outdated, conflicts with domain.user.User
- ❌ `com.hdas.model.Role` - Outdated, conflicts with domain.user.Role
- ❌ `com.hdas.model.Request` - Outdated, conflicts with domain.request.Request
- ❌ `com.hdas.model.AuditLog` - Outdated, uses different ID strategy

---

## Rollback Plan

If issues occur during deployment:

```bash
# 1. Restore backup database
mysql -u root -p < hdas_db_backup_YYYYMMDD_HHMMSS.sql

# 2. Revert code changes
git revert HEAD~N  # Or git reset --hard HEAD~N

# 3. Check git log for issues
git log --oneline | head -10

# 4. Restart application with old code
mvn clean spring-boot:run
```

---

## Success Criteria

✅ **Phase 1 Passed** when:
- No `com.hdas.model.*` files exist
- Backend compiles successfully
- No compilation errors

✅ **Phase 2 Passed** when:
- Database backup exists
- All verification queries show "OK" or "PASSED"
- No orphaned data detected
- Admin user has correct password hash

✅ **Phase 3 Passed** when:
- Backend starts with `ddl-auto=validate`
- Admin login works (username=admin, password=admin123)
- New users auto-assigned CITIZEN role
- Role-based access control works

---

## Next Steps After Schema Cleanup

1. **Frontend Debugging**: Fix JSX syntax error in `citizen/requests/page.tsx`
2. **Testing**: Run integration tests with clean schema
3. **Deployment**: Use corrected schema for staging/production databases
4. **Monitoring**: Log authentication successes/failures for 24 hours
5. **Cleanup**: Archive old schema files, keep `SCHEMA_CORRECTED.sql` as reference

---

## Questions & Support

### What if I need to add a new column?

1. Add field to JPA entity with `@Column` annotation
2. Create Flyway migration file: `V4__add_new_column.sql`
3. Set `ddl-auto=validate` to verify schema matches
4. Deploy and test

### What if I need to change a column type?

1. Update JPA entity field type
2. Create Flyway migration: `V4__change_column_type.sql`
3. Use `ALTER TABLE` with caution (may require data migration)
4. Test with `ddl-auto=validate`

### Can I use a different password for admin?

Yes, but ensure it's BCrypt hashed with strength 12:

```bash
# Using online tool or command-line:
# echo -n "newpassword" | bcrypt -c 12

# Then update database:
UPDATE users SET password_hash = '$2a$12$...' WHERE username = 'admin';
```

---

**Last Updated**: Post-Security Refactoring  
**Status**: Ready for Phase 1 Implementation  
**Owner**: Database/JPA Architecture Team

