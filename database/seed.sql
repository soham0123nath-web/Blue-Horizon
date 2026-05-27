-- ══════════════════════════════════════════════════════════════
-- Blue Horizon Overseas — Seed Data
-- Run AFTER schema.sql to populate initial job listings.
-- ══════════════════════════════════════════════════════════════

-- ── ISRAEL JOBS ──

-- Industrial Division
INSERT INTO job_listings (title, emoji, country, division, salary_display, salary_inr_display, details, is_urgent, is_active, spots_remaining, display_order)
VALUES
('Welder', '🔥', 'Israel', 'Industrial', '$1,400 – $1,800 USD/month', '₹1.19L – ₹1.53L INR/month',
 '["MIG/TIG/Arc welding experience required", "Minimum 2 years experience", "Free accommodation & food", "Overtime available (1.5x rate)", "12-month renewable contract", "Medical insurance included"]'::jsonb,
 true, true, 15, 1),

('Shuttering Carpenter', '🪵', 'Israel', 'Industrial', '$1,300 – $1,700 USD/month', '₹1.10L – ₹1.45L INR/month',
 '["Formwork and shuttering experience", "Knowledge of construction materials", "Free accommodation & food", "Overtime available", "Safety gear provided", "12-month contract"]'::jsonb,
 false, true, 10, 2),

('Production Technician', '🏭', 'Israel', 'Industrial', '$1,200 – $1,600 USD/month', '₹1.02L – ₹1.36L INR/month',
 '["Factory/production line experience preferred", "Quality control awareness", "Free accommodation & food", "Shift work (rotating)", "Health insurance included", "12-month contract"]'::jsonb,
 false, true, 20, 3),

('Painter', '🎨', 'Israel', 'Industrial', '$1,100 – $1,500 USD/month', '₹93K – ₹1.28L INR/month',
 '["Interior/exterior painting skills", "Spray painting experience is a plus", "Free accommodation & food", "Overtime available", "All materials provided", "12-month contract"]'::jsonb,
 false, true, 8, 4),

('Tile Mason', '🧱', 'Israel', 'Industrial', '$1,300 – $1,700 USD/month', '₹1.10L – ₹1.45L INR/month',
 '["Floor and wall tiling experience", "Knowledge of different tile types", "Free accommodation & food", "Overtime available", "Tools provided", "12-month renewable contract"]'::jsonb,
 true, true, 12, 5),

('Plumber', '🔧', 'Israel', 'Industrial', '$1,400 – $1,900 USD/month', '₹1.19L – ₹1.62L INR/month',
 '["Pipe fitting and plumbing experience", "Knowledge of building systems", "Free accommodation & food", "Overtime premium rates", "12-month contract", "Medical insurance included"]'::jsonb,
 false, true, 6, 6),

('Electrician', '⚡', 'Israel', 'Industrial', '$1,500 – $1,900 USD/month', '₹1.28L – ₹1.62L INR/month',
 '["Industrial/residential wiring experience", "Electrical certification preferred", "Free accommodation & food", "Overtime available (1.5x)", "Safety equipment provided", "12-month contract"]'::jsonb,
 true, true, 10, 7),

-- Construction Division
('Steel Fixer / Iron Worker', '🏗️', 'Israel', 'Construction', '$1,300 – $1,700 USD/month', '₹1.10L – ₹1.45L INR/month',
 '["Rebar tying and steel fixing experience", "Ability to read construction drawings", "Free accommodation & food", "Overtime available", "PPE provided", "12-month contract"]'::jsonb,
 false, true, 15, 8),

('Heavy Equipment Operator', '🚜', 'Israel', 'Construction', '$1,500 – $1,900 USD/month', '₹1.28L – ₹1.62L INR/month',
 '["Crane/excavator/loader operation experience", "Valid heavy machinery license", "Free accommodation & food", "Premium overtime rates", "12-month contract", "Medical insurance"]'::jsonb,
 true, true, 5, 9),

('General Construction Worker', '👷', 'Israel', 'Construction', '$1,000 – $1,400 USD/month', '₹85K – ₹1.19L INR/month',
 '["No specific experience needed", "Physically fit candidates preferred", "Free accommodation & food", "On-the-job training provided", "Overtime available", "12-month contract"]'::jsonb,
 false, true, 30, 10);


-- ── VIETNAM JOBS ──

-- Hospitality Division
INSERT INTO job_listings (title, emoji, country, division, salary_display, salary_inr_display, details, is_urgent, is_active, spots_remaining, display_order)
VALUES
('Hotel Front Desk Executive', '🏨', 'Vietnam', 'Hospitality', '₹35,000 – ₹50,000 INR/month', NULL,
 '["Customer service experience preferred", "Basic English communication skills", "Free accommodation provided", "Food included", "6-12 month contract", "Hanoi / Ho Chi Minh City"]'::jsonb,
 false, true, 8, 1),

