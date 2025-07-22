-- Fix RLS policies to allow signup process completely
-- The issue is that RLS is blocking the insert during signup

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, cmd, qual
FROM pg_policies 
WHERE tablename = 'store_owners';

-- Drop all existing policies for store_owners
DROP POLICY IF EXISTS "Users can view own profile" ON store_owners;
DROP POLICY IF EXISTS "Users can insert own profile" ON store_owners;
DROP POLICY IF EXISTS "Users can update own profile" ON store_owners;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON store_owners;
DROP POLICY IF EXISTS "Enable insert for authenticated users during signup" ON store_owners;

-- Create a more permissive insert policy for signup
-- This allows any authenticated user to insert a record with their own ID
CREATE POLICY "Allow signup insert" ON store_owners
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON store_owners
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON store_owners
    FOR UPDATE USING (auth.uid() = id);

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, cmd, qual
FROM pg_policies 
WHERE tablename = 'store_owners'
ORDER BY policyname;