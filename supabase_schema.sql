-- ==========================================================
-- SIRI — LIVING CINEMATIC BIRTHDAY DATABASE SCHEMA (SUPABASE)
-- Free-Tier Optimized PostgreSQL Schema with Row Level Security
-- ==========================================================

-- 1. Create Tithi Dates Table
CREATE TABLE IF NOT EXISTS public.tithi_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER UNIQUE NOT NULL,
    date TEXT NOT NULL,
    tithi_name TEXT NOT NULL DEFAULT 'Ashwayuja Shukla Tritiya',
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'unpublished')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast year lookups
CREATE INDEX IF NOT EXISTS idx_tithi_dates_year ON public.tithi_dates(year);
CREATE INDEX IF NOT EXISTS idx_tithi_dates_status ON public.tithi_dates(status);

-- 2. Create Email Logs Table (Deduplication Engine)
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year INTEGER NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('birthday', 'tithi', 'test')),
    scheduled_date TEXT NOT NULL,
    recipient TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL CHECK (status IN ('SENT', 'SIMULATED', 'FAILED', 'SKIPPED_DUPLICATE', 'SCHEDULED')),
    subject TEXT,
    error TEXT
);

CREATE INDEX IF NOT EXISTS idx_email_logs_year_event ON public.email_logs(year, event_type);

-- 3. Create App Settings Table
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

ALTER TABLE public.tithi_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Tithi Dates RLS Policies:
-- Public can READ published dates only
DROP POLICY IF EXISTS "Public can view published tithi dates" ON public.tithi_dates;
CREATE POLICY "Public can view published tithi dates"
    ON public.tithi_dates
    FOR SELECT
    TO anon, authenticated
    USING (status = 'published');

-- Authenticated Admin can perform full CRUD on tithi dates
DROP POLICY IF EXISTS "Admin full access on tithi dates" ON public.tithi_dates;
CREATE POLICY "Admin full access on tithi dates"
    ON public.tithi_dates
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Email Logs RLS Policies:
DROP POLICY IF EXISTS "Admin full access on email logs" ON public.email_logs;
CREATE POLICY "Admin full access on email logs"
    ON public.email_logs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- App Settings RLS Policies:
DROP POLICY IF EXISTS "Public can view app settings" ON public.app_settings;
CREATE POLICY "Public can view app settings"
    ON public.app_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admin full access on app settings" ON public.app_settings;
CREATE POLICY "Admin full access on app settings"
    ON public.app_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==========================================================
-- 5. INITIAL SEED DATA (2003 – 2030 VERIFIED DATES)
-- ==========================================================

INSERT INTO public.tithi_dates (year, date, tithi_name, status, notes)
VALUES
    (2003, '28 September', 'Ashwayuja Shukla Tritiya', 'published', 'Birth Year'),
    (2004, '16 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2005, '06 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2006, '25 September', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2007, '14 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2008, '02 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2009, '21 September', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2010, '11 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2011, '29 September', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2012, '18 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2013, '07 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2014, '26 September', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2015, '15 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2016, '04 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2017, '23 September', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2018, '12 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2019, '01 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2020, '19 September', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2021, '08 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2022, '28 September', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2023, '17 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2024, '05 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2025, '24 September', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2026, '14 October', 'Ashwayuja Shukla Tritiya', 'published', 'Present Verified Year'),
    (2027, '03 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2028, '21 September', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2029, '10 October', 'Ashwayuja Shukla Tritiya', 'published', NULL),
    (2030, '29 September', 'Ashwayuja Shukla Tritiya', 'published', 'Initial Verified Horizon')
ON CONFLICT (year) DO UPDATE
SET date = EXCLUDED.date,
    tithi_name = EXCLUDED.tithi_name,
    status = EXCLUDED.status,
    notes = EXCLUDED.notes,
    updated_at = now();
