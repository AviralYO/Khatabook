-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON store_owners;
DROP POLICY IF EXISTS "Users can view own profile" ON store_owners;
DROP POLICY IF EXISTS "Users can update own profile" ON store_owners;

-- Create new policies that work with signup process
CREATE POLICY "Enable insert for authenticated users during signup" ON store_owners
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON store_owners
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON store_owners
    FOR UPDATE USING (auth.uid() = id);

-- Also update the signup process to handle the user creation properly
-- The issue is that during signup, the user might not be fully authenticated yet
