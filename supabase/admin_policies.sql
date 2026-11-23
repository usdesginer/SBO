-- ============================================================
-- Pentagon Finances — Admin RLS Policies
-- Run this in the Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- Helper function: returns true if the current authenticated user
-- has role = 'admin' in the profiles table.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- PROFILES — admin can read/update all rows
-- ============================================================
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================================
-- ACCOUNTS — admin can read/update all rows
-- ============================================================
CREATE POLICY "Admins can view all accounts"
  ON public.accounts FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all accounts"
  ON public.accounts FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can insert accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (public.is_admin());

-- ============================================================
-- TRANSACTIONS — admin can read/update all rows
-- ============================================================
CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all transactions"
  ON public.transactions FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- CARDS — admin can read/update all rows
-- ============================================================
CREATE POLICY "Admins can view all cards"
  ON public.cards FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all cards"
  ON public.cards FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- LOANS — admin can read/update all rows
-- ============================================================
CREATE POLICY "Admins can view all loans"
  ON public.loans FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all loans"
  ON public.loans FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- INVESTMENTS — admin can read/update all rows
-- ============================================================
CREATE POLICY "Admins can view all investments"
  ON public.investments FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all investments"
  ON public.investments FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- SITE SETTINGS & STORAGE (site-assets) — admin write policies
-- ============================================================
CREATE POLICY "site_settings_admin_all"
  ON public.site_settings FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "site_assets_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'site-assets');

CREATE POLICY "site_assets_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "site_assets_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_admin())
  WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "site_assets_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-assets' AND public.is_admin());
