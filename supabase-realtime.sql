-- ============================================
-- Enable Supabase Realtime on all tables
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Add all tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE merchants;
ALTER PUBLICATION supabase_realtime ADD TABLE agents;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE banners;
ALTER PUBLICATION supabase_realtime ADD TABLE customer_profiles;

-- Set REPLICA IDENTITY to FULL so UPDATE/DELETE events include full row data
ALTER TABLE merchants REPLICA IDENTITY FULL;
ALTER TABLE agents REPLICA IDENTITY FULL;
ALTER TABLE products REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE banners REPLICA IDENTITY FULL;
ALTER TABLE customer_profiles REPLICA IDENTITY FULL;
