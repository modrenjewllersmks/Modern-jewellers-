import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ArrowDownRight, MessageCircle, Play } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { buildGeneralWhatsAppUrl } from '../lib/whatsapp';

export function HeroSection() {
  const { settings } = useStore();
  const [videoFailed, setVideoFailed] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Gentle GPU-only parallax on the hero media frame
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  const whatsappUrl = buildGeneralWhatsAppUrl(
    settings.whatsappNumber,
    `Hello ${settings.brandName}, I would like to explore your jewellery collections and book a private consultation.`
  );

  const scrollToCollections = () => {
    document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToBridalFilms = () => {
    document.getElementById('bridal-films')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative bg-[#FFFFFF] text-[#292929] pt-24 pb-14 sm:pt-28 sm:pb-20 lg:min-h-[92svh] flex items-center border-b border-[#E9DFCE]"
    >
      <div className="max-w-7xl mx-auto w-full px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Editorial Typography Column */}
          <div className="lg:col-span-6 flex flex-col justify-center py-2 sm:py-6">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs sm:text-sm tracking-[0.22em] uppercase text-[#7D602B] font-semibold mb-4"
            >
              {settings.locationLabel}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-editorial text-[#292929] font-normal leading-[1.03] tracking-[-0.015em]"
              style={{ fontSize: 'clamp(2.65rem, 5vw, 4.5rem)' }}
            >
              {settings.heroHeadline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 text-base sm:text-lg text-[#5A544B] leading-relaxed max-w-xl"
            >
              {settings.heroSubheading}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5"
            >
              <button
                type="button"
                onClick={scrollToCollections}
                className="inline-flex items-center gap-2.5 min-h-[48px] px-7 py-3 rounded-lg bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.16em] uppercase font-semibold hover:bg-[#B29155] transition-colors whitespace-nowrap shadow-[0_8px_24px_rgba(198,166,107,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292929]"
              >
                <span>Explore Collection</span>
                <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={scrollToBridalFilms}
                className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-lg border border-[#C6A66B] bg-[#F8F5EF] text-[#292929] text-xs tracking-[0.16em] uppercase font-semibold hover:bg-[#E9DFCE]/70 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A66B]"
              >
                <Play className="w-3.5 h-3.5 text-[#7D602B] fill-current" aria-hidden="true" />
                <span>Watch Bridal Films</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[48px] px-5 py-3 text-xs tracking-[0.14em] uppercase font-semibold text-[#7D602B] hover:text-[#292929] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>WhatsApp Enquiry</span>
              </a>
            </motion.div>

            {/* Fine Champagne Gold Editorial Rule */}
            <div className="mt-12 pt-6 border-t border-[#E9DFCE] flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#5A544B]">
              <span>22K Hallmarked Gold</span>
              <span aria-hidden="true" className="text-[#C6A66B]">
                ·
              </span>
              <span>Certified Natural Diamonds</span>
              <span aria-hidden="true" className="text-[#C6A66B]">
                ·
              </span>
              <span>Bridal Polki & Kundan Suites</span>
            </div>
          </div>

          {/* Right Framed Showroom Media Column */}
          <div className="lg:col-span-6 flex items-stretch">
            <div className="relative w-full min-h-[340px] sm:min-h-[440px] lg:min-h-[540px] rounded-2xl overflow-hidden border border-[#C6A66B]/45 bg-[#F8F5EF] shadow-[0_24px_60px_rgba(41,41,41,0.08)]">
              <motion.div
                style={{ y: mediaY }}
                className="w-full h-full will-change-transform"
              >
                {!videoFailed && settings.heroVideoUrl ? (
                  <video
                    key={settings.heroVideoUrl}
                    src={settings.heroVideoUrl}
                    poster={settings.heroPosterUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    onError={() => setVideoFailed(true)}
                    className="w-full h-full object-cover scale-[1.03]"
                  />
                ) : (
                  <img
                    src={settings.heroPosterUrl}
                    alt={`${settings.brandName} luxury showroom`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover scale-[1.03]"
                  />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
