// HARDCODED ADMIN CREDENTIALS CONFIGURATION
// Location: com/hdas/service/AuthService.java
// Do NOT store in database - keep only in code

package com.hdas.config;

/**
 * HDAS System Admin Credentials
 * These credentials are hardcoded in the AuthService class
 * They are NOT stored in the database
 * 
 * USAGE:
 * Username: admin
 * Password: admin123
 * Email: admin@hdas.local
 * 
 * SECURITY NOTE:
 * - These are development/bootstrap credentials
 * - Change them in code before production deployment
 * - Location: AuthService.java (lines 27-29)
 * - Do NOT add to database
 * - Do NOT commit sensitive production passwords
 * 
 * HOW IT WORKS:
 * 1. User attempts login with credentials
 * 2. AuthService checks hardcoded admin credentials FIRST
 * 3. If matched, system admin access granted
 * 4. If not matched, checks database users
 * 5. Returns isSystemAdmin=true for hardcoded admin
 * 
 * CHANGING CREDENTIALS:
 * Edit AuthService.java lines:
 * - Line 27: HARDCODED_ADMIN_USERNAME = "admin"
 * - Line 28: HARDCODED_ADMIN_PASSWORD = "admin123"
 * - Line 29: HARDCODED_ADMIN_EMAIL = "admin@hdas.local"
 */

public class AdminCredentialsConfig {
    
    // Bootstrap credentials (DO NOT PUT IN DATABASE)
    public static final String ADMIN_USERNAME = "admin";
    public static final String ADMIN_PASSWORD = "admin123";
    public static final String ADMIN_EMAIL = "admin@hdas.local";
    
    /**
     * CONFIGURATION STEPS:
     * 
     * 1. REMOVE from database.sql:
     *    - Delete the INSERT statement that creates admin user in database
     *    - The admin user should NOT exist in the users table
     * 
     * 2. KEEP in AuthService.java:
     *    - Hardcoded credentials are checked first
     *    - This is the bootstrap/fallback authentication
     * 
     * 3. DURING DEVELOPMENT:
     *    - Use these credentials to access the system
     *    - Create other users in database as needed
     *    - Other users will be authenticated against database
     * 
     * 4. FOR PRODUCTION:
     *    - Change the hardcoded password to something secure
     *    - Do NOT commit actual passwords to git
     *    - Use environment variables or config server
     * 
     * 5. FLOW:
     *    User Login
     *      ↓
     *    Check Hardcoded Admin Credentials (AuthService)
     *      ↓
     *    If matched → Generate token & return (isSystemAdmin=true)
     *    If NOT matched → Check Database Users
     *      ↓
     *    Database Authentication (Spring Security)
     *      ↓
     *    Return token & roles (isSystemAdmin=false)
     */
}
