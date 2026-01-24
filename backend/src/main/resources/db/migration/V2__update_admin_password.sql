-- Update admin user password hash to match "admin123"
UPDATE users 
SET password_hash = '$2a$10$S3dnYfypZ/coG1WbPz77F.EJswZO1NvF33S.oIs6I48iRTj3rZ4se'
WHERE username = 'admin';
