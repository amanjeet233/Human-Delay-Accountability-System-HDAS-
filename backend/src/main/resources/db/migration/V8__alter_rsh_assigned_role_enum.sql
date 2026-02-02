-- Ensure request_status_history.assigned_role is ENUM to match Hibernate enum mapping
-- Idempotent in MySQL: MODIFY to same ENUM has no adverse effect
ALTER TABLE request_status_history
  MODIFY COLUMN assigned_role VARCHAR(20) NOT NULL;