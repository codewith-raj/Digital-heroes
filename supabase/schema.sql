-- ============================================================
-- DIGITAL HEROES GOLF PLATFORM — SUPABASE SCHEMA v2
-- Fixed: All tables created first, RLS policies added at end
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- STEP 1: CREATE ALL TABLES (no RLS policies yet)
-- ============================================================

-- Charities (created first because users FK to it)
CREATE TABLE IF NOT EXISTS public.charities (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        text NOT NULL,
  description text,
  images      text[] DEFAULT '{}',
  events      jsonb DEFAULT '[]',
  featured    bool DEFAULT false,
  active      bool DEFAULT true,
  created_at  timestamptz DEFAULT NOW()
);

-- Users profile (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id                  uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email               text UNIQUE NOT NULL,
  name                text,
  role                text DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  subscription_status text DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'lapsed', 'cancelled')),
  subscription_plan   text CHECK (subscription_plan IN ('monthly', 'yearly')),
  subscription_id     text,
  stripe_customer_id  text,
  charity_id          uuid REFERENCES public.charities(id) ON DELETE SET NULL,
  charity_percent     int DEFAULT 10 CHECK (charity_percent >= 10 AND charity_percent <= 100),
  created_at          timestamptz DEFAULT NOW()
);

-- Scores
CREATE TABLE IF NOT EXISTS public.scores (
  id         uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  score      int NOT NULL CHECK (score >= 1 AND score <= 45),
  played_on  date NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Draws
CREATE TABLE IF NOT EXISTS public.draws (
  id               uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  month            int NOT NULL CHECK (month >= 1 AND month <= 12),
  year             int NOT NULL,
  draw_numbers     int[] DEFAULT '{}',
  draw_type        text DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  status           text DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'published')),
  jackpot_rollover bool DEFAULT false,
  rollover_amount  numeric DEFAULT 0,
  created_at       timestamptz DEFAULT NOW()
);

-- Draw entries
CREATE TABLE IF NOT EXISTS public.draw_entries (
  id           uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id      uuid REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL,
  user_id      uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  matched      int CHECK (matched IN (3, 4, 5)),
  prize_amount numeric DEFAULT 0,
  created_at   timestamptz DEFAULT NOW(),
  UNIQUE (draw_id, user_id)
);

-- Prize pools
CREATE TABLE IF NOT EXISTS public.prize_pools (
  id          uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_id     uuid REFERENCES public.draws(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_pool  numeric DEFAULT 0,
  pool_5match numeric DEFAULT 0,
  pool_4match numeric DEFAULT 0,
  pool_3match numeric DEFAULT 0,
  created_at  timestamptz DEFAULT NOW()
);

-- Charity contributions
CREATE TABLE IF NOT EXISTS public.charity_contributions (
  id         uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  charity_id uuid REFERENCES public.charities(id) ON DELETE CASCADE NOT NULL,
  amount     numeric NOT NULL,
  month      int NOT NULL,
  year       int NOT NULL,
  created_at timestamptz DEFAULT NOW()
);

-- Winner verifications
CREATE TABLE IF NOT EXISTS public.winner_verifications (
  id             uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  draw_entry_id  uuid REFERENCES public.draw_entries(id) ON DELETE CASCADE NOT NULL,
  proof_url      text,
  status         text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payout_status  text DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
  reviewed_by    uuid REFERENCES public.users(id),
  created_at     timestamptz DEFAULT NOW()
);

-- ============================================================
-- STEP 2: ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.charities             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pools           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_verifications  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 3: RLS POLICIES (all tables exist now — no FK errors)
-- ============================================================

-- Helper: is the current user an admin?
-- Used as a sub-select in all admin policies below.

-- ── CHARITIES ────────────────────────────────────────────────
CREATE POLICY "charities_select_active"
  ON public.charities FOR SELECT
  USING (active = true);

CREATE POLICY "charities_admin_all"
  ON public.charities FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── USERS ─────────────────────────────────────────────────────
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users_admin_all"
  ON public.users FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── SCORES ────────────────────────────────────────────────────
CREATE POLICY "scores_select_own"
  ON public.scores FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "scores_insert_own"
  ON public.scores FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "scores_update_own"
  ON public.scores FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "scores_delete_own"
  ON public.scores FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "scores_admin_all"
  ON public.scores FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── DRAWS ─────────────────────────────────────────────────────
CREATE POLICY "draws_select_published"
  ON public.draws FOR SELECT
  USING (
    status = 'published'
    OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "draws_admin_all"
  ON public.draws FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── DRAW ENTRIES ──────────────────────────────────────────────
CREATE POLICY "draw_entries_select_own"
  ON public.draw_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "draw_entries_admin_all"
  ON public.draw_entries FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── PRIZE POOLS ───────────────────────────────────────────────
CREATE POLICY "prize_pools_select_all"
  ON public.prize_pools FOR SELECT
  USING (true);

CREATE POLICY "prize_pools_admin_all"
  ON public.prize_pools FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── CHARITY CONTRIBUTIONS ─────────────────────────────────────
CREATE POLICY "contributions_select_own"
  ON public.charity_contributions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "contributions_admin_all"
  ON public.charity_contributions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ── WINNER VERIFICATIONS ──────────────────────────────────────
CREATE POLICY "verifications_select_own"
  ON public.winner_verifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.draw_entries de
      WHERE de.id = draw_entry_id AND de.user_id = auth.uid()
    )
  );

CREATE POLICY "verifications_update_own"
  ON public.winner_verifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.draw_entries de
      WHERE de.id = draw_entry_id AND de.user_id = auth.uid()
    )
  );

CREATE POLICY "verifications_admin_all"
  ON public.winner_verifications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- STEP 4: FUNCTIONS & TRIGGERS
-- ============================================================

-- ── Trigger: auto-create user profile on signup ───────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Trigger: keep max 5 scores per user (rolling window) ──────
CREATE OR REPLACE FUNCTION public.enforce_score_limit()
RETURNS TRIGGER AS $$
DECLARE
  score_count int;
BEGIN
  SELECT COUNT(*) INTO score_count
  FROM public.scores
  WHERE user_id = NEW.user_id;

  IF score_count >= 5 THEN
    DELETE FROM public.scores
    WHERE id IN (
      SELECT id FROM public.scores
      WHERE user_id = NEW.user_id
      ORDER BY created_at ASC
      LIMIT (score_count - 4)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS score_limit_trigger ON public.scores;

CREATE TRIGGER score_limit_trigger
  BEFORE INSERT ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.enforce_score_limit();

-- ============================================================
-- STEP 5: SEED DEFAULT CHARITIES
-- ============================================================

INSERT INTO public.charities (name, description, featured, active, events) VALUES
(
  'Green Earth Foundation',
  'Planting trees and restoring ecosystems across India. Every golf score you enter funds tree plantation drives in degraded forest areas. Together we have planted over 50,000 trees.',
  true, true,
  '[{"title":"Tree Plantation Drive","date":"2024-08-15","location":"Coorg, Karnataka","description":"Community planting event — volunteers welcome!"},{"title":"Forest Walk & Awareness","date":"2024-09-22","location":"Bandipur, Kerala","description":"Guided forest walk with environmental experts."}]'::jsonb
),
(
  'Child Education Trust',
  'Providing quality education to underprivileged children in rural India. We run 12 schools across 4 states, supporting over 3,200 students with books, uniforms, and mid-day meals.',
  true, true,
  '[{"title":"Annual Sports Day","date":"2024-07-28","location":"Mumbai, Maharashtra","description":"Fun sports day for our school children."},{"title":"Scholarship Ceremony","date":"2024-10-05","location":"Delhi","description":"Recognising top performing students with scholarships."}]'::jsonb
),
(
  'Clean Water Initiative',
  'Building wells and water purification systems in drought-affected villages of Rajasthan and Maharashtra. Clean water access transforms lives — your subscription helps us reach more villages.',
  false, true,
  '[{"title":"Village Water Audit","date":"2024-08-10","location":"Barmer, Rajasthan","description":"Assessing water needs across 20 villages."}]'::jsonb
),
(
  'Women Empowerment Fund',
  'Supporting women entrepreneurs and providing vocational training across India. We have helped over 800 women start their own businesses through microloans and skill development programs.',
  true, true,
  '[{"title":"Skill Development Workshop","date":"2024-07-20","location":"Bengaluru, Karnataka","description":"Free tailoring and embroidery workshop for 50 women."}]'::jsonb
),
(
  'Animal Welfare Society',
  'Rescuing and rehabilitating stray animals across major Indian cities. We rescue over 500 animals monthly, provide veterinary care, and work towards sustainable adoption.',
  false, true,
  '[{"title":"Adoption Drive","date":"2024-08-03","location":"Pune, Maharashtra","description":"Find a furry friend at our community adoption event."}]'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- STEP 6: STORAGE BUCKET (run manually in Dashboard)
-- ============================================================
-- Go to: Supabase Dashboard → Storage → New Bucket
--   Name:   winner-proofs
--   Public: false (private)
-- Then add this storage policy via Dashboard → Storage → Policies:
--   Allow authenticated users to upload to their own folder:
--   (user_id)/{entryId}-{timestamp}.{ext}
-- ============================================================

SELECT 'Schema created successfully! 🎉' AS status;
