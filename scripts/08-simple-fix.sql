-- Simple fix - just remove password_hash column if it exists
ALTER TABLE store_owners DROP COLUMN IF EXISTS password_hash;

-- Check what columns actually exist in the table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'store_owners'
ORDER BY ordinal_position;
