import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import type {
  CollectionCategory,
  JewelleryProduct,
  SiteSettings,
  VideoClip,
  VideoOrientation,
} from '../types/jewellery';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const MAX_VIDEO_DURATION_SECONDS = 120;
export const MAX_VIDEO_SIZE_BYTES = 150 * 1024 * 1024; // 150 MB
export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export async function signInAdmin(
  email: string,
  password: string
): Promise<{ session: Session | null; error: string | null }> {
  if (!supabase) {
    return {
      session: null,
      error:
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.',
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { session: null, error: error.message };
  }

  // Verify admin_users table membership
  const { data: adminRow, error: adminErr } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', data.user?.id)
    .maybeSingle();

  if (adminErr || !adminRow) {
    await supabase.auth.signOut();
    return {
      session: null,
      error:
        'Your account is signed in, but is not registered in the admin_users table. Add your user_id in Supabase SQL Editor.',
    };
  }

  return { session: data.session, error: null };
}

export async function signOutAdmin(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

export async function getActiveAdminSession(): Promise<Session | null> {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  return adminRow ? session : null;
}

export async function inspectVideoFile(
  file: File
): Promise<{ durationSeconds: number; orientation: VideoOrientation }> {
  if (!['video/mp4', 'video/webm'].includes(file.type)) {
    throw new Error('Only MP4 and WebM video formats are supported.');
  }
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error('Video file exceeds the 150 MB upload limit.');
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration || 0);
      const orientation: VideoOrientation =
        video.videoHeight > video.videoWidth ? 'portrait' : 'landscape';
      URL.revokeObjectURL(url);

      if (duration > MAX_VIDEO_DURATION_SECONDS) {
        reject(
          new Error(
            `Video duration is ${duration}s. Maximum allowed showroom clip duration is ${MAX_VIDEO_DURATION_SECONDS} seconds (2 minutes).`
          )
        );
        return;
      }

      resolve({
        durationSeconds: Math.max(duration, 1),
        orientation,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Unable to read video metadata. Please select a valid MP4 or WebM file.'));
    };

    video.src = url;
  });
}

export async function uploadMediaToSupabase(options: {
  bucket: 'jewellery-videos' | 'jewellery-images';
  file: File;
  folder: string;
  onProgress: (percent: number) => void;
}): Promise<string> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error(
      'Real file uploads require Supabase Storage configuration (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).'
    );
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('You must sign in as an authenticated administrator to upload files.');
  }

  const safeExt = options.file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
  const filePath = `${options.folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  // Use XHR against Supabase Storage REST API for accurate real-time upload progress tracking
  const uploadEndpoint = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/${options.bucket}/${filePath}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', uploadEndpoint, true);
    xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);
    xhr.setRequestHeader('apikey', supabaseAnonKey);
    xhr.setRequestHeader('x-upsert', 'false');
    xhr.setRequestHeader('Content-Type', options.file.type || 'application/octet-stream');

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const pct = Math.min(99, Math.round((event.loaded / event.total) * 100));
        options.onProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        options.onProgress(100);
        resolve();
      } else {
        let message = `Upload failed with status ${xhr.status}`;
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed?.message || parsed?.error) {
            message = parsed.message || parsed.error;
          }
        } catch {
          // ignore parse error
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading file to Supabase Storage.'));
    };

    xhr.send(options.file);
  });

  const { data: publicUrlData } = supabase.storage.from(options.bucket).getPublicUrl(filePath);
  return publicUrlData.publicUrl;
}

export async function fetchSupabaseStorefront(): Promise<{
  settings: Partial<SiteSettings> | null;
  categories: CollectionCategory[] | null;
  videos: VideoClip[] | null;
  products: JewelleryProduct[] | null;
}> {
  if (!supabase) {
    return { settings: null, categories: null, videos: null, products: null };
  }

  const [settingsRes, categoriesRes, videosRes, productsRes] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('videos').select('*').order('sort_order', { ascending: true }),
    supabase.from('products').select('*').order('sort_order', { ascending: true }),
  ]);

  const settingsRow = settingsRes.data;
  const settings: Partial<SiteSettings> | null = settingsRow
    ? {
        brandName: settingsRow.brand_name,
        locationLabel: settingsRow.location_label,
        heroHeadline: settingsRow.hero_headline,
        heroSubheading: settingsRow.hero_subheading,
        heroVideoUrl: settingsRow.hero_video_url,
        heroPosterUrl: settingsRow.hero_poster_url,
        showroomHeadline: settingsRow.showroom_headline,
        showroomDescription: settingsRow.showroom_description,
        showroomImages: Array.isArray(settingsRow.showroom_images)
          ? settingsRow.showroom_images
          : undefined,
        aboutHeadline: settingsRow.about_headline,
        aboutIntro: settingsRow.about_intro,
        aboutPillars: Array.isArray(settingsRow.about_pillars)
          ? settingsRow.about_pillars
          : undefined,
        whatsappNumber: settingsRow.whatsapp_number,
        phoneDisplay: settingsRow.phone_display,
        instagramUrl: settingsRow.instagram_url,
        mapsUrl: settingsRow.maps_url,
        storeAddress: settingsRow.store_address,
        openingHours: settingsRow.opening_hours,
      }
    : null;

  const categories: CollectionCategory[] | null =
    categoriesRes.data && categoriesRes.data.length > 0
      ? categoriesRes.data.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description || '',
          sortOrder: c.sort_order ?? 0,
        }))
      : null;

  const videos: VideoClip[] | null =
    videosRes.data && videosRes.data.length > 0
      ? videosRes.data.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description || '',
          category: v.category,
          videoUrl: v.video_url,
          thumbnailUrl: v.thumbnail_url || '',
          orientation: v.orientation === 'portrait' ? 'portrait' : 'landscape',
          durationSeconds: v.duration_seconds || 30,
          optionalPrice: v.optional_price || '',
          enquiryMessage: v.enquiry_message || '',
          sortOrder: v.sort_order ?? 0,
        }))
      : null;

  const products: JewelleryProduct[] | null =
    productsRes.data && productsRes.data.length > 0
      ? productsRes.data.map((p, idx) => ({
          id: p.id,
          productCode: p.product_code || `MJ-${101 + idx}`,
          name: p.name,
          category: p.category,
          description: p.description || '',
          demoPriceInr: Number(p.demo_price_inr) || 0,
          priceLabel: p.price_label || 'Price on Request',
          priceOnRequest: Boolean(p.price_on_request),
          metalPurity: p.metal_purity || '22K Hallmarked Gold',
          imageUrl: p.image_url,
          featured: Boolean(p.featured),
          sortOrder: p.sort_order ?? 0,
        }))
      : null;

  return { settings, categories, videos, products };
}
