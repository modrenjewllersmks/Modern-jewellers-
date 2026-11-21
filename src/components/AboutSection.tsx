import React from 'react';
import { useStore } from '../context/StoreContext';
import { LuxuryImage } from './LuxuryImage';
import { RevealBlock } from './MotionPrimitives';

export function AboutSection() {
  const { settings } = useStore();

  return (
    <section
      id="about"
      className="py-20 sm:py-28 bg-[#FFFFFF] text-[#292929] border-b border-[#E9DFCE]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <RevealBlock className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch">
          {/* Editorial Atelier Visual */}
          <div className="lg:col-span-5">
            <div className="h-full min-h-[340px] rounded-2xl border border-[#E9DFCE] bg-[#F8F5EF] overflow-hidden shadow-[0_14px_38px_rgba(41,41,41,0.06)]">
              <LuxuryImage
                src={settings.aboutImageUrl}
                alt="Master goldsmith crafting fine 22K gold jewellery"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Brand Story & Craftsmanship Pillars */}
          <div className="lg:col-span-7 flex flex-col justify-between py-2">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase text-[#7D602B] mb-3 font-semibold">
                About {settings.brandName}
              </p>
              <h2
                className="font-editorial text-[#292929] font-normal leading-[1.08]"
                style={{ fontSize: 'clamp(2.1rem, 4vw, 3.35rem)' }}
              >
                {settings.aboutHeadline}
              </h2>
              <p className="mt-5 text-base sm:text-lg text-[#5A544B] leading-relaxed max-w-2xl">
                {settings.aboutIntro}
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-[#E9DFCE] grid grid-cols-1 sm:grid-cols-3 gap-6">
              {settings.aboutPillars.map((pillar, idx) => (
                <div
                  key={pillar.id}
                  className="p-5 rounded-xl bg-[#F8F5EF] border border-[#E9DFCE]/80 flex flex-col gap-2"
                >
                  <span className="text-xs text-[#7D602B] tabular-nums font-semibold tracking-wider">
                    0{idx + 1}.
                  </span>
                  <h3 className="font-editorial text-xl text-[#292929] font-medium">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-[#5A544B] leading-relaxed">{pillar.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}
