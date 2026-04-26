-- Addanki Mart Feature Migration
-- Run this in Supabase SQL Editor

-- 1. Add blocked field to customer_profiles
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false;

-- 2. Expand order status options to include CANCELLED and RETURN_REQUESTED
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('PENDING','PREPARING','READY_FOR_PICKUP','OUT_FOR_DELIVERY','DELIVERED','DENIED','CANCELLED','RETURN_REQUESTED'));

-- 3. Enable RLS policies for the new column
-- (if you had existing policies, they should still work since is_blocked is just a column)
