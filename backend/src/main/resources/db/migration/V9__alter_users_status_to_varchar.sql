-- Normalize users.status to VARCHAR to match JPA EnumType.STRING mapping
-- Ensure consistent values and avoid enum type mismatches

-- Convert column type to VARCHAR(20)
ALTER TABLE users
  MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

-- Normalize existing values to uppercase to match application enum values
UPDATE users SET status = UPPER(status);

-- Optional: set explicit default for future inserts
-- Default handled via MODIFY COLUMN above for MySQL compatibility
