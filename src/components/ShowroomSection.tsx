import React from 'react';
import { MapPin, MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { buildGeneralWhatsAppUrl, safeExternalUrl } from '../lib/whatsapp';
import { LuxuryImage } from './LuxuryImage';
import { RevealBlock } from './MotionPrimitives';

export function ShowroomSection() {
  const { settings } = useStore();

  const primaryShowroom = settings.showroomImages[0];
  const secondaryShowrooms = settings.showroomImages.slice(1);

  return (
    <section
      id="showroom"
      className="py-20 sm:py-28 bg-[#F8F5EF] text-[#292929] border-b border-[#E9DFCE]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Top Editorial Intro */}
        <RevealBlock className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-end mb-14">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-[0.22em] uppercase text-[#7D602B] mb-3 font-semibold">
              The Showroom Experience
            </p>
            <h2
              className="font-editorial text-[#292929] font-normal leading-[1.06]"
              style={{ fontSize: 'clamp(2.15rem, 4.2vw, 3.5rem)' }}
            >
              {settings.showroomHeadline}
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-base text-[#5A544B] leading-relaxed">
              {settings.showroomDescription}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3.5">
              <a
                href={buildGeneralWhatsAppUrl(
                  settings.whatsappNumber,
                  `Hello ${settings.brandName}, I would like to schedule a private visit to your Sri Muktsar Sahib showroom.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-lg bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.14em] uppercase font-semibold hover:bg-[#B29155] transition-colors shadow-[0_8px_20px_rgba(198,166,107,0.24)]"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" />
                <span>Book Private Visit</span>
              </a>

              <a
                href={safeExternalUrl(settings.mapsUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg border border-[#C6A66B]/60 bg-[#FFFFFF] text-[#292929] text-xs tracking-[0.14em] uppercase font-semibold hover:border-[#C6A66B] hover:bg-[#E9DFCE]/40 transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#7D602B]" aria-hidden="true" />
                <span>Get Directions</span>
              </a>
            </div>
          </div>
        </RevealBlock>

        {/* Architectural Showroom Gallery */}
        {primaryShowroom && (
          <RevealBlock className="mb-8 rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] overflow-hidden shadow-[0_12px_36px_rgba(41,41,41,0.05)]">
            <div className="aspect-[16/9] w-full overflow-hidden">
              <LuxuryImage
                src={primaryShowroom.imageUrl}
                alt={primaryShowroom.title}
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E9DFCE]">
              <div>
                <h3 className="font-editorial text-2xl text-[#292929]">
                  {primaryShowroom.title}
                </h3>
                <p className="mt-1 text-sm text-[#5A544B]">{primaryShowroom.caption}</p>
              </div>
              <span className="text-xs tracking-[0.14em] uppercase text-[#7D602B] font-semibold whitespace-nowrap">
                {settings.locationLabel}
              </span>
            </div>
          </RevealBlock>
        )}

        {secondaryShowrooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {secondaryShowrooms.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] overflow-hidden flex flex-col shadow-[0_8px_24px_rgba(41,41,41,0.04)]"
              >
                <div className="aspect-[16/10] w-full overflow-hidden">
                  <LuxuryImage
                    src={item.imageUrl}
                    alt={item.title}
                    containerClassName="w-full h-full"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 border-t border-[#E9DFCE]">
                  <h3 className="font-editorial text-2xl text-[#292929]">{item.title}</h3>
                  <p className="mt-1.5 text-sm text-[#5A544B] leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
