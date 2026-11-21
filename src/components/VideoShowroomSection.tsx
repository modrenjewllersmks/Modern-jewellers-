import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Maximize2,
  MessageCircle,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { buildVideoEnquiryWhatsAppUrl } from '../lib/whatsapp';
import type { VideoClip } from '../types/jewellery';
import { LuxuryImage } from './LuxuryImage';
import { RevealBlock } from './MotionPrimitives';

const MUTE_PREF_KEY = 'mj_video_muted_pref';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoShowroomSection() {
  const {
    videos,
    settings,
    setPreselectedInterest,
    setSelectedCollectionFilter,
    categories: storeCategories,
  } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Remember mute preference for the session; default is always muted initially
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem(MUTE_PREF_KEY);
      return saved === null ? true : saved === 'true';
    } catch {
      return true;
    }
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [inViewport, setInViewport] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [videoError, setVideoError] = useState<boolean>(false);

  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);

  // Touch gesture tracking that NEVER blocks normal page scroll
  const touchStartRef = useRef<{ x: number; y: number; time: number; scrollY: number } | null>(
    null
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set(videos.map((v) => v.category)));
    return ['All', ...unique];
  }, [videos]);

  const filteredVideos = useMemo(() => {
    const sorted = [...videos].sort((a, b) => a.sortOrder - b.sortOrder);
    if (selectedCategory === 'All') return sorted;
    return sorted.filter((v) => v.category === selectedCategory);
  }, [videos, selectedCategory]);

  // Clamp activeIndex if category changes
  useEffect(() => {
    setActiveIndex(0);
    setCurrentTime(0);
    setVideoError(false);
  }, [selectedCategory]);

  const activeClip: VideoClip | undefined = filteredVideos[activeIndex];

  // Observe whether THE BRIDAL FILMS section is visible in viewport
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInViewport(entry.isIntersecting);
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-play active video muted when visible; pause immediately when out of view
  useEffect(() => {
    const vid = activeVideoRef.current;
    if (!vid || !activeClip) return;

    vid.muted = isMuted;

    if (inViewport) {
      vid
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If browser blocks unmuted autoplay on navigation, fall back to muted
          vid.muted = true;
          setIsMuted(true);
          vid
            .play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false));
        });
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, [inViewport, activeClip?.id]);

  // Keep video element mute property synced with user toggle
  useEffect(() => {
    const vid = activeVideoRef.current;
    if (vid) {
      vid.muted = isMuted;
    }
    try {
      sessionStorage.setItem(MUTE_PREF_KEY, String(isMuted));
    } catch {
      // ignore storage restrictions
    }
  }, [isMuted]);

  const goToIndex = useCallback(
    (nextIdx: number) => {
      if (filteredVideos.length === 0) return;
      const bounded =
        ((nextIdx % filteredVideos.length) + filteredVideos.length) % filteredVideos.length;
      if (bounded === activeIndex) return;

      // Pause current video cleanly before switching
      if (activeVideoRef.current) {
        activeVideoRef.current.pause();
      }
      setDirection(nextIdx > activeIndex ? 1 : -1);
      setActiveIndex(bounded);
      setCurrentTime(0);
      setDuration(filteredVideos[bounded]?.durationSeconds || 30);
      setVideoError(false);
    },
    [activeIndex, filteredVideos]
  );

  const handleNext = useCallback(() => goToIndex(activeIndex + 1), [activeIndex, goToIndex]);
  const handlePrev = useCallback(() => goToIndex(activeIndex - 1), [activeIndex, goToIndex]);

  const togglePlay = () => {
    const vid = activeVideoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(e.target.value);
    setCurrentTime(nextTime);
    if (activeVideoRef.current) {
      activeVideoRef.current.currentTime = nextTime;
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = activeVideoRef.current || stageRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      target.requestFullscreen?.().catch(() => {});
    }
  };

  // Deliberate swipe detection inside the 9:16 card without blocking natural vertical page scroll
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = {
      x: t.clientX,
      y: t.clientY,
      time: Date.now(),
      scrollY: window.scrollY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const elapsed = Date.now() - start.time;
    const pageScrolled = Math.abs(window.scrollY - start.scrollY);

    // Quick swipe on the reel card (either horizontal or deliberate vertical flick when page didn't scroll far)
    if (elapsed < 450) {
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) handleNext();
        else handlePrev();
      } else if (Math.abs(dy) > 55 && Math.abs(dy) > Math.abs(dx) && pageScrolled < 20) {
        if (dy < 0) handleNext();
        else handlePrev();
      }
    }
  };

  const handleViewMatchingCollection = (category: string) => {
    setPreselectedInterest(category);
    const hasMatch = storeCategories.some((c) => c.name === category);
    setSelectedCollectionFilter(hasMatch ? category : 'All');
    document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="bridal-films"
      className="py-20 sm:py-28 bg-[#F8F5EF] text-[#292929] border-b border-[#E9DFCE]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <RevealBlock className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.24em] uppercase text-[#7D602B] font-semibold mb-3">
              Cinematic Bridal Reels
            </p>
            <h2
              className="font-editorial text-[#292929] font-normal leading-[1.05] tracking-[0.04em] uppercase"
              style={{ fontSize: 'clamp(2.2rem, 4.3vw, 3.5rem)' }}
            >
              THE BRIDAL FILMS
            </h2>
            <p className="mt-3 font-editorial italic text-xl sm:text-2xl text-[#7D602B]">
              Discover the Art of Timeless Bridal Jewellery.
            </p>
            <p className="mt-3 text-sm sm:text-base text-[#5A544B] leading-relaxed max-w-xl">
              Watch our bridal suites directly in motion, toggle original sound at any moment, swipe
              between films, and enquire about any individual jewellery set on WhatsApp.
            </p>
          </div>

          <div className="text-xs text-[#5A544B] tabular-nums">
            Film {String(activeIndex + 1).padStart(2, '0')} of{' '}
            {String(filteredVideos.length).padStart(2, '0')}
          </div>
        </RevealBlock>

        {/* Collection Filter Bar */}
        <div
          role="tablist"
          aria-label="Filter bridal films by collection"
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-[#E9DFCE]"
        >
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs tracking-[0.12em] uppercase font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] border ${
                  active
                    ? 'bg-[#C6A66B] text-[#FFFFFF] border-[#C6A66B]'
                    : 'bg-[#FFFFFF] text-[#5A544B] border-[#E9DFCE] hover:border-[#C6A66B] hover:text-[#292929]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {!activeClip ? (
          <div className="py-16 text-center rounded-2xl border border-[#E9DFCE] bg-[#FFFFFF]">
            <p className="font-editorial text-2xl text-[#292929]">
              No bridal films in this category yet
            </p>
            <p className="mt-2 text-sm text-[#5A544B]">
              Select another collection or upload new MP4/WebM films from the Owner Admin Dashboard.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* LEFT / CENTER STAGE: Vertical 9:16 Reels-Style Direct Video Card + Dedicated Enquiry */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[390px] mx-auto">
                {/* 9:16 Video Frame + Side Controls */}
                <div className="relative flex items-center justify-center gap-3">
                  {/* Vertical 9:16 Luxury Video Viewport */}
                  <div
                    ref={stageRef}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden border border-[#C6A66B]/55 bg-[#EFEAE0] shadow-[0_20px_50px_rgba(41,41,41,0.12)]"
                  >
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={activeClip.id}
                        custom={direction}
                        initial={{ opacity: 0, y: direction > 0 ? 28 : -28 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: direction > 0 ? -28 : 28 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="relative w-full h-full flex items-center justify-center bg-[#F4EFE6]"
                      >
                        {videoError ? (
                          <div className="p-6 text-center">
                            <p className="font-editorial text-xl text-[#292929]">
                              Video preview unavailable
                            </p>
                            <p className="mt-1 text-xs text-[#5A544B]">
                              Check video source in Owner Admin.
                            </p>
                          </div>
                        ) : (
                          <video
                            ref={activeVideoRef}
                            src={activeClip.videoUrl}
                            poster={activeClip.thumbnailUrl || undefined}
                            muted={isMuted}
                            loop
                            playsInline
                            preload="auto"
                            onClick={togglePlay}
                            onLoadedMetadata={(e) => {
                              const d = e.currentTarget.duration;
                              if (d && Number.isFinite(d)) setDuration(d);
                            }}
                            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onError={() => setVideoError(true)}
                            className={`w-full h-full cursor-pointer ${
                              activeClip.orientation === 'portrait'
                                ? 'object-cover'
                                : 'object-contain bg-[#292929]/5'
                            }`}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>

                    {/* Top Subtle Scrim + Sound / Fullscreen Controls */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/45 to-transparent"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 via-black/25 to-transparent"
                    />

                    {/* Top Control Strip */}
                    <div className="absolute inset-x-0 top-0 p-3.5 flex items-center justify-between gap-2 z-10">
                      <span className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[11px] font-semibold tracking-[0.12em] uppercase text-[#292929] tabular-nums">
                        {String(activeIndex + 1).padStart(2, '0')} /{' '}
                        {String(filteredVideos.length).padStart(2, '0')}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={toggleMute}
                          aria-label={isMuted ? 'Turn sound on' : 'Turn sound off'}
                          className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-xs font-semibold backdrop-blur-md border transition-colors shadow-sm ${
                            isMuted
                              ? 'bg-white/92 text-[#292929] border-[#C6A66B]/60 hover:bg-[#C6A66B] hover:text-white'
                              : 'bg-[#C6A66B] text-white border-[#C6A66B]'
                          }`}
                        >
                          {isMuted ? (
                            <>
                              <VolumeX className="w-4 h-4" aria-hidden="true" />
                              <span>Sound Off</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4" aria-hidden="true" />
                              <span>Sound On</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleFullscreen}
                          aria-label="Full screen video"
                          className="w-9 h-9 rounded-full bg-white/90 text-[#292929] border border-[#E9DFCE] flex items-center justify-center hover:border-[#C6A66B] transition-colors"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Center Play/Pause Overlay when paused */}
                    {!isPlaying && !videoError && (
                      <button
                        type="button"
                        onClick={togglePlay}
                        aria-label={`Play ${activeClip.title}`}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-white/90 border border-[#C6A66B] text-[#292929] flex items-center justify-center shadow-lg hover:bg-[#C6A66B] hover:text-white transition-colors"
                      >
                        <Play className="w-6 h-6 fill-current ml-0.5" />
                      </button>
                    )}

                    {/* Bottom Playback Progress & Controls */}
                    <div className="absolute inset-x-0 bottom-0 p-3.5 z-10 flex flex-col gap-2">
                      <input
                        type="range"
                        min={0}
                        max={duration || activeClip.durationSeconds || 1}
                        step={0.1}
                        value={Math.min(
                          currentTime,
                          duration || activeClip.durationSeconds || 1
                        )}
                        onChange={handleSeek}
                        aria-label="Seek video progress"
                        className="w-full h-1.5 accent-[#C6A66B] cursor-pointer"
                      />

                      <div className="flex items-center justify-between text-xs text-white">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={togglePlay}
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                            className="w-8 h-8 rounded-full bg-white/90 text-[#292929] flex items-center justify-center hover:bg-[#C6A66B] hover:text-white transition-colors"
                          >
                            {isPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                            )}
                          </button>
                          <span className="tabular-nums font-medium drop-shadow">
                            {formatDuration(currentTime)} /{' '}
                            {formatDuration(duration || activeClip.durationSeconds)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handlePrev}
                            aria-label="Previous bridal film"
                            className="w-8 h-8 rounded-full bg-white/90 text-[#292929] flex items-center justify-center hover:bg-[#C6A66B] hover:text-white transition-colors"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNext}
                            aria-label="Next bridal film"
                            className="w-8 h-8 rounded-full bg-white/90 text-[#292929] flex items-center justify-center hover:bg-[#C6A66B] hover:text-white transition-colors"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Vertical Next / Previous Rail */}
                  <div className="hidden sm:flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handlePrev}
                      aria-label="Previous film"
                      className="w-11 h-11 rounded-full bg-[#FFFFFF] border border-[#C6A66B]/45 text-[#292929] hover:bg-[#C6A66B] hover:text-white transition-colors flex items-center justify-center shadow-sm"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next film"
                      className="w-11 h-11 rounded-full bg-[#FFFFFF] border border-[#C6A66B]/45 text-[#292929] hover:bg-[#C6A66B] hover:text-white transition-colors flex items-center justify-center shadow-sm"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* DEDICATED CARD & INDIVIDUAL ENQUIRY BUTTON DIRECTLY UNDERNEATH ACTIVE VIDEO */}
                <div className="mt-4 rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] p-6 shadow-[0_10px_30px_rgba(41,41,41,0.05)]">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7D602B] font-semibold tracking-[0.12em] uppercase">
                    <span>{activeClip.category}</span>
                    {activeClip.optionalPrice && (
                      <span className="tabular-nums text-[#292929]">
                        {activeClip.optionalPrice}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-2 font-editorial text-2xl sm:text-3xl text-[#292929] font-medium leading-snug">
                    {activeClip.title}
                  </h3>

                  <p className="mt-2 text-sm text-[#5A544B] leading-relaxed">
                    {activeClip.description}
                  </p>

                  <div className="mt-5 flex flex-col gap-2.5">
                    <a
                      href={buildVideoEnquiryWhatsAppUrl(settings.whatsappNumber, activeClip)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.16em] uppercase font-semibold hover:bg-[#B29155] transition-colors inline-flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(198,166,107,0.28)]"
                    >
                      <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Enquire About This Set</span>
                      <ArrowRight
                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleViewMatchingCollection(activeClip.category)}
                      className="w-full min-h-[42px] px-5 py-2 rounded-xl border border-[#E9DFCE] text-[#292929] text-xs tracking-[0.14em] uppercase font-semibold hover:border-[#C6A66B] hover:bg-[#F8F5EF] transition-colors"
                    >
                      Browse {activeClip.category}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Individual Bridal Video Cards Queue (Each Video Has Its Own Enquiry Button) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#E9DFCE]">
                <h3 className="font-editorial text-2xl text-[#292929]">
                  Bridal Film Showcase Queue
                </h3>
                <span className="text-xs text-[#5A544B]">
                  Tap any film to watch or enquire directly
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredVideos.map((clip, idx) => {
                  const isCurrent = idx === activeIndex;
                  return (
                    <article
                      key={clip.id}
                      className={`rounded-xl bg-[#FFFFFF] border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                        isCurrent
                          ? 'border-[#C6A66B] shadow-[0_10px_28px_rgba(198,166,107,0.16)]'
                          : 'border-[#E9DFCE] hover:border-[#C6A66B]/70'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => goToIndex(idx)}
                        className="text-left flex items-start gap-3.5 p-4 hover:bg-[#F8F5EF]/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66B]"
                      >
                        <div className="relative w-20 h-24 rounded-lg overflow-hidden shrink-0 border border-[#E9DFCE] bg-[#F8F5EF]">
                          <LuxuryImage
                            src={clip.thumbnailUrl}
                            alt={clip.title}
                            containerClassName="w-full h-full"
                            className="w-full h-full object-cover"
                          />
                          <span
                            aria-hidden="true"
                            className={`absolute inset-0 flex items-center justify-center ${
                              isCurrent ? 'bg-[#C6A66B]/30' : 'bg-black/20'
                            }`}
                          >
                            <span className="w-7 h-7 rounded-full bg-white/95 text-[#292929] flex items-center justify-center shadow">
                              <Play className="w-3 h-3 fill-current ml-0.5" />
                            </span>
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] tracking-[0.12em] uppercase text-[#7D602B] font-semibold tabular-nums truncate">
                            {String(idx + 1).padStart(2, '0')} · {clip.category}
                          </p>
                          <h4 className="mt-1 font-editorial text-lg text-[#292929] font-medium leading-snug line-clamp-2">
                            {clip.title}
                          </h4>
                          <p className="mt-1 text-xs text-[#5A544B] line-clamp-2">
                            {clip.description}
                          </p>
                          {clip.optionalPrice && (
                            <p className="mt-1.5 text-xs font-semibold text-[#292929] tabular-nums">
                              {clip.optionalPrice}
                            </p>
                          )}
                        </div>
                      </button>

                      {/* Dedicated Per-Video Enquiry Button */}
                      <div className="px-4 pb-4 pt-2 border-t border-[#E9DFCE]/70">
                        <a
                          href={buildVideoEnquiryWhatsAppUrl(settings.whatsappNumber, clip)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group w-full min-h-[40px] px-3 py-2 rounded-lg bg-[#F8F5EF] border border-[#C6A66B]/55 text-[#292929] text-[11px] tracking-[0.12em] uppercase font-semibold hover:bg-[#C6A66B] hover:text-white hover:border-[#C6A66B] transition-colors inline-flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>Enquire About This Set</span>
                          <ArrowRight
                            className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
