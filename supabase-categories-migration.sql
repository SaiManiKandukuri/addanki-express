-- ============================================
-- Categories & Sections Migration (UPDATED)
-- ============================================

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  photo_url TEXT,
  display_order INTEGER DEFAULT 0,
  product_ids TEXT[] DEFAULT '{}',
  type TEXT DEFAULT 'section', -- 'section' (Admin) or 'category' (Merchant)
  merchant_id TEXT, -- Null for global admin sections
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Realtime
-- Use DO block to avoid error if already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE categories;
  END IF;
END $$;

ALTER TABLE categories REPLICA IDENTITY FULL;

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access (Select)
DROP POLICY IF EXISTS "Allow public read access" ON categories;
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);

-- Allow all access for now (Development/Insert/Update)
DROP POLICY IF EXISTS "Allow all access" ON categories;
CREATE POLICY "Allow all access" ON categories FOR ALL USING (true) WITH CHECK (true);
