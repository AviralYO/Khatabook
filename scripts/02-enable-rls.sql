-- Enable Row Level Security
ALTER TABLE store_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for store_owners
CREATE POLICY "Users can view own profile" ON store_owners
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON store_owners
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON store_owners
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for customers
CREATE POLICY "Users can view own customers" ON customers
    FOR SELECT USING (auth.uid() = store_owner_id);

CREATE POLICY "Users can insert own customers" ON customers
    FOR INSERT WITH CHECK (auth.uid() = store_owner_id);

CREATE POLICY "Users can update own customers" ON customers
    FOR UPDATE USING (auth.uid() = store_owner_id);

CREATE POLICY "Users can delete own customers" ON customers
    FOR DELETE USING (auth.uid() = store_owner_id);

-- Create policies for transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = store_owner_id);

CREATE POLICY "Users can insert own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = store_owner_id);

CREATE POLICY "Users can update own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = store_owner_id);

CREATE POLICY "Users can delete own transactions" ON transactions
    FOR DELETE USING (auth.uid() = store_owner_id);
