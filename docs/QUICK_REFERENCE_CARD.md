# Schema Audit & JPA Mapping - Quick Reference Card

**Status**: 🔴 CRITICAL ISSUES FOUND - Ready for Phase 1-3 Cleanup  
**Estimated Duration**: 4-7 hours total (1-2 Phase 1, 2-3 Phase 2, 1-2 Phase 3)

---

## 🚨 Critical Issues Summary

| # | Issue | Severity | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | Duplicate entities (model vs domain) | 🔴 CRITICAL | JPA ambiguity, validation fail | Delete model package |
| 2 | Duplicate escalation_history table | 🔴 CRITICAL | Incomplete schema | Remove line 462-469 |
| 3 | Password hash strength (10 vs 12) | 🟡 HIGH | Login fails with schema seed | Update hash to $2a$12$ |
| 4 | Unmapped entities | 🟡 HIGH | Validation errors | Use domain package only |
| 5 | Potential orphaned data | 🟡 MEDIUM | FK constraint errors | Run cleanup script |

---

## 📋 Phase 1: Code Cleanup (1-2 hours)

### Delete These Files
```bash
rm backend/src/main/java/com/hdas/model/User.java
rm backend/src/main/java/com/hdas/model/Role.java
rm backend/src/main/java/com/hdas/model/Request.java
rm backend/src/main/java/com/hdas/model/AuditLog.java
```

### Verify
```bash
# Should return EMPTY (no results)
grep -r "import com.hdas.model" backend/src --include="*.java"

# Should compile successfully
mvn clean compile -q
```

### ✅ Success When
- [ ] All model package files deleted
- [ ] No remaining imports from com.hdas.model
- [ ] Backend compiles without errors

---

## 🗄️ Phase 2: Database Cleanup (2-3 hours)

### Step 1: Backup
```bash
mysqldump -u root -p hdas_db > hdas_db_backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Apply Corrected Schema
```bash
mysql -u root -p < backend/src/main/resources/db/SCHEMA_CORRECTED.sql
```

### Step 3: Clean & Seed
```bash
mysql -u root -p hdas_db < backend/src/main/resources/db/CLEANUP_AND_SEED.sql
```

### Step 4: Verify
```bash
mysql -u root -p hdas_db < backend/src/main/resources/db/VERIFICATION_QUERIES.sql
# Should show: ✓ No orphaned records, ✓ All 6 roles, ✓ Admin user, etc.
```

### ✅ Success When
- [ ] Database backup exists
- [ ] SCHEMA_CORRECTED.sql applied
- [ ] All orphaned data removed
- [ ] Verification queries pass

---

## 🔧 Phase 3: Application Testing (1-2 hours)

### Step 1: Configure Validation Mode
```yaml
# application-dev.yml
spring:
  jpa:
    hibernate:
      ddl-auto: validate  # Temporary testing
```

### Step 2: Start Backend
```bash
cd backend
mvn spring-boot:run
# Expected: No schema validation errors
```

### Step 3: Test Authentication
```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
# Expected: {"success":true, "data":{...}}

# Check user info
curl -X GET http://localhost:8080/api/auth/me -H "Cookie: JSESSIONID=..."
```

### Step 4: Test Role Assignment
```bash
# In database, verify new user gets CITIZEN role
mysql -u root -p hdas_db -e "
SELECT u.username, r.name FROM user_roles ur
JOIN users u ON ur.user_id = u.id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'testuser';
"
# Expected: testuser | CITIZEN
```

### Step 5: Production Mode
```yaml
# application.yml
spring:
  jpa:
    hibernate:
      ddl-auto: none  # Production setting
```

### ✅ Success When
- [ ] Backend starts without validation errors
- [ ] Admin login works (admin/admin123)
- [ ] /api/auth/me returns user info
- [ ] New users get CITIZEN role
- [ ] Role-based endpoints work
- [ ] ddl-auto=none configured

---

## 📊 Database Status Check

### Core Tables ✅
- users (id, username, email, password_hash, ...)
- roles (id, name, description, ...)
- user_roles (user_id, role_id)
- role_permissions (role_id, permission)
- processes, process_steps, requests, assignments
- delays, delay_justifications
- escalation_rules, escalation_history
- delegations, delay_debt_scores

### Default Roles (6 Total)
1. ADMIN → Full access
2. AUDITOR → Audit reports
3. HOD → Final approval
4. SECTION_OFFICER → Review
5. CLERK → Verification
6. CITIZEN → Create requests

### Admin User
- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`
- Email: `admin@hdas.local`
- Status: Active ✅

---

## 🚀 Quick Command Reference

```bash
# Full automated cleanup (requires manual database backup first!)
# Step 1: Backup
mysqldump -u root -p hdas_db > backup.sql

# Step 2: Schema
mysql -u root -p < backend/src/main/resources/db/SCHEMA_CORRECTED.sql

# Step 3: Cleanup & Seed
mysql -u root -p hdas_db < backend/src/main/resources/db/CLEANUP_AND_SEED.sql

# Step 4: Verify
mysql -u root -p hdas_db < backend/src/main/resources/db/VERIFICATION_QUERIES.sql

# Step 5: Code
rm backend/src/main/java/com/hdas/model/{User,Role,Request,AuditLog}.java
mvn clean compile -q

# Step 6: Test
mvn spring-boot:run
```

---

