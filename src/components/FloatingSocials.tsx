import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { INSTAGRAM_PROFILE_URL } from '../data/defaultContent';
import { buildGeneralWhatsAppUrl, safeExternalUrl } from '../lib/whatsapp';

/** Official Instagram glyph SVG */
export function InstagramLogoSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ig-brand-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FD5949" />
          <stop offset="50%" stopColor="#D6249F" />
          <stop offset="100%" stopColor="#285AEB" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-brand-grad)" />
      <rect
        x="4.25"
        y="4.25"
        width="15.5"
        height="15.5"
        rx="4"
        stroke="#FFFFFF"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3.7" stroke="#FFFFFF" strokeWidth="1.7" />
      <circle cx="16.9" cy="7.1" r="1.15" fill="#FFFFFF" />
    </svg>
  );
}

/** Official WhatsApp logo SVG */
export function WhatsAppLogoSvg({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16.004c0 2.352.616 4.646 1.787 6.666L2.56 29.59l7.084-1.857a13.28 13.28 0 0 0 6.36 1.616h.006c7.36 0 13.333-5.973 13.333-13.34 0-3.562-1.387-6.912-3.904-9.43a13.255 13.255 0 0 0-9.435-3.912Zm7.78 18.926c-.33.927-1.915 1.77-2.66 1.882-.68.1-1.54.142-2.487-.16-.574-.183-1.31-.426-2.253-.834-3.963-1.71-6.55-5.713-6.748-5.977-.197-.263-1.61-2.142-1.61-4.086 0-1.945 1.02-2.9 1.38-3.296.36-.395.79-.494 1.053-.494.263 0 .527.003.757.014.243.012.568-.092.89.68.33.79 1.12 2.735 1.218 2.933.099.197.165.428.033.69-.132.263-.197.428-.395.658-.198.23-.416.515-.593.692-.197.197-.403.412-.173.806.23.395 1.022 1.687 2.194 2.732 1.508 1.345 2.78 1.762 3.175 1.96.395.197.625.164.855-.1.23-.263.987-1.152 1.25-1.547.264-.395.527-.33.889-.197.362.131 2.303 1.086 2.698 1.284.395.197.658.296.757.46.1.165.1.954-.23 1.881Z" />
    </svg>
  );
}

export function FloatingSocials() {
  const { settings } = useStore();
  const whatsappHref = buildGeneralWhatsAppUrl(settings.whatsappNumber);
  const instagramHref = safeExternalUrl(settings.instagramUrl || INSTAGRAM_PROFILE_URL);

  return (
    <div
      aria-label="Direct social channels"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col items-end gap-3.5 pointer-events-none"
    >
      {/* Floating Instagram Button (positioned neatly above WhatsApp) */}
      <motion.a
        href={instagramHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow Modern Jewellers on Instagram"
        initial={{ opacity: 0, y: 18, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        whileHover={{ y: -2, scale: 1.06 }}
        whileTap={{ scale: 0.96 }}
        className="pointer-events-auto group relative w-12 h-12 rounded-full bg-[#FFFFFF]/95 backdrop-blur-md border border-[#C6A66B]/60 flex items-center justify-center shadow-[0_8px_24px_rgba(41,41,41,0.14)] hover:border-[#C6A66B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66B]"
      >
        <InstagramLogoSvg className="w-6 h-6 rounded-md" />
        <span className="hidden md:block pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute right-14 px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E9DFCE] shadow-md text-[11px] font-semibold tracking-[0.12em] uppercase text-[#292929] whitespace-nowrap">
          Instagram
        </span>
      </motion.a>

      {/* Floating WhatsApp Button (official green logo + subtle float & glow) */}
      <motion.a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with Modern Jewellers"
        initial={{ opacity: 0, y: 18, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: [0, -4, 0],
          scale: 1,
        }}
        transition={{
          opacity: { duration: 0.45, delay: 0.1 },
          scale: { duration: 0.45, delay: 0.1 },
          y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut' },
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        className="pointer-events-auto group relative w-13 h-13 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_10px_26px_rgba(37,211,102,0.38)] hover:shadow-[0_12px_32px_rgba(37,211,102,0.55)] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292929]"
      >
        <WhatsAppLogoSvg className="w-7 h-7" />
        <span className="hidden md:block pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute right-16 px-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E9DFCE] shadow-md text-[11px] font-semibold tracking-[0.12em] uppercase text-[#292929] whitespace-nowrap">
          WhatsApp
        </span>
      </motion.a>
    </div>
  );
}
