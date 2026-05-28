-- ══════════════════════════════════════════════════════════════
-- Blue Horizon Overseas — Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to set up all tables.
-- ══════════════════════════════════════════════════════════════

-- ── 1. APPLICATIONS ──
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    job_title TEXT NOT NULL,
    country TEXT NOT NULL,
    division TEXT,
    experience TEXT,
    cover_note TEXT,
    passport_type TEXT,
    status TEXT DEFAULT 'applied' CHECK (status IN (
        'applied', 'screening', 'shortlisted', 'interview',
        'selected', 'documentation', 'visa_processing',
        'medical_clearance', 'ticket_booked', 'deployed', 'rejected'
    )),
    admin_notes TEXT,
    -- Status timestamps
    applied_at TIMESTAMPTZ,
    screened_at TIMESTAMPTZ,
    shortlisted_at TIMESTAMPTZ,
    interview_at TIMESTAMPTZ,
    selected_at TIMESTAMPTZ,
    documentation_at TIMESTAMPTZ,
    visa_at TIMESTAMPTZ,
    medical_at TIMESTAMPTZ,
    ticket_at TIMESTAMPTZ,
    deployed_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    -- Meta
    cv_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_tracking ON applications(tracking_id);
CREATE INDEX IF NOT EXISTS idx_applications_phone ON applications(phone);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_country ON applications(country);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at DESC);

-- ── 2. JOB LISTINGS ──
CREATE TABLE IF NOT EXISTS job_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    emoji TEXT DEFAULT '🏭',
    country TEXT NOT NULL,
    division TEXT NOT NULL,
    salary_display TEXT NOT NULL,
    salary_inr_display TEXT,
    details JSONB DEFAULT '[]'::jsonb,
    is_urgent BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    spots_remaining INTEGER,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_jobs_active ON job_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_country ON job_listings(country);
CREATE INDEX IF NOT EXISTS idx_jobs_active_country ON job_listings(is_active, country, display_order);

-- Composite index for public testimonials query
CREATE INDEX IF NOT EXISTS idx_testimonials_active_order ON video_testimonials(is_active, display_order);

-- ── 3. VIDEO TESTIMONIALS ──
CREATE TABLE IF NOT EXISTS video_testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    country TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    quote TEXT,
    rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. SALARY CONFIGURATION ──
CREATE TABLE IF NOT EXISTS salary_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_title TEXT NOT NULL,
    country TEXT NOT NULL,
    base_salary_usd NUMERIC(10,2) NOT NULL,
    overtime_rate_per_hour NUMERIC(10,2) DEFAULT 0,
    typical_overtime_hours INTEGER DEFAULT 0,
    accommodation_value_usd NUMERIC(10,2) DEFAULT 0,
    food_value_usd NUMERIC(10,2) DEFAULT 0,
    medical_value_usd NUMERIC(10,2) DEFAULT 0,
    deductions_usd NUMERIC(10,2) DEFAULT 0,
    currency_rate NUMERIC(10,2) DEFAULT 85,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 5. ADMIN USERS ──
CREATE TABLE IF NOT EXISTS bh_admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 6. CHAT LOGS (AI chatbot + admin chat) ──
CREATE TABLE IF NOT EXISTS chat_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_logs(session_id);

-- ── 7. EMPLOYER INQUIRIES (B2B Lead Form) ──
CREATE TABLE IF NOT EXISTS employer_inquiries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    country TEXT,
    roles_needed TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employer_inq_status ON employer_inquiries(status);

-- ── 8. TALENT POOL (General CV Drop) ──
CREATE TABLE IF NOT EXISTS talent_pool (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    trade TEXT NOT NULL,
    experience TEXT,
    preferred_country TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'placed')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_talent_pool_status ON talent_pool(status);

-- ══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE bh_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_pool ENABLE ROW LEVEL SECURITY;

-- Applications: Allow insert from anon (public apply), select only via API (service role)
CREATE POLICY "Allow public insert" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role all" ON applications FOR ALL USING (auth.role() = 'service_role');

-- Job listings: Public read for active jobs
CREATE POLICY "Public read active jobs" ON job_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage jobs" ON job_listings FOR ALL USING (auth.role() = 'service_role');

-- Testimonials: Public read for active
CREATE POLICY "Public read active testimonials" ON video_testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage testimonials" ON video_testimonials FOR ALL USING (auth.role() = 'service_role');

-- Salary config: Public read for active
CREATE POLICY "Public read active salary" ON salary_config FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage salary" ON salary_config FOR ALL USING (auth.role() = 'service_role');

-- Admin users: Only service role
CREATE POLICY "Service role manage admins" ON bh_admins FOR ALL USING (auth.role() = 'service_role');

-- Chat logs: Allow public insert, service role reads
CREATE POLICY "Allow public chat insert" ON chat_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role read chats" ON chat_logs FOR SELECT USING (auth.role() = 'service_role');

-- Employer inquiries: Allow public insert, service role manages
CREATE POLICY "Allow public employer insert" ON employer_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role manage employers" ON employer_inquiries FOR ALL USING (auth.role() = 'service_role');

-- Talent pool: Allow public insert, service role manages
CREATE POLICY "Allow public talent insert" ON talent_pool FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role manage talent" ON talent_pool FOR ALL USING (auth.role() = 'service_role');

-- ══════════════════════════════════════════════════════════════
-- STORAGE BUCKET FOR CV UPLOADS
-- ══════════════════════════════════════════════════════════════
-- Run this in SQL Editor to create the bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('cv-uploads', 'cv-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public upload (anon users can upload CVs)
CREATE POLICY "Allow public CV upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cv-uploads');

-- Allow public read (admins can view/download CVs)
CREATE POLICY "Allow public CV read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cv-uploads');

-- ══════════════════════════════════════════════════════════════
-- MIGRATION: Add cv_url to existing applications table
-- (Safe to run multiple times — uses IF NOT EXISTS logic)
-- ══════════════════════════════════════════════════════════════
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'cv_url') THEN
    ALTER TABLE applications ADD COLUMN cv_url TEXT;
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- MIGRATION: Remove country CHECK constraints (allow any country)
-- ══════════════════════════════════════════════════════════════
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_country_check;
ALTER TABLE job_listings DROP CONSTRAINT IF EXISTS job_listings_country_check;
ALTER TABLE salary_config DROP CONSTRAINT IF EXISTS salary_config_country_check;