## 🆘 Common Issues & Quick Fixes

### ❌ "Wrong column type" Error
```
1. Check: SELECT * FROM VERIFICATION_QUERIES.sql output
2. Find: Mismatched column between schema and entity
3. Fix: Update either entity or schema to match
4. Retry: ddl-auto=validate
```

### ❌ Login Fails
```sql
-- Verify password hash is correct
SELECT username, password_hash FROM users WHERE username = 'admin';
-- Should start with: $2a$12$

-- If wrong, update it:
UPDATE users SET password_hash = '$2a$12$rVJTUBaS9GDOO56q6zaPeO0/y/xH0mmeqox2BNh.WuWZK6HCvYpoi' WHERE username = 'admin';
```

### ❌ "Foreign key constraint fails"
```sql
-- Find orphaned data
DELETE FROM user_roles WHERE user_id NOT IN (SELECT id FROM users);
DELETE FROM assignments WHERE request_id NOT IN (SELECT id FROM requests);

-- Or run full cleanup
SOURCE backend/src/main/resources/db/CLEANUP_AND_SEED.sql;
```

### ❌ "Duplicate entry" on unique column
```sql
-- Check for duplicates
SELECT username, COUNT(*) FROM users GROUP BY username HAVING COUNT(*) > 1;

-- Remove duplicates (keep first, delete rest)
DELETE u1 FROM users u1
JOIN users u2 ON u1.username = u2.username AND u1.id > u2.id;
```

---

## 📚 Document Map

| Need | Read This |
|------|-----------|
| Overview | SCHEMA_AUDIT_EXECUTIVE_SUMMARY.md (5 min) |
| Details | SCHEMA_AUDIT_FINDINGS.md (30 min) |
| Steps | SCHEMA_CLEANUP_IMPLEMENTATION_GUIDE.md (45 min) |
| Status | SCHEMA_AUDIT_DELIVERABLES.md (10 min) |
| Queries | VERIFICATION_QUERIES.sql (reference) |
| Schema | SCHEMA_CORRECTED.sql (reference) |
| Cleanup | CLEANUP_AND_SEED.sql (reference) |

---

## ✅ Pre-Implementation Checklist

Before starting Phase 1:
- [ ] Read SCHEMA_AUDIT_EXECUTIVE_SUMMARY.md
- [ ] Got approval from project manager
- [ ] Created database backup location
- [ ] Have MySQL/MariaDB access
- [ ] Have backend source code access
- [ ] Team notified of 4-7 hour maintenance window

---

## 📞 Troubleshooting Flowchart

```
Start → Phase 1: Delete model files
    ↓
    • Compile error? → Check deletion was complete
    ↓
    • Imports still exist? → grep -r "com.hdas.model" and remove
    ↓
    ✓ Compiles → Phase 2: Apply schema
    ↓
    • MySQL error? → Check syntax in SCHEMA_CORRECTED.sql
    ↓
    ✓ Schema applied → Run CLEANUP_AND_SEED.sql
    ↓
    • Orphan errors? → Run verification to find issues
    ↓
    ✓ Cleanup done → Run VERIFICATION_QUERIES.sql
    ↓
    • Checks failed? → Address issues found, restart phase 2
    ↓
    ✓ All passed → Phase 3: Start backend
    ↓
    • Validation error? → Check error message, fix entity or schema
    ↓
    • Boot error? → Check application logs for details
    ↓
    • Login fails? → Check password hash in users table
    ↓
    ✓ All working → Set ddl-auto=none and deploy
```

---

## 🎯 Success Criteria (Must Have All ✅)

- [ ] ✅ No `com.hdas.model` imports in codebase
- [ ] ✅ Backend compiles with `mvn clean compile`
- [ ] ✅ Database backup exists
- [ ] ✅ SCHEMA_CORRECTED.sql applied successfully
- [ ] ✅ All orphaned data removed
- [ ] ✅ VERIFICATION_QUERIES.sql passes all checks
- [ ] ✅ Backend starts with `ddl-auto=validate`
- [ ] ✅ Admin login works with correct password
- [ ] ✅ New users auto-assigned CITIZEN role
- [ ] ✅ Role-based access control enforced
- [ ] ✅ `ddl-auto=none` set for production

---

## ⏱️ Time Estimates

| Phase | Task | Time |
|-------|------|------|
| Phase 1 | Delete model files | 5 min |
| Phase 1 | Audit imports | 5 min |
| Phase 1 | Verify compile | 5 min |
| Phase 2 | Backup database | 5 min |
| Phase 2 | Apply schema | 10 min |
| Phase 2 | Run cleanup | 5 min |
| Phase 2 | Verify correctness | 10 min |
| Phase 3 | Configure validation | 5 min |
| Phase 3 | Start backend | 10 min |
| Phase 3 | Test authentication | 10 min |
| Phase 3 | Test role assignment | 10 min |
| Phase 3 | Configure production | 5 min |
| **Total** | **All phases** | **4-7 hours** |

---

**Quick Start**: Read SCHEMA_AUDIT_EXECUTIVE_SUMMARY.md first (5 minutes), then follow Phase 1-3 steps above.

**Blocked Until Complete**: Database schema cannot be deployed to production without Phase 1-3 completion.

**Risk Level**: LOW (fully reversible with database backup)

**Support**: All documents available in docs/ folder. Common issues documented in implementation guide.

