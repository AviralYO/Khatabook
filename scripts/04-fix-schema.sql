-- Remove the password_hash column since we're using Supabase Auth
ALTER TABLE store_owners DROP COLUMN IF EXISTS password_hash;

-- Make sure the table structure is correct
-- The store_owners table should only have these columns:
-- id (UUID, references auth.users)
-- email (VARCHAR)
-- store_name (VARCHAR)
-- owner_name (VARCHAR)
-- phone (VARCHAR)
-- address (TEXT)
-- created_at (TIMESTAMP)
-- updated_at (TIMESTAMP)

-- Update the table to ensure proper structure
ALTER TABLE store_owners 
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Create or replace the updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_store_owners_updated_at ON store_owners;
CREATE TRIGGER update_store_owners_updated_at
    BEFORE UPDATE ON store_owners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
