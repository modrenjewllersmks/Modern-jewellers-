import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Database,
  Film,
  FolderKanban,
  Gem,
  Globe,
  Lock,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import { IMAGE_ASSETS } from '../data/defaultContent';
import { useStore } from '../context/StoreContext';
import { formatInr } from '../lib/whatsapp';
import {
  inspectVideoFile,
  MAX_IMAGE_SIZE_BYTES,
  signInAdmin,
  uploadMediaToSupabase,
} from '../lib/supabase';
import type {
  CollectionCategory,
  JewelleryProduct,
  SiteSettings,
  UploadProgressState,
  VideoClip,
  VideoOrientation,
} from '../types/jewellery';

type AdminTab = 'videos' | 'products' | 'categories' | 'website';

interface AdminDashboardProps {
  onBackToStorefront: () => void;
}

const INPUT_CLASS =
  'w-full min-h-[42px] px-3.5 rounded-lg bg-[#F8F5EF]/70 border border-[#E9DFCE] text-sm text-[#292929] placeholder:text-[#5A544B]/50 focus:outline-none focus:border-[#C6A66B] focus:bg-[#FFFFFF]';

const LABEL_CLASS =
  'block text-xs uppercase tracking-wider text-[#5A544B] font-semibold mb-1.5';

export function AdminDashboard({ onBackToStorefront }: AdminDashboardProps) {
  const {
    settings,
    categories,
    videos,
    products,
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
  } = useStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('videos');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [bannerMessage, setBannerMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [uploadState, setUploadState] = useState<UploadProgressState>({
    active: false,
    percent: 0,
    fileName: '',
    error: null,
  });

  // Video Form State
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [vidTitle, setVidTitle] = useState('');
  const [vidDesc, setVidDesc] = useState('');
  const [vidCategory, setVidCategory] = useState(
    categories[0]?.name || 'Bridal Necklace Sets'
  );
  const [vidUrl, setVidUrl] = useState('');
  const [vidThumbUrl, setVidThumbUrl] = useState<string>(IMAGE_ASSETS.bridalPolki);
  const [vidOrientation, setVidOrientation] = useState<VideoOrientation>('portrait');
  const [vidDuration, setVidDuration] = useState<number>(30);
  const [vidOptionalPrice, setVidOptionalPrice] = useState('');
  const [vidEnquiryMsg, setVidEnquiryMsg] = useState('');

  // Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodCode, setProdCode] = useState('MJ-116');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState(
    categories[0]?.name || 'Gold Necklace Sets'
  );
  const [prodDesc, setProdDesc] = useState('');
  const [prodMetal, setProdMetal] = useState('22K Hallmarked Gold');
  const [prodPriceOnRequest, setProdPriceOnRequest] = useState(false);
  const [prodDemoPriceInr, setProdDemoPriceInr] = useState<number>(49999);
  const [prodImageUrl, setProdImageUrl] = useState<string>(IMAGE_ASSETS.kundanChoker);
  const [prodFeatured, setProdFeatured] = useState(false);

  // Category Form State
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Website Settings Draft State
  const [draftSettings, setDraftSettings] = useState<SiteSettings>(settings);

  const isAuthenticated = isSupabaseConfigured ? Boolean(adminSession) : demoAdminEnabled;

  const notify = (type: 'success' | 'error', text: string) => {
    setBannerMessage({ type, text });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    const { session, error } = await signInAdmin(loginEmail.trim(), loginPassword);
    setLoggingIn(false);
    if (error || !session) {
      setLoginError(error || 'Authentication failed.');
      return;
    }
    setAdminSession(session);
  };

  // ==================== VIDEO HANDLERS ====================
  const resetVideoForm = () => {
    setEditingVideoId(null);
    setVidTitle('');
    setVidDesc('');
    setVidCategory(categories[0]?.name || 'Bridal Necklace Sets');
    setVidUrl('');
    setVidThumbUrl(IMAGE_ASSETS.bridalPolki);
    setVidOrientation('portrait');
    setVidDuration(30);
    setVidOptionalPrice('');
    setVidEnquiryMsg('');
  };

  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadState({ active: false, percent: 0, fileName: file.name, error: null });

    try {
      const meta = await inspectVideoFile(file);
      setVidDuration(meta.durationSeconds);
      setVidOrientation(meta.orientation);

      if (!isSupabaseConfigured) {
        setUploadState({
          active: false,
          percent: 0,
          fileName: file.name,
          error:
            'Video validated (' +
            meta.durationSeconds +
            's, ' +
            meta.orientation +
            '), but Supabase Storage is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to activate real cloud video uploads.',
        });
        return;
      }

      setUploadState({ active: true, percent: 5, fileName: file.name, error: null });
      const publicUrl = await uploadMediaToSupabase({
        bucket: 'jewellery-videos',
        file,
        folder: 'showroom-clips',
        onProgress: (percent) =>
          setUploadState((prev) => ({ ...prev, active: true, percent })),
      });
      setVidUrl(publicUrl);
      setUploadState({ active: false, percent: 100, fileName: file.name, error: null });
      notify('success', `Uploaded "${file.name}" to Supabase Storage.`);
    } catch (err) {
      setUploadState({
        active: false,
        percent: 0,
        fileName: file.name,
        error: err instanceof Error ? err.message : 'Video upload failed.',
      });
    }
  };

  const handleImageFileUpload = async (
    file: File,
    folder: string,
    onSuccess: (url: string) => void
  ) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      notify('error', 'Please select a JPEG, PNG, or WebP image file.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      notify('error', 'Image exceeds the 15 MB upload limit.');
      return;
    }
    if (!isSupabaseConfigured) {
      notify(
        'error',
        'Supabase Storage is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to upload new image files.'
      );
      return;
    }

    setUploadState({ active: true, percent: 5, fileName: file.name, error: null });
    try {
      const publicUrl = await uploadMediaToSupabase({
        bucket: 'jewellery-images',
        file,
        folder,
        onProgress: (percent) =>
          setUploadState((prev) => ({ ...prev, active: true, percent })),
      });
      onSuccess(publicUrl);
      setUploadState({ active: false, percent: 100, fileName: file.name, error: null });
      notify('success', `Uploaded "${file.name}" to Supabase Storage.`);
    } catch (err) {
      setUploadState({
        active: false,
        percent: 0,
        fileName: file.name,
        error: err instanceof Error ? err.message : 'Image upload failed.',
      });
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vidTitle.trim() || !vidUrl.trim()) {
      notify('error', 'Video title and video file/URL are required.');
      return;
    }
    if (vidDuration > 120 || vidDuration < 1) {
      notify('error', 'Video duration must be between 1 and 120 seconds.');
      return;
    }

    const nextClip: VideoClip = {
      id: editingVideoId || `vid-${Date.now()}`,
      title: vidTitle.trim(),
      description: vidDesc.trim(),
      category: vidCategory,
      videoUrl: vidUrl.trim(),
      thumbnailUrl: vidThumbUrl.trim(),
      orientation: vidOrientation,
      durationSeconds: Number(vidDuration),
      sortOrder: editingVideoId
        ? videos.find((v) => v.id === editingVideoId)?.sortOrder ?? videos.length + 1
        : videos.length + 1,
      optionalPrice: vidOptionalPrice.trim() || undefined,
      enquiryMessage: vidEnquiryMsg.trim() || undefined,
    };

    const { error } = await saveVideo(nextClip);
    if (error) {
      notify('error', error);
      return;
    }
    notify('success', editingVideoId ? 'Bridal film updated.' : 'Bridal film added.');
    resetVideoForm();
  };

  const handleMoveVideo = async (index: number, direction: -1 | 1) => {
    const sorted = [...videos].sort((a, b) => a.sortOrder - b.sortOrder);
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const temp = sorted[index];
    sorted[index] = sorted[targetIdx];
    sorted[targetIdx] = temp;
    const { error } = await reorderVideos(sorted);
    if (error) notify('error', error);
  };

  // ==================== PRODUCT HANDLERS ====================
  const resetProductForm = () => {
    setEditingProductId(null);
    setProdCode(`MJ-${101 + products.length}`);
    setProdName('');
    setProdCategory(categories[0]?.name || 'Gold Necklace Sets');
    setProdDesc('');
    setProdMetal('22K Hallmarked Gold');
    setProdPriceOnRequest(false);
    setProdDemoPriceInr(49999);
    setProdImageUrl(IMAGE_ASSETS.kundanChoker);
    setProdFeatured(false);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodImageUrl.trim()) {
      notify('error', 'Product name and image URL are required.');
      return;
    }

    const numericPrice = Math.max(0, Number(prodDemoPriceInr) || 0);
    const nextProd: JewelleryProduct = {
      id: editingProductId || `prod-${Date.now()}`,
      productCode: prodCode.trim() || `MJ-${101 + products.length}`,
      name: prodName.trim(),
      category: prodCategory,
      description: prodDesc.trim(),
      metalPurity: prodMetal.trim() || '22K Hallmarked Gold',
      demoPriceInr: numericPrice,
      priceOnRequest: prodPriceOnRequest,
      priceLabel: prodPriceOnRequest ? 'Price on Request' : formatInr(numericPrice),
      imageUrl: prodImageUrl.trim(),
      featured: prodFeatured,
      sortOrder: editingProductId
        ? products.find((p) => p.id === editingProductId)?.sortOrder ?? products.length + 1
        : products.length + 1,
    };

    const { error } = await saveProduct(nextProd);
    if (error) {
      notify('error', error);
      return;
    }
    notify('success', editingProductId ? 'Product updated.' : 'Product added to catalogue.');
    resetProductForm();
  };

  // ==================== CATEGORY HANDLERS ====================
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      notify('error', 'Category name is required.');
      return;
    }
    const slug = catName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const nextCat: CollectionCategory = {
      id: editingCategoryId || `cat-${Date.now()}`,
      name: catName.trim(),
      slug,
      description: catDesc.trim(),
      sortOrder: editingCategoryId
        ? categories.find((c) => c.id === editingCategoryId)?.sortOrder ?? categories.length + 1
        : categories.length + 1,
    };

    const { error } = await saveCategory(nextCat);
    if (error) {
      notify('error', error);
      return;
    }
    notify('success', editingCategoryId ? 'Category updated.' : 'Category created.');
    setEditingCategoryId(null);
    setCatName('');
    setCatDesc('');
  };

  // ==================== WEBSITE SETTINGS HANDLER ====================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await updateSettings(draftSettings);
    if (error) {
      notify('error', error);
      return;
    }
    notify('success', 'Website content and showroom details saved.');
  };

  // ==================== AUTHENTICATION / SETUP GATE ====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F5EF] text-[#292929] pt-24 pb-16 px-5 sm:px-8 flex items-center justify-center">
        <div className="w-full max-w-2xl rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] p-6 sm:p-10 shadow-[0_20px_50px_rgba(41,41,41,0.06)]">
          <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#E9DFCE]">
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#7D602B] font-semibold">
                Owner Console
              </p>
              <h1 className="font-editorial text-3xl text-[#292929] mt-1">
                {settings.brandName} Admin Access
              </h1>
            </div>

            <button
              type="button"
              onClick={onBackToStorefront}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E9DFCE] bg-[#F8F5EF] text-xs tracking-[0.12em] uppercase font-semibold text-[#292929] hover:border-[#C6A66B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Storefront</span>
            </button>
          </div>

          {isSupabaseConfigured ? (
            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div className="flex items-center gap-2.5 text-xs text-emerald-700 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Supabase Backend Connected · Sign in with your Administrator account</span>
              </div>

              <div>
                <label htmlFor="admin-email" className={LABEL_CLASS}>
                  Admin Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="owner@modernjewellers.in"
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="admin-password" className={LABEL_CLASS}>
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={INPUT_CLASS}
                />
              </div>

              {loginError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-lg border border-red-300 bg-red-50 text-xs text-red-800 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full min-h-[48px] rounded-xl bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.16em] uppercase font-semibold hover:bg-[#B29155] transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span>{loggingIn ? 'Verifying...' : 'Sign In to Dashboard'}</span>
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="p-5 rounded-xl border border-[#C6A66B]/60 bg-[#F8F5EF] space-y-3">
                <div className="flex items-start gap-3">
                  <Database className="w-5 h-5 text-[#7D602B] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <h2 className="text-sm font-semibold text-[#292929]">
                      Supabase Credentials Required for Live Persistence & File Uploads
                    </h2>
                    <p className="mt-1 text-xs text-[#5A544B] leading-relaxed">
                      This storefront is currently running on curated sample showroom content. Real
                      video/photo cloud uploads and multi-device persistence are disabled until
                      Supabase is connected.
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-xs text-[#292929] space-y-1.5 font-mono bg-[#FFFFFF] p-4 rounded-lg border border-[#E9DFCE]">
                  <p>1. Create a Supabase project & run /supabase/schema.sql</p>
                  <p>2. Add your admin user UUID to public.admin_users</p>
                  <p>3. Set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY</p>
                  <p>4. Buckets used: jewellery-videos, jewellery-images</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                <button
                  type="button"
                  onClick={enableDemoAdmin}
                  className="min-h-[46px] px-6 py-3 rounded-xl bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.14em] uppercase font-semibold hover:bg-[#B29155] transition-colors"
                >
                  Open Demo Admin Preview
                </button>
                <span className="text-xs text-[#5A544B]">
                  Changes in Demo Preview save only to this browser session and block fake cloud uploads.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== AUTHENTICATED / PREVIEW DASHBOARD ====================
  const sortedVideos = [...videos].sort((a, b) => a.sortOrder - b.sortOrder);
  const sortedProducts = [...products].sort((a, b) => a.sortOrder - b.sortOrder);
  const sortedCategories = [...categories].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-[#F8F5EF] text-[#292929] pt-16 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 shrink-0 bg-[#FFFFFF] border-b lg:border-b-0 lg:border-r border-[#E9DFCE] p-5 flex flex-col justify-between gap-6">
        <div>
          <p className="text-xs tracking-[0.18em] uppercase text-[#7D602B] font-semibold mb-4">
            Showroom Management
          </p>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: 'videos' as const, label: 'Videos', count: videos.length, icon: Film },
              { id: 'products' as const, label: 'Products', count: products.length, icon: Gem },
              {
                id: 'categories' as const,
                label: 'Categories',
                count: categories.length,
                icon: FolderKanban,
              },
              { id: 'website' as const, label: 'Website & Setup', count: null, icon: Globe },
            ].map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'website') setDraftSettings(settings);
                  }}
                  className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 border ${
                    active
                      ? 'bg-[#C6A66B] text-[#FFFFFF] border-[#C6A66B]'
                      : 'text-[#5A544B] border-transparent hover:bg-[#F8F5EF] hover:text-[#292929]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                  {item.count !== null && (
                    <span
                      className={`text-xs tabular-nums ${
                        active ? 'text-[#FFFFFF] font-semibold' : 'text-[#5A544B]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#E9DFCE] space-y-2.5">
          <div className="text-xs text-[#5A544B]">
            Mode:{' '}
            <span
              className={`font-semibold ${
                isSupabaseConfigured ? 'text-emerald-700' : 'text-[#7D602B]'
              }`}
            >
              {isSupabaseConfigured ? 'Supabase Live' : 'Demo Preview'}
            </span>
          </div>

          {!isSupabaseConfigured && (
            <button
              type="button"
              onClick={() => {
                resetDemoChanges();
                notify('success', 'Demo content restored to defaults.');
              }}
              className="w-full min-h-[38px] px-3 py-2 rounded-lg border border-[#E9DFCE] bg-[#F8F5EF] text-xs font-medium text-[#292929] hover:border-[#C6A66B] flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Demo Content</span>
            </button>
          )}

          <button
            type="button"
            onClick={logoutAdmin}
            className="w-full min-h-[38px] px-3 py-2 rounded-lg border border-[#E9DFCE] text-xs font-medium text-[#5A544B] hover:text-[#292929] hover:border-[#C6A66B] flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Exit Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-6xl">
        {/* Top Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#E9DFCE]">
          <div className="text-sm text-[#5A544B]">
            <span>{settings.brandName}</span>
            <span className="mx-2">/</span>
            <span>Admin</span>
            <span className="mx-2">/</span>
            <span className="text-[#292929] font-semibold capitalize">{activeTab}</span>
          </div>

          <button
            type="button"
            onClick={onBackToStorefront}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-lg border border-[#E9DFCE] bg-[#FFFFFF] text-xs tracking-[0.12em] uppercase font-semibold text-[#292929] hover:border-[#C6A66B] hover:text-[#7D602B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>View Live Website</span>
          </button>
        </div>

        {/* Status / Feedback Banner */}
        {bannerMessage && (
          <div
            role="status"
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-4 text-xs sm:text-sm ${
              bannerMessage.type === 'success'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                : 'border-amber-300 bg-amber-50 text-amber-900'
            }`}
          >
            <span>{bannerMessage.text}</span>
            <button
              type="button"
              onClick={() => setBannerMessage(null)}
              className="text-xs underline shrink-0 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Upload Progress Indicator */}
        {(uploadState.active || uploadState.error) && (
          <div className="mb-6 p-4 rounded-xl border border-[#E9DFCE] bg-[#FFFFFF]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#292929] font-medium truncate">
                {uploadState.active ? `Uploading ${uploadState.fileName}...` : uploadState.fileName}
              </span>
              {uploadState.active && (
                <span className="tabular-nums text-[#7D602B] font-semibold">
                  {uploadState.percent}%
                </span>
              )}
            </div>
            {uploadState.active && (
              <div className="w-full h-1.5 rounded bg-[#E9DFCE] overflow-hidden">
                <div
                  className="h-full bg-[#C6A66B] transition-all duration-150"
                  style={{ width: `${uploadState.percent}%` }}
                />
              </div>
            )}
            {uploadState.error && (
              <p className="text-xs text-amber-800 mt-1">{uploadState.error}</p>
            )}
          </div>
        )}

        {/* ==================== TAB 1: VIDEO MANAGEMENT ==================== */}
        {activeTab === 'videos' && (
          <div className="space-y-10">
            <form
              onSubmit={handleSaveVideo}
              className="rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] p-6 space-y-5 shadow-[0_6px_24px_rgba(41,41,41,0.03)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-editorial text-2xl text-[#292929]">
                  {editingVideoId ? 'Edit Bridal Film' : 'Add New Bridal Film'}
                </h2>
                {editingVideoId && (
                  <button
                    type="button"
                    onClick={resetVideoForm}
                    className="text-xs text-[#7D602B] font-semibold underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={LABEL_CLASS}>Jewellery / Film Title *</label>
                  <input
                    type="text"
                    required
                    value={vidTitle}
                    onChange={(e) => setVidTitle(e.target.value)}
                    placeholder="e.g., Bridal Polki Choker Reveal"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Collection Category *</label>
                  <select
                    value={vidCategory}
                    onChange={(e) => setVidCategory(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    {sortedCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Orientation</label>
                  <select
                    value={vidOrientation}
                    onChange={(e) => setVidOrientation(e.target.value as VideoOrientation)}
                    className={INPUT_CLASS}
                  >
                    <option value="portrait">Vertical (9:16 Reel)</option>
                    <option value="landscape">Horizontal (16:9 / 4:3)</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Duration (Seconds, max 120s)</label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={vidDuration}
                    onChange={(e) => setVidDuration(Number(e.target.value))}
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Optional Demo Price Label</label>
                  <input
                    type="text"
                    value={vidOptionalPrice}
                    onChange={(e) => setVidOptionalPrice(e.target.value)}
                    placeholder="e.g., ₹2,45,000 (Demo Estimate)"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Video File (MP4 / WebM) or Hosted URL *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={vidUrl}
                      onChange={(e) => setVidUrl(e.target.value)}
                      placeholder="/videos/clip-01-bridal-polki.mp4"
                      className={`flex-1 ${INPUT_CLASS}`}
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 min-h-[42px] rounded-lg border border-[#C6A66B] text-xs uppercase tracking-wider font-semibold text-[#7D602B] hover:bg-[#C6A66B] hover:text-[#FFFFFF] cursor-pointer transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={handleVideoFileSelect}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={LABEL_CLASS}>Custom Thumbnail Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={vidThumbUrl}
                      onChange={(e) => setVidThumbUrl(e.target.value)}
                      placeholder="https://..."
                      className={`flex-1 ${INPUT_CLASS}`}
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 min-h-[42px] rounded-lg border border-[#E9DFCE] bg-[#F8F5EF] text-xs uppercase tracking-wider font-semibold text-[#292929] hover:border-[#C6A66B] cursor-pointer transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) {
                            handleImageFileUpload(file, 'thumbnails', setVidThumbUrl);
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS}>Short Description</label>
                <textarea
                  rows={2}
                  value={vidDesc}
                  onChange={(e) => setVidDesc(e.target.value)}
                  placeholder="Describe craftsmanship, stone setting, and carat details..."
                  className="w-full p-3.5 rounded-lg bg-[#F8F5EF]/70 border border-[#E9DFCE] text-sm text-[#292929] focus:outline-none focus:border-[#C6A66B] focus:bg-[#FFFFFF]"
                />
              </div>

              <div>
                <label className={LABEL_CLASS}>
                  Custom WhatsApp Enquiry Message (Optional — for “Enquire About This Set”)
                </label>
                <textarea
                  rows={2}
                  value={vidEnquiryMsg}
                  onChange={(e) => setVidEnquiryMsg(e.target.value)}
                  placeholder="Leave blank for automatic prefilled message featuring this film's title and category..."
                  className="w-full p-3.5 rounded-lg bg-[#F8F5EF]/70 border border-[#E9DFCE] text-sm text-[#292929] focus:outline-none focus:border-[#C6A66B] focus:bg-[#FFFFFF]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 min-h-[42px] px-6 py-2.5 rounded-lg bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.14em] uppercase font-semibold hover:bg-[#B29155] transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{editingVideoId ? 'Save Film Changes' : 'Add Bridal Film'}</span>
              </button>
            </form>

            {/* Video List Table */}
            <div className="rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] overflow-hidden shadow-[0_6px_24px_rgba(41,41,41,0.03)]">
              <div className="px-6 py-4 border-b border-[#E9DFCE] flex items-center justify-between">
                <h3 className="font-editorial text-xl text-[#292929]">
                  Showroom Video Library ({sortedVideos.length})
                </h3>
                <span className="text-xs text-[#5A544B]">
                  Unlimited entries supported · Max 2:00 per clip
                </span>
              </div>

              <div className="divide-y divide-[#E9DFCE]">
                {sortedVideos.map((clip, idx) => (
                  <div
                    key={clip.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F5EF]/60"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={clip.thumbnailUrl || IMAGE_ASSETS.bridalPolki}
                        alt={clip.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-12 rounded-lg object-cover bg-[#F8F5EF] border border-[#E9DFCE] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#292929] truncate">
                          {clip.title}
                        </p>
                        <p className="text-xs text-[#5A544B] tabular-nums mt-0.5">
                          {clip.category} · {clip.orientation} · {clip.durationSeconds}s
                          {clip.optionalPrice ? ` · ${clip.optionalPrice}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveVideo(idx, -1)}
                        aria-label={`Move ${clip.title} up`}
                        className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#E9DFCE] text-[#292929] disabled:opacity-30 hover:border-[#C6A66B]"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedVideos.length - 1}
                        onClick={() => handleMoveVideo(idx, 1)}
                        aria-label={`Move ${clip.title} down`}
                        className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#E9DFCE] text-[#292929] disabled:opacity-30 hover:border-[#C6A66B]"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVideoId(clip.id);
                          setVidTitle(clip.title);
                          setVidDesc(clip.description);
                          setVidCategory(clip.category);
                          setVidUrl(clip.videoUrl);
                          setVidThumbUrl(clip.thumbnailUrl);
                          setVidOrientation(clip.orientation);
                          setVidDuration(clip.durationSeconds);
                          setVidOptionalPrice(clip.optionalPrice || '');
                          setVidEnquiryMsg(clip.enquiryMessage || '');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 h-9 rounded-lg border border-[#E9DFCE] text-xs font-semibold text-[#292929] hover:border-[#C6A66B]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const { error } = await removeVideo(clip.id);
                          if (error) notify('error', error);
                          else notify('success', `Deleted "${clip.title}".`);
                        }}
                        aria-label={`Delete ${clip.title}`}
                        className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#E9DFCE] text-red-700 hover:border-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: PRODUCT MANAGEMENT ==================== */}
        {activeTab === 'products' && (
          <div className="space-y-10">
            <form
              onSubmit={handleSaveProduct}
              className="rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] p-6 space-y-5 shadow-[0_6px_24px_rgba(41,41,41,0.03)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-editorial text-2xl text-[#292929]">
                  {editingProductId ? 'Edit Product' : 'Add New Jewellery Piece'}
                </h2>
                {editingProductId && (
                  <button
                    type="button"
                    onClick={resetProductForm}
                    className="text-xs text-[#7D602B] font-semibold underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={LABEL_CLASS}>Product ID *</label>
                  <input
                    type="text"
                    required
                    value={prodCode}
                    onChange={(e) => setProdCode(e.target.value)}
                    placeholder="e.g., MJ-116"
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    placeholder="e.g., Royal Kundan Bridal Choker"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Collection Category *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    {sortedCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Metal / Purity Specification</label>
                  <input
                    type="text"
                    value={prodMetal}
                    onChange={(e) => setProdMetal(e.target.value)}
                    placeholder="e.g., 22K Hallmarked Gold"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Product Photograph URL *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={prodImageUrl}
                      onChange={(e) => setProdImageUrl(e.target.value)}
                      placeholder="/src/assets/images/..."
                      className={`flex-1 ${INPUT_CLASS}`}
                    />
                    <label className="inline-flex items-center gap-1.5 px-3.5 min-h-[42px] rounded-lg border border-[#C6A66B] text-xs uppercase tracking-wider font-semibold text-[#7D602B] hover:bg-[#C6A66B] hover:text-[#FFFFFF] cursor-pointer transition-colors shrink-0">
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) {
                            handleImageFileUpload(file, 'products', setProdImageUrl);
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="inline-flex items-center gap-2.5 text-sm text-[#292929] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodPriceOnRequest}
                      onChange={(e) => setProdPriceOnRequest(e.target.checked)}
                      className="w-4 h-4 accent-[#C6A66B]"
                    />
                    <span>Show “Price on Request”</span>
                  </label>

                  <label className="inline-flex items-center gap-2.5 text-sm text-[#292929] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodFeatured}
                      onChange={(e) => setProdFeatured(e.target.checked)}
                      className="w-4 h-4 accent-[#C6A66B]"
                    />
                    <span>Mark as Featured</span>
                  </label>
                </div>

                {!prodPriceOnRequest && (
                  <div>
                    <label className={LABEL_CLASS}>Demo Price (INR ₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={prodDemoPriceInr}
                      onChange={(e) => setProdDemoPriceInr(Number(e.target.value))}
                      placeholder="49999"
                      className={`${INPUT_CLASS} tabular-nums`}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className={LABEL_CLASS}>Product Description</label>
                <textarea
                  rows={2}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Describe design, gemstone work, and styling occasion..."
                  className="w-full p-3.5 rounded-lg bg-[#F8F5EF]/70 border border-[#E9DFCE] text-sm text-[#292929] focus:outline-none focus:border-[#C6A66B] focus:bg-[#FFFFFF]"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 min-h-[42px] px-6 py-2.5 rounded-lg bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.14em] uppercase font-semibold hover:bg-[#B29155] transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{editingProductId ? 'Save Product' : 'Add Product'}</span>
              </button>
            </form>

            {/* Product List */}
            <div className="rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] overflow-hidden shadow-[0_6px_24px_rgba(41,41,41,0.03)]">
              <div className="px-6 py-4 border-b border-[#E9DFCE]">
                <h3 className="font-editorial text-xl text-[#292929]">
                  Catalogue Inventory ({sortedProducts.length})
                </h3>
              </div>

              <div className="divide-y divide-[#E9DFCE]">
                {sortedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F8F5EF]/60"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-12 rounded-lg object-cover bg-[#F8F5EF] border border-[#E9DFCE] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#292929] truncate">
                          {prod.productCode} · {prod.name}
                        </p>
                        <p className="text-xs text-[#5A544B] mt-0.5 tabular-nums">
                          {prod.category} ·{' '}
                          {prod.priceOnRequest
                            ? 'Price on Request'
                            : `${formatInr(prod.demoPriceInr)} (Demo)`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          const { error } = await saveProduct({
                            ...prod,
                            featured: !prod.featured,
                          });
                          if (error) notify('error', error);
                        }}
                        aria-label={
                          prod.featured ? `Unfeature ${prod.name}` : `Feature ${prod.name}`
                        }
                        className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                          prod.featured
                            ? 'border-[#C6A66B] text-[#C6A66B] bg-[#F8F5EF]'
                            : 'border-[#E9DFCE] text-[#5A544B]/60 hover:text-[#292929]'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${prod.featured ? 'fill-current' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductId(prod.id);
                          setProdCode(prod.productCode);
                          setProdName(prod.name);
                          setProdCategory(prod.category);
                          setProdDesc(prod.description);
                          setProdMetal(prod.metalPurity);
                          setProdPriceOnRequest(prod.priceOnRequest);
                          setProdDemoPriceInr(prod.demoPriceInr);
                          setProdImageUrl(prod.imageUrl);
                          setProdFeatured(prod.featured);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="px-3 h-9 rounded-lg border border-[#E9DFCE] text-xs font-semibold text-[#292929] hover:border-[#C6A66B]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const { error } = await removeProduct(prod.id);
                          if (error) notify('error', error);
                          else notify('success', `Deleted "${prod.name}".`);
                        }}
                        aria-label={`Delete ${prod.name}`}
                        className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#E9DFCE] text-red-700 hover:border-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: CATEGORIES ==================== */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            <form
              onSubmit={handleSaveCategory}
              className="rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] p-6 space-y-5 shadow-[0_6px_24px_rgba(41,41,41,0.03)]"
            >
              <h2 className="font-editorial text-2xl text-[#292929]">
                {editingCategoryId ? 'Edit Collection Category' : 'Add Collection Category'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={LABEL_CLASS}>Category Name *</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g., Heritage Polki"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Short Description</label>
                  <input
                    type="text"
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    placeholder="Curated description for this collection..."
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 min-h-[42px] px-6 py-2.5 rounded-lg bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.14em] uppercase font-semibold hover:bg-[#B29155] transition-colors"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{editingCategoryId ? 'Save Category' : 'Create Category'}</span>
              </button>
            </form>

            <div className="rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] divide-y divide-[#E9DFCE] overflow-hidden">
              {sortedCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#F8F5EF]/60"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#292929]">{cat.name}</p>
                    <p className="text-xs text-[#5A544B] mt-0.5">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryId(cat.id);
                        setCatName(cat.name);
                        setCatDesc(cat.description);
                      }}
                      className="px-3 h-9 rounded-lg border border-[#E9DFCE] text-xs font-semibold text-[#292929] hover:border-[#C6A66B]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const { error } = await removeCategory(cat.id);
                        if (error) notify('error', error);
                      }}
                      aria-label={`Delete ${cat.name}`}
                      className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#E9DFCE] text-red-700 hover:border-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== TAB 4: WEBSITE SETTINGS & SETUP ==================== */}
        {activeTab === 'website' && (
          <form onSubmit={handleSaveSettings} className="space-y-8">
            <div className="rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] p-6 space-y-5">
              <h2 className="font-editorial text-2xl text-[#292929]">
                Homepage & Hero Settings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={LABEL_CLASS}>Homepage Hero Headline</label>
                  <input
                    type="text"
                    value={draftSettings.heroHeadline}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, heroHeadline: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Hero Subheading</label>
                  <input
                    type="text"
                    value={draftSettings.heroSubheading}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, heroSubheading: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Hero Video URL</label>
                  <input
                    type="text"
                    value={draftSettings.heroVideoUrl}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, heroVideoUrl: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Showroom Section Headline</label>
                  <input
                    type="text"
                    value={draftSettings.showroomHeadline}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, showroomHeadline: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] p-6 space-y-5">
              <h2 className="font-editorial text-2xl text-[#292929]">
                About Story & Showroom Photographs
              </h2>
              <div>
                <label className={LABEL_CLASS}>About Us Headline</label>
                <input
                  type="text"
                  value={draftSettings.aboutHeadline}
                  onChange={(e) =>
                    setDraftSettings((s) => ({ ...s, aboutHeadline: e.target.value }))
                  }
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label className={LABEL_CLASS}>Brand Story Introduction</label>
                <textarea
                  rows={3}
                  value={draftSettings.aboutIntro}
                  onChange={(e) =>
                    setDraftSettings((s) => ({ ...s, aboutIntro: e.target.value }))
                  }
                  className="w-full p-3.5 rounded-lg bg-[#F8F5EF]/70 border border-[#E9DFCE] text-sm text-[#292929] focus:outline-none focus:border-[#C6A66B] focus:bg-[#FFFFFF]"
                />
              </div>

              <div className="space-y-4 pt-2">
                <p className="text-xs uppercase tracking-wider text-[#7D602B] font-semibold">
                  Showroom Gallery Photographs
                </p>
                {draftSettings.showroomImages.map((img, index) => (
                  <div
                    key={img.id}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-[#F8F5EF] border border-[#E9DFCE]"
                  >
                    <input
                      type="text"
                      value={img.title}
                      onChange={(e) => {
                        const updated = [...draftSettings.showroomImages];
                        updated[index] = { ...img, title: e.target.value };
                        setDraftSettings((s) => ({ ...s, showroomImages: updated }));
                      }}
                      placeholder="Room title"
                      className="min-h-[40px] px-3 rounded-lg bg-[#FFFFFF] border border-[#E9DFCE] text-xs text-[#292929]"
                    />
                    <input
                      type="text"
                      value={img.caption}
                      onChange={(e) => {
                        const updated = [...draftSettings.showroomImages];
                        updated[index] = { ...img, caption: e.target.value };
                        setDraftSettings((s) => ({ ...s, showroomImages: updated }));
                      }}
                      placeholder="Caption"
                      className="min-h-[40px] px-3 rounded-lg bg-[#FFFFFF] border border-[#E9DFCE] text-xs text-[#292929]"
                    />
                    <input
                      type="text"
                      value={img.imageUrl}
                      onChange={(e) => {
                        const updated = [...draftSettings.showroomImages];
                        updated[index] = { ...img, imageUrl: e.target.value };
                        setDraftSettings((s) => ({ ...s, showroomImages: updated }));
                      }}
                      placeholder="Image URL"
                      className="min-h-[40px] px-3 rounded-lg bg-[#FFFFFF] border border-[#E9DFCE] text-xs text-[#292929]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] p-6 space-y-5">
              <h2 className="font-editorial text-2xl text-[#292929]">
                Contact, WhatsApp & Location Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={LABEL_CLASS}>
                    WhatsApp Number (Country code + digits, e.g. 919876543210)
                  </label>
                  <input
                    type="text"
                    value={draftSettings.whatsappNumber}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, whatsappNumber: e.target.value }))
                    }
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Display Phone Number</label>
                  <input
                    type="text"
                    value={draftSettings.phoneDisplay}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, phoneDisplay: e.target.value }))
                    }
                    className={`${INPUT_CLASS} tabular-nums`}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Store Address</label>
                  <input
                    type="text"
                    value={draftSettings.storeAddress}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, storeAddress: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Opening Hours</label>
                  <input
                    type="text"
                    value={draftSettings.openingHours}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, openingHours: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Instagram URL</label>
                  <input
                    type="url"
                    value={draftSettings.instagramUrl}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, instagramUrl: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Google Maps Link</label>
                  <input
                    type="url"
                    value={draftSettings.mapsUrl}
                    onChange={(e) =>
                      setDraftSettings((s) => ({ ...s, mapsUrl: e.target.value }))
                    }
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 min-h-[46px] px-8 py-3 rounded-xl bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.16em] uppercase font-semibold hover:bg-[#B29155] transition-colors shadow-[0_8px_20px_rgba(198,166,107,0.28)]"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>Save All Website Settings</span>
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
