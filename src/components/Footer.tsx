import React, { useState } from 'react';
import { ExternalLink, MapPin, MessageCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { INSTAGRAM_PROFILE_URL } from '../data/defaultContent';
import { buildGeneralWhatsAppUrl, safeExternalUrl } from '../lib/whatsapp';
import { InstagramLogoSvg } from './FloatingSocials';

interface FooterProps {
  onOpenAdmin: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  const { settings } = useStore();
  const [privacyOpen, setPrivacyOpen] = useState(false);

  return (
    <footer className="bg-[#FFFFFF] text-[#292929] py-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E9DFCE]">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <p className="font-editorial text-3xl text-[#292929] tracking-wide">
              {settings.brandName}
            </p>
            <p className="mt-2 text-xs tracking-[0.18em] uppercase text-[#7D602B] font-semibold">
              {settings.locationLabel}
            </p>
            <p className="mt-4 text-sm text-[#5A544B] leading-relaxed max-w-sm">
              Fine gold, natural diamonds, and heritage bridal jewellery crafted for milestone
              celebrations and private family collections.
            </p>
          </div>

          {/* Showroom Location & Hours */}
          <div className="md:col-span-4 space-y-3 text-sm">
            <p className="text-xs tracking-[0.16em] uppercase text-[#7D602B] font-semibold">
              Showroom & Hours
            </p>
            <p className="text-[#292929]">{settings.storeAddress}</p>
            <p className="text-[#5A544B]">{settings.openingHours}</p>
            <a
              href={safeExternalUrl(settings.mapsUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase text-[#7D602B] font-semibold hover:text-[#292929] hover:underline pt-1"
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
              <span>View on Google Maps</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
          </div>

          {/* Direct Channels */}
          <div className="md:col-span-3 space-y-3 text-sm">
            <p className="text-xs tracking-[0.16em] uppercase text-[#7D602B] font-semibold">
              Connect
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={buildGeneralWhatsAppUrl(settings.whatsappNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#292929] hover:text-[#7D602B] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#C6A66B]" aria-hidden="true" />
                <span className="tabular-nums">WhatsApp: {settings.phoneDisplay}</span>
              </a>

              <a
                href={safeExternalUrl(settings.instagramUrl || INSTAGRAM_PROFILE_URL)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#292929] hover:text-[#7D602B] transition-colors"
              >
                <InstagramLogoSvg className="w-4 h-4 rounded" />
                <span>Instagram</span>
              </a>

              <button
                type="button"
                onClick={onOpenAdmin}
                className="text-left text-xs tracking-[0.12em] uppercase text-[#5A544B] hover:text-[#7D602B] font-semibold transition-colors pt-2"
              >
                Owner Admin Dashboard
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#5A544B]">
          <p>
            © {new Date().getFullYear()} {settings.brandName}, Sri Muktsar Sahib. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setPrivacyOpen(true)}
              className="hover:text-[#292929] transition-colors"
            >
              Privacy Policy
            </button>
            <a href="#top" className="hover:text-[#292929] transition-colors">
              Back to Top
            </a>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {privacyOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Privacy Policy"
          className="fixed inset-0 z-50 bg-[#292929]/45 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPrivacyOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] p-6 sm:p-8 text-[#292929] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E9DFCE]">
              <h3 className="font-editorial text-2xl text-[#292929]">Privacy Policy</h3>
              <button
                type="button"
                onClick={() => setPrivacyOpen(false)}
                aria-label="Close privacy policy"
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#292929] hover:bg-[#F8F5EF] hover:text-[#7D602B] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-[#5A544B] leading-relaxed">
              <p>
                {settings.brandName} respects your privacy. Enquiry details submitted on this
                website are formatted directly for your voluntary WhatsApp conversation with our
                showroom desk and are not sold or shared with third-party advertisers.
              </p>
              <p>
                For appointments, bespoke jewellery consultations, or data inquiries, please visit
                our showroom at {settings.storeAddress} or contact {settings.phoneDisplay}.
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
