-- ============================================
-- Verify & Fix RLS for Realtime
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if tables are in realtime publication
SELECT * FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';

-- Check replica identity
SELECT relname, relreplident
FROM pg_class
WHERE relname IN ('merchants', 'agents', 'products', 'orders', 'banners', 'customer_profiles');
-- 'f' = FULL (correct), 'd' = DEFAULT (needs fix)
