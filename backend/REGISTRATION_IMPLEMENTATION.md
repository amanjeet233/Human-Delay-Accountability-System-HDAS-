# Citizen Self-Registration Implementation

## Overview
Implemented citizen self-registration endpoint that creates new user accounts with PENDING status requiring admin approval.

## API Endpoint

### POST /api/auth/register

**Request Body:**
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201 Created):**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "role": "CITIZEN"
}
```

**Error Responses:**
- `400 Bad Request` - Missing or invalid fields
- `409 Conflict` - Username or email already exists

## Implementation Details

### User Status Flow
1. **Registration**: User created with `active=false` and `status=PENDING`
2. **Admin Approval**: Admin changes `active=true` and `status=ACTIVE`
3. **Login**: Only users with `active=true` can authenticate

### Security Features
- ✅ Password encrypted with BCrypt
- ✅ Duplicate username/email validation
- ✅ Auto-assigned CITIZEN role only
- ✅ No auto-login after registration
- ✅ Active status check in UserDetailsService

### Files Modified

1. **UserStatus.java** (NEW)
   - Enum: PENDING, ACTIVE, SUSPENDED, DELETED

2. **User.java**
   - Added `status` field (UserStatus enum)

3. **AuthController.java**
   - Updated register endpoint: `active=false`, `status=PENDING`

4. **V2__add_user_status.sql** (NEW)
   - Migration script for existing databases

### Database Changes

```sql
ALTER TABLE users 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
```

## Testing

### Test Registration
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Expected Behavior
1. User registered successfully (201)
2. User **cannot** login (account disabled)
3. Admin must activate user before login is possible

## Admin Approval Workflow

To activate a pending user:
```sql
UPDATE users 
SET active = TRUE, status = 'ACTIVE' 
WHERE username = 'testuser';
```

Or via Admin API (if implemented):
```bash
PUT /api/admin/users/{id}/status
{
  "active": true
}
```

## Notes
- Existing login flow remains unchanged
- No breaking changes to current users
- Database migration script provided for manual execution
- JPA will auto-create status column on next startup
