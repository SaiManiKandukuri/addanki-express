-- ============================================
-- Addanki Express — Supabase Schema Migration
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- 1. Merchants
CREATE TABLE IF NOT EXISTS merchants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5.0,
  delivery_time TEXT NOT NULL DEFAULT '15 mins',
  is_offline BOOLEAN NOT NULL DEFAULT false,
  credentials TEXT
);

-- 2. Agents
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT true,
  phone TEXT NOT NULL,
  credentials TEXT
);

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  mrp INTEGER,
  category TEXT NOT NULL CHECK (category IN ('Milk', 'Meat', 'Veggies', 'Kirana', 'Snacks')),
  in_stock BOOLEAN NOT NULL DEFAULT true,
  photo_url TEXT,
  description TEXT
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]',
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'DENIED')),
  customer_landmark TEXT NOT NULL DEFAULT '',
  customer_address TEXT NOT NULL DEFAULT '',
  delivery_otp TEXT NOT NULL DEFAULT '',
  extra_stop_surcharge INTEGER NOT NULL DEFAULT 0,
  merchant_ids TEXT[] NOT NULL DEFAULT '{}',
  agent_id TEXT,
  agent_status TEXT CHECK (agent_status IN ('PENDING', 'ACCEPTED')),
  agent_assigned_at BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Banners
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  photo_url TEXT NOT NULL
);

-- 6. Customer Profiles
CREATE TABLE IF NOT EXISTS customer_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  delivery_address TEXT NOT NULL DEFAULT ''
);

-- ============================================
-- Disable RLS for all tables (simple setup)
-- ============================================
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to merchants" ON merchants FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to agents" ON agents FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to products" ON products FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to banners" ON banners FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to customer_profiles" ON customer_profiles FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Seed Data
-- ============================================

-- Merchants
INSERT INTO merchants (id, name, rating, delivery_time, is_offline, credentials) VALUES
  ('m1', 'Sangam Dairy', 4.8, '10 mins', false, 'pass_sangam'),
  ('m2', 'Sri Rama Supermarket', 4.5, '15 mins', false, 'pass_srirama'),
  ('m3', 'Kanna Meat Mart', 4.7, '20 mins', false, 'pass_kanna')
ON CONFLICT (id) DO NOTHING;

-- Agents
INSERT INTO agents (id, name, is_online, phone, credentials) VALUES
  ('a1', 'Raju G.', true, '9876500001', 'pass_raju'),
  ('a2', 'Subbu K.', true, '9876500002', 'pass_subbu'),
  ('a3', 'Venkat', false, '9876500003', 'pass_venkat')
ON CONFLICT (id) DO NOTHING;

-- Products
INSERT INTO products (id, merchant_id, name, price, mrp, category, in_stock, description) VALUES
  ('p1', 'm1', 'Fresh Milk (1L)', 60, 75, 'Milk', true, 'Daily fresh cow milk.'),
  ('p4', 'm1', 'Paneer (200g)', 90, 110, 'Milk', true, NULL),
  ('p2', 'm2', 'Toor Dal (1kg)', 160, 190, 'Kirana', true, NULL),
  ('p6', 'm2', 'Lays Magic Masala', 20, 20, 'Snacks', true, NULL),
  ('p8', 'm3', 'Tender Chicken (1kg)', 280, 320, 'Meat', true, NULL)
ON CONFLICT (id) DO NOTHING;

-- Default Customer Profile
INSERT INTO customer_profiles (id, name, phone, email, delivery_address) VALUES
  ('c1', 'Sai Mani Kandukuri', '9346701988', 'saimani@example.com', 'RTC Bus Stand, Addanki')
ON CONFLICT (id) DO NOTHING;
