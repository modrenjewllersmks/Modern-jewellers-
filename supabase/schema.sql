-- ============================================================================
-- MODERN JEWELLERS — SUPABASE DATABASE & STORAGE SCHEMA
-- Run this script in your Supabase Project -> SQL Editor
-- ============================================================================

-- 1. Admin Users Allowlist (links Supabase Auth users to Owner/Admin role)
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Website Settings (single-row configuration table)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  brand_name TEXT NOT NULL DEFAULT 'Modern Jewellers',
  location_label TEXT NOT NULL DEFAULT 'Sri Muktsar Sahib, Punjab, India',
  hero_headline TEXT NOT NULL DEFAULT 'Elegance That Lasts Forever.',
  hero_subheading TEXT NOT NULL DEFAULT 'Discover timeless craftsmanship and extraordinary jewellery.',
  hero_video_url TEXT NOT NULL DEFAULT '/videos/hero-showroom.mp4',
  hero_poster_url TEXT NOT NULL DEFAULT '',
  showroom_headline TEXT NOT NULL DEFAULT 'Where Every Detail Tells A Story.',
  showroom_description TEXT NOT NULL DEFAULT '',
  showroom_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  about_headline TEXT NOT NULL DEFAULT 'Crafted With Passion. Chosen For Generations.',
  about_intro TEXT NOT NULL DEFAULT '',
  about_pillars JSONB NOT NULL DEFAULT '[]'::jsonb,
  whatsapp_number TEXT NOT NULL DEFAULT '919876543210',
  phone_display TEXT NOT NULL DEFAULT '+91 98765 43210',
  instagram_url TEXT NOT NULL DEFAULT 'https://instagram.com/modernjewellers.muktsar',
  maps_url TEXT NOT NULL DEFAULT 'https://maps.google.com/?q=Sri+Muktsar+Sahib+Punjab+India',
  store_address TEXT NOT NULL DEFAULT 'Main Bazaar, Sri Muktsar Sahib, Punjab 152026, India',
  opening_hours TEXT NOT NULL DEFAULT 'Monday – Saturday: 10:30 AM – 8:00 PM · Sunday: By Appointment',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Collection Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Cinematic Showroom Videos (Unlimited entries, MP4 / WebM up to 120s)
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL DEFAULT '',
  orientation TEXT NOT NULL DEFAULT 'landscape' CHECK (orientation IN ('landscape', 'portrait')),
  duration_seconds INTEGER NOT NULL DEFAULT 30 CHECK (duration_seconds > 0 AND duration_seconds <= 120),
  optional_price TEXT NOT NULL DEFAULT '',
  enquiry_message TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Jewellery Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code TEXT NOT NULL DEFAULT 'MJ-100',
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  demo_price_inr NUMERIC NOT NULL DEFAULT 0,
  price_label TEXT NOT NULL DEFAULT 'Price on Request',
  price_on_request BOOLEAN NOT NULL DEFAULT TRUE,
  metal_purity TEXT NOT NULL DEFAULT '22K Hallmarked Gold',
  image_url TEXT NOT NULL,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Public visitors can read all storefront tables; only verified admins can mutate.
-- ============================================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Helper check for admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
  );
$$;

-- Public read access
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (TRUE);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Public read videos" ON public.videos FOR SELECT USING (TRUE);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (TRUE);

-- Admin write access
CREATE POLICY "Admin read admin_users" ON public.admin_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin update site_settings" ON public.site_settings FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin manage categories" ON public.categories FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin manage videos" ON public.videos FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin manage products" ON public.products FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================================
-- STORAGE BUCKETS & POLICIES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('jewellery-videos', 'jewellery-videos', TRUE, 157286400, ARRAY['video/mp4', 'video/webm']),
  ('jewellery-images', 'jewellery-images', TRUE, 15728640, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Public read access for storefront media
CREATE POLICY "Public read jewellery media"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('jewellery-videos', 'jewellery-images'));

-- Admin-only upload/update/delete
CREATE POLICY "Admin upload jewellery media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('jewellery-videos', 'jewellery-images')
    AND public.is_admin()
  );

CREATE POLICY "Admin update jewellery media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id IN ('jewellery-videos', 'jewellery-images')
    AND public.is_admin()
  );

CREATE POLICY "Admin delete jewellery media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id IN ('jewellery-videos', 'jewellery-images')
    AND public.is_admin()
  );
