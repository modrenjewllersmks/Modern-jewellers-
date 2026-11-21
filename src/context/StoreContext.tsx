import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_VIDEOS,
} from '../data/defaultContent';
import {
  fetchSupabaseStorefront,
  getActiveAdminSession,
  isSupabaseConfigured,
  signOutAdmin,
  supabase,
} from '../lib/supabase';
import type {
  CartItem,
  CollectionCategory,
  JewelleryProduct,
  SiteSettings,
  VideoClip,
} from '../types/jewellery';

interface StoreContextValue {
  settings: SiteSettings;
  categories: CollectionCategory[];
  videos: VideoClip[];
  products: JewelleryProduct[];
  isLoading: boolean;
  isSupabaseConfigured: boolean;
  adminSession: Session | null;
  demoAdminEnabled: boolean;
  setAdminSession: (session: Session | null) => void;
  enableDemoAdmin: () => void;
  logoutAdmin: () => Promise<void>;
  updateSettings: (next: SiteSettings) => Promise<{ error: string | null }>;
  saveVideo: (video: VideoClip) => Promise<{ error: string | null }>;
  removeVideo: (id: string) => Promise<{ error: string | null }>;
  reorderVideos: (ordered: VideoClip[]) => Promise<{ error: string | null }>;
  saveProduct: (product: JewelleryProduct) => Promise<{ error: string | null }>;
  removeProduct: (id: string) => Promise<{ error: string | null }>;
  saveCategory: (category: CollectionCategory) => Promise<{ error: string | null }>;
  removeCategory: (id: string) => Promise<{ error: string | null }>;
  resetDemoChanges: () => void;
  preselectedInterest: string;
  setPreselectedInterest: (interest: string) => void;
  selectedCollectionFilter: string;
  setSelectedCollectionFilter: (category: string) => void;
  // Shopping Cart
  cart: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: JewelleryProduct, quantity?: number, openDrawer?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartSubtotalInr: number;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const LOCAL_PREVIEW_KEY = 'mj_demo_preview_state_v5';
const CART_STORAGE_KEY = 'mj_shopping_cart_v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [categories, setCategories] = useState<CollectionCategory[]>(DEFAULT_CATEGORIES);
  const [videos, setVideos] = useState<VideoClip[]>(DEFAULT_VIDEOS);
  const [products, setProducts] = useState<JewelleryProduct[]>(DEFAULT_PRODUCTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminSession, setAdminSession] = useState<Session | null>(null);
  const [demoAdminEnabled, setDemoAdminEnabled] = useState<boolean>(false);
  const [preselectedInterest, setPreselectedInterest] = useState<string>('Bridal Necklace Sets');
  const [selectedCollectionFilter, setSelectedCollectionFilter] = useState<string>('All');

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore invalid storage
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore storage quota errors
    }
  }, [cart]);

  const persistLocalPreview = useCallback(
    (next: {
      settings?: SiteSettings;
      categories?: CollectionCategory[];
      videos?: VideoClip[];
      products?: JewelleryProduct[];
    }) => {
      if (isSupabaseConfigured) return;
      try {
        const snapshot = {
          settings: next.settings ?? settings,
          categories: next.categories ?? categories,
          videos: next.videos ?? videos,
          products: next.products ?? products,
        };
        localStorage.setItem(LOCAL_PREVIEW_KEY, JSON.stringify(snapshot));
      } catch {
        // Ignore storage quota issues
      }
    },
    [settings, categories, videos, products]
  );

  useEffect(() => {
    let mounted = true;
    async function init() {
      setIsLoading(true);
      if (isSupabaseConfigured) {
        try {
          const [remote, session] = await Promise.all([
            fetchSupabaseStorefront(),
            getActiveAdminSession(),
          ]);
          if (!mounted) return;
          if (remote.settings) {
            setSettings((prev) => ({ ...prev, ...remote.settings }));
          }
          if (remote.categories) setCategories(remote.categories);
          if (remote.videos) setVideos(remote.videos);
          if (remote.products) setProducts(remote.products);
          setAdminSession(session);
        } catch {
          // Keep fallback content
        }
      } else {
        try {
          const raw = localStorage.getItem(LOCAL_PREVIEW_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.settings) setSettings({ ...DEFAULT_SITE_SETTINGS, ...parsed.settings });
            if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
            if (Array.isArray(parsed.videos)) setVideos(parsed.videos);
            if (Array.isArray(parsed.products)) setProducts(parsed.products);
          }
        } catch {
          // Fallback to defaults
        }
      }
      if (mounted) setIsLoading(false);
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  // Cart Actions
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const addToCart = useCallback(
    (product: JewelleryProduct, quantity = 1, openDrawer = true) => {
      const safeQty = Math.max(1, Math.min(20, Math.round(quantity)));
      setCart((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, product, quantity: Math.min(20, item.quantity + safeQty) }
              : item
          );
        }
        return [...prev, { product, quantity: safeQty }];
      });
      if (openDrawer) {
        setIsCartOpen(true);
      }
    },
    []
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateCartQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    const clamped = Math.min(20, Math.round(quantity));
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: clamped } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartItemCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const cartSubtotalInr = useMemo(
    () =>
      cart.reduce(
        (acc, item) =>
          acc + (item.product.priceOnRequest ? 0 : item.product.demoPriceInr * item.quantity),
        0
      ),
    [cart]
  );

  const enableDemoAdmin = useCallback(() => {
    if (!isSupabaseConfigured) {
      setDemoAdminEnabled(true);
    }
  }, []);

  const logoutAdmin = useCallback(async () => {
    await signOutAdmin();
    setAdminSession(null);
    setDemoAdminEnabled(false);
  }, []);

  const updateSettings = useCallback(
    async (next: SiteSettings): Promise<{ error: string | null }> => {
      if (isSupabaseConfigured && supabase) {
        if (!adminSession) return { error: 'Admin authentication required.' };
        const { error } = await supabase.from('site_settings').upsert({
          id: 1,
          brand_name: next.brandName,
          location_label: next.locationLabel,
          hero_headline: next.heroHeadline,
          hero_subheading: next.heroSubheading,
          hero_video_url: next.heroVideoUrl,
          hero_poster_url: next.heroPosterUrl,
          showroom_headline: next.showroomHeadline,
          showroom_description: next.showroomDescription,
          showroom_images: next.showroomImages,
          about_headline: next.aboutHeadline,
          about_intro: next.aboutIntro,
          about_pillars: next.aboutPillars,
          whatsapp_number: next.whatsappNumber,
          phone_display: next.phoneDisplay,
          instagram_url: next.instagramUrl,
          maps_url: next.mapsUrl,
          store_address: next.storeAddress,
          opening_hours: next.openingHours,
          updated_at: new Date().toISOString(),
        });
        if (error) return { error: error.message };
      } else {
        persistLocalPreview({ settings: next });
      }
      setSettings(next);
      return { error: null };
    },
    [adminSession, persistLocalPreview]
  );

  const saveVideo = useCallback(
    async (video: VideoClip): Promise<{ error: string | null }> => {
      const exists = videos.some((v) => v.id === video.id);
      const nextVideos = exists
        ? videos.map((v) => (v.id === video.id ? video : v))
        : [...videos, video];

      if (isSupabaseConfigured && supabase) {
        if (!adminSession) return { error: 'Admin authentication required.' };
        const { error } = await supabase.from('videos').upsert({
          id: video.id,
          title: video.title,
          description: video.description,
          category: video.category,
          video_url: video.videoUrl,
          thumbnail_url: video.thumbnailUrl,
          orientation: video.orientation,
          duration_seconds: Math.min(120, Math.max(1, video.durationSeconds)),
          optional_price: video.optionalPrice || '',
          enquiry_message: video.enquiryMessage || '',
          sort_order: video.sortOrder,
        });
        if (error) return { error: error.message };
      } else {
        persistLocalPreview({ videos: nextVideos });
      }
      setVideos(nextVideos.sort((a, b) => a.sortOrder - b.sortOrder));
      return { error: null };
    },
    [videos, adminSession, persistLocalPreview]
  );

  const removeVideo = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const nextVideos = videos.filter((v) => v.id !== id);
      if (isSupabaseConfigured && supabase) {
        if (!adminSession) return { error: 'Admin authentication required.' };
        const { error } = await supabase.from('videos').delete().eq('id', id);
        if (error) return { error: error.message };
      } else {
        persistLocalPreview({ videos: nextVideos });
      }
      setVideos(nextVideos);
      return { error: null };
    },
    [videos, adminSession, persistLocalPreview]
  );

  const reorderVideos = useCallback(
    async (ordered: VideoClip[]): Promise<{ error: string | null }> => {
      const withOrders = ordered.map((v, idx) => ({ ...v, sortOrder: idx + 1 }));
      if (isSupabaseConfigured && supabase) {
        if (!adminSession) return { error: 'Admin authentication required.' };
        const { error } = await supabase.from('videos').upsert(
          withOrders.map((v) => ({
            id: v.id,
            title: v.title,
            description: v.description,
            category: v.category,
            video_url: v.videoUrl,
            thumbnail_url: v.thumbnailUrl,
            orientation: v.orientation,
            duration_seconds: v.durationSeconds,
            optional_price: v.optionalPrice || '',
            enquiry_message: v.enquiryMessage || '',
            sort_order: v.sortOrder,
          }))
        );
        if (error) return { error: error.message };
      } else {
        persistLocalPreview({ videos: withOrders });
      }
      setVideos(withOrders);
      return { error: null };
    },
    [adminSession, persistLocalPreview]
  );

  const saveProduct = useCallback(
    async (product: JewelleryProduct): Promise<{ error: string | null }> => {
      const exists = products.some((p) => p.id === product.id);
      const nextProducts = exists
        ? products.map((p) => (p.id === product.id ? product : p))
        : [...products, product];

      if (isSupabaseConfigured && supabase) {
        if (!adminSession) return { error: 'Admin authentication required.' };
        const { error } = await supabase.from('products').upsert({
          id: product.id,
          product_code: product.productCode,
          name: product.name,
          category: product.category,
          description: product.description,
          demo_price_inr: product.demoPriceInr,
          price_label: product.priceOnRequest ? 'Price on Request' : product.priceLabel,
          price_on_request: product.priceOnRequest,
          metal_purity: product.metalPurity,
          image_url: product.imageUrl,
          featured: product.featured,
          sort_order: product.sortOrder,
        });
        if (error) return { error: error.message };
      } else {
        persistLocalPreview({ products: nextProducts });
      }
      setProducts(nextProducts.sort((a, b) => a.sortOrder - b.sortOrder));
      return { error: null };
    },
    [products, adminSession, persistLocalPreview]
  );

  const removeProduct = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const nextProducts = products.filter((p) => p.id !== id);
      if (isSupabaseConfigured && supabase) {
        if (!adminSession) return { error: 'Admin authentication required.' };
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) return { error: error.message };
      } else {
        persistLocalPreview({ products: nextProducts });
      }
      setProducts(nextProducts);
      return { error: null };
    },
    [products, adminSession, persistLocalPreview]
  );

  const saveCategory = useCallback(
    async (category: CollectionCategory): Promise<{ error: string | null }> => {
      const exists = categories.some((c) => c.id === category.id);
      const nextCategories = exists
        ? categories.map((c) => (c.id === category.id ? category : c))
        : [...categories, category];

      if (isSupabaseConfigured && supabase) {
        if (!adminSession) return { error: 'Admin authentication required.' };
        const { error } = await supabase.from('categories').upsert({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          sort_order: category.sortOrder,
        });
        if (error) return { error: error.message };
      } else {
        persistLocalPreview({ categories: nextCategories });
      }
      setCategories(nextCategories.sort((a, b) => a.sortOrder - b.sortOrder));
      return { error: null };
    },
    [categories, adminSession, persistLocalPreview]
  );

  const removeCategory = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const nextCategories = categories.filter((c) => c.id !== id);
      if (isSupabaseConfigured && supabase) {
        if (!adminSession) return { error: 'Admin authentication required.' };
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) return { error: error.message };
      } else {
        persistLocalPreview({ categories: nextCategories });
      }
      setCategories(nextCategories);
      return { error: null };
    },
    [categories, adminSession, persistLocalPreview]
  );

  const resetDemoChanges = useCallback(() => {
    localStorage.removeItem(LOCAL_PREVIEW_KEY);
    setSettings(DEFAULT_SITE_SETTINGS);
    setCategories(DEFAULT_CATEGORIES);
    setVideos(DEFAULT_VIDEOS);
    setProducts(DEFAULT_PRODUCTS);
  }, []);

  return (
    <StoreContext.Provider
      value={{
        settings,
        categories,
        videos,
        products,
        isLoading,
        isSupabaseConfigured,
        adminSession,
        demoAdminEnabled,
        setAdminSession,
        enableDemoAdmin,
        logoutAdmin,
        updateSettings,
        saveVideo,
        removeVideo,
        reorderVideos,
        saveProduct,
        removeProduct,
        saveCategory,
        removeCategory,
        resetDemoChanges,
        preselectedInterest,
        setPreselectedInterest,
        selectedCollectionFilter,
        setSelectedCollectionFilter,
        cart,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartItemCount,
        cartSubtotalInr,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
