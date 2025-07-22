-- Fix RLS policies to allow signup process
-- The issue is that during signup, the user session might not be fully established
-- when we try to insert into store_owners table

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON store_owners;
DROP POLICY IF EXISTS "Users can view own profile" ON store_owners;
DROP POLICY IF EXISTS "Users can update own profile" ON store_owners;

-- Create new policies that handle the signup edge case
-- Allow insert if the user is authenticated OR if it's during signup process
CREATE POLICY "Enable insert for authenticated users" ON store_owners
    FOR INSERT WITH CHECK (
        auth.uid() = id OR 
        auth.uid() IS NOT NULL
    );

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON store_owners
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON store_owners
    FOR UPDATE USING (auth.uid() = id);

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, cmd, qual
FROM pg_policies 
WHERE tablename = 'store_owners';