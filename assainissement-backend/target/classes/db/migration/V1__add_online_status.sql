-- Run this SQL script to add the online status columns to the users table
-- Connect to PostgreSQL and run against assainissement_db

-- Add online column with default value
ALTER TABLE users ADD COLUMN IF NOT EXISTS online BOOLEAN DEFAULT false;
UPDATE users SET online = false WHERE online IS NULL;
ALTER TABLE users ALTER COLUMN online SET NOT NULL;

-- Add last_seen_at column
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP;

-- Verify columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('online', 'last_seen_at');
