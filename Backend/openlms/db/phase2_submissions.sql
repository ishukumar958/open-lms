ALTER TABLE submissions
  ADD COLUMN submission_text TEXT NULL,
  ADD COLUMN file_url VARCHAR(500) NULL,
  ADD COLUMN feedback TEXT NULL,
  ADD COLUMN submitted_at DATETIME NULL,
  ADD COLUMN graded_at DATETIME NULL;
ALTER TABLE submissions ALTER COLUMN status SET DEFAULT 'SUBMITTED';
UPDATE submissions SET status = 'SUBMITTED' WHERE status = 'Submitted';
