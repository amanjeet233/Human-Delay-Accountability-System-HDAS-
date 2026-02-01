-- Add delay_days and responsible_role columns to delays table
ALTER TABLE delays
  ADD COLUMN delay_days INT NOT NULL DEFAULT 0,
  ADD COLUMN responsible_role VARCHAR(100) NULL;