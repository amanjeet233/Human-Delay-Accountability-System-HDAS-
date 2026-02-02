# HDAS Authentication Setup

## Default Admin Credentials

**⚠️ SECURITY WARNING**: Change these credentials immediately in production!

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123` (can be overridden with `HDAS_ADMIN_PASSWORD` environment variable)
- **Email**: `admin@hdas.local`

### Configuration

The admin user is automatically created on first startup with the following attributes:
- `active`: `true`
- `status`: `ACTIVE`
- `mustChangePassword`: `false`
- Role: `ADMIN`
- Password: BCrypt hashed with strength 12

### Environment Variables

To set a custom admin password, set the environment variable before starting the application:

```bash
export HDAS_ADMIN_PASSWORD="YourSecurePassword123!"
java -jar human-delay-accountability-system-1.0.0.jar
```

## Authentication Logging

The application includes enhanced authentication logging with:

1. **Correlation IDs**: Each login attempt gets a unique 8-character correlation ID for tracking
2. **Success Indicators**: 
   - ✓ for successful logins
   - ✗ for failed attempts
3. **Detailed Error Logging**: Different log messages for:
   - User not found
   - Invalid password
   - Inactive accounts
   - Missing roles

### Example Log Output

```
[149bdfba] ✓ Login successful for user: admin with role: ADMIN
[e0511a76] ✗ Login failed - User not found or account inactive: wronguser
[47e06317] ✗ Login failed - Invalid credentials for user: admin
```

## CORS Configuration

The backend is configured to accept requests from the following origins:
- `http://localhost:3000` (React default)
- `http://localhost:3001` (Alternative React port)
- `http://localhost:5173` (Vite default)
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`
- `http://127.0.0.1:5173`

All origins allow:
- Methods: GET, POST, PUT, DELETE, OPTIONS
- Headers: All (*)
- Credentials: Enabled

## Database Setup

### Required Tables

The application requires the following database schema. Run the provided SQL scripts in this order:

1. `src/main/resources/db/SCHEMA_CORRECTED.sql` or `src/main/resources/db/schema.sql`
2. Add `must_change_password` column if missing:
   ```sql
   ALTER TABLE users 
   ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 1 AFTER active;
   ```

### Manual Database Setup

If Flyway migrations are disabled (as they currently are), manually run:

```bash
mysql -u root -p hdas < src/main/resources/db/schema.sql
mysql -u root -p hdas < src/main/resources/db/CLEANUP_AND_SEED.sql
```

## Security Considerations

1. **Never log passwords**: The logging system never logs passwords or password hashes
2. **Generic error messages**: API responses return generic errors to avoid user enumeration
3. **Server-side logging only**: Detailed diagnostics are logged server-side only
4. **BCrypt strength**: All passwords are hashed with BCrypt strength 12
5. **Session-based authentication**: Uses secure session cookies

## Testing Authentication

### Health Check
```bash
curl http://localhost:8080/api/auth/health
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt
```

### Check Current User
```bash
curl http://localhost:8080/api/auth/me \
  -b cookies.txt
```

### Logout
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -b cookies.txt
```

## Troubleshooting

### Login fails with "User not found"
- Check that the admin user exists in the database
- Verify the user is active and status is ACTIVE
- Check that the user has roles assigned

### CORS errors
- Verify your frontend is running on one of the allowed origins
- Check browser console for specific CORS error messages
- Ensure the backend is running on port 8080

### Database connection issues
- Verify MySQL is running
- Check connection details in `application.yml`
- Ensure the `hdas` database exists
- Verify database user credentials

## Java Version

The application requires **Java 17**. 

Note: The project was originally configured for Java 21 but has been downgraded to Java 17 for broader compatibility. If you encounter compatibility issues, ensure you're using Java 17.0.x:

```bash
java -version
# Should show: openjdk version "17.0.x"
```