('Restaurant Service Staff', '🍽️', 'Vietnam', 'Hospitality', '₹30,000 – ₹45,000 INR/month', NULL,
 '["F&B service experience preferred", "Presentable and courteous", "Free accommodation & meals", "Tips & incentives extra", "Training provided", "Multiple locations"]'::jsonb,
 false, true, 15, 2),

('Housekeeping Staff', '🧹', 'Vietnam', 'Hospitality', '₹30,000 – ₹40,000 INR/month', NULL,
 '["Hotel housekeeping experience preferred", "Attention to detail", "Free accommodation & food", "Uniforms provided", "6-12 month contract", "Premium hotel properties"]'::jsonb,
 false, true, 12, 3),

-- Food Processing Division
('Food Processing Worker', '🥫', 'Vietnam', 'Food Processing', '₹35,000 – ₹55,000 INR/month', NULL,
 '["Food factory experience is a plus", "Hygiene certification preferred", "Free accommodation & food", "Overtime available", "AC factory environment", "12-month contract"]'::jsonb,
 true, true, 20, 4),

('Quality Inspector – Food', '🔬', 'Vietnam', 'Food Processing', '₹40,000 – ₹60,000 INR/month', NULL,
 '["Quality control background preferred", "FSSAI/ISO awareness is a plus", "Free accommodation & food", "Day shift only", "12-month contract", "Training provided"]'::jsonb,
 false, true, 5, 5),

-- Corporate Division
('Sales Coordinator', '📊', 'Vietnam', 'Corporate', '₹40,000 – ₹65,000 INR/month', NULL,
 '["Sales or marketing experience", "Good communication in English", "Free accommodation", "Performance bonuses", "12-month contract", "Hanoi based"]'::jsonb,
 false, true, 4, 6),

('Data Entry Operator', '💻', 'Vietnam', 'Corporate', '₹30,000 – ₹45,000 INR/month', NULL,
 '["Fast and accurate typing skills", "MS Office proficiency", "Free accommodation & food", "Fixed working hours", "AC office environment", "6-12 month contract"]'::jsonb,
 false, true, 10, 7);


-- ── ADMIN USER (default) ──
INSERT INTO bh_admins (email, full_name, role)
VALUES ('admin@bluehorizonoverseas.in', 'Admin', 'superadmin')
ON CONFLICT (email) DO NOTHING;


-- ── VIDEO TESTIMONIALS (Sample videos, replace via admin panel) ──
INSERT INTO video_testimonials (candidate_name, job_title, country, video_url, quote, rating, is_active, display_order)
VALUES
('Rajesh Kumar', 'Welder', 'Israel', 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
 'Blue Horizon changed my life. I earn 5x what I made in India and my family is thriving.', 5, true, 1),
('Amit Sharma', 'Electrician', 'Israel', 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
 'The entire process was smooth. From visa to accommodation, everything was taken care of.', 5, true, 2),
('Sunil Patel', 'Tile Mason', 'Israel', 'https://www.youtube.com/watch?v=tO01J-M3g0U',
 'I was skeptical at first, but Blue Horizon is 100% genuine. Already recommended to 3 friends.', 4, true, 3),
('Priya Nair', 'Hotel Front Desk', 'Vietnam', 'https://www.youtube.com/watch?v=Y7DPcw0Xng8',
 'Working in Vietnam has been an amazing experience. Great food, great people, great salary!', 5, true, 4);


-- ── SALARY CALCULATOR CONFIG ──
INSERT INTO salary_config (job_title, country, base_salary_usd, overtime_rate_per_hour, typical_overtime_hours, accommodation_value_usd, food_value_usd, medical_value_usd, deductions_usd, currency_rate, is_active)
VALUES
('Welder', 'Israel', 1600.00, 12.00, 40, 300.00, 200.00, 50.00, 100.00, 85.00, true),
('Electrician', 'Israel', 1700.00, 13.00, 35, 300.00, 200.00, 50.00, 100.00, 85.00, true),
('Plumber', 'Israel', 1650.00, 12.50, 35, 300.00, 200.00, 50.00, 100.00, 85.00, true),
('Tile Mason', 'Israel', 1500.00, 11.00, 40, 300.00, 200.00, 50.00, 100.00, 85.00, true),
('Painter', 'Israel', 1300.00, 10.00, 30, 300.00, 200.00, 50.00, 80.00, 85.00, true),
('General Construction Worker', 'Israel', 1200.00, 9.00, 35, 300.00, 200.00, 50.00, 80.00, 85.00, true);


-- ── CHAT LOGS ──
-- No seed needed — auto-populated by chatbot usage.

-- ── EMPLOYER INQUIRIES ──
-- No seed needed — populated when employers submit forms.

-- ── TALENT POOL ──
-- No seed needed — populated when candidates join the pool.
