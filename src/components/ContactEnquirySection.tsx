import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { buildEnquiryWhatsAppUrl } from '../lib/whatsapp';
import { RevealBlock } from './MotionPrimitives';

export function ContactEnquirySection() {
  const { settings, categories, products, preselectedInterest } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState(preselectedInterest || 'Bridal Necklace Sets');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; interest?: string }>({});
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedInterest) {
      setInterest(preselectedInterest);
    }
  }, [preselectedInterest]);

  const interestOptions = [
    ...categories.map((c) => c.name),
    ...products.map((p) => p.name),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { name?: string; phone?: string; interest?: string } = {};

    if (name.trim().length < 2) {
      nextErrors.name = 'Please enter your full name.';
    }
    const digitsOnly = phone.replace(/[^\d]/g, '');
    if (digitsOnly.length < 10) {
      nextErrors.phone = 'Please enter a valid 10-digit phone or WhatsApp number.';
    }
    if (!interest.trim()) {
      nextErrors.interest = 'Please select a collection or jewellery piece.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const url = buildEnquiryWhatsAppUrl(settings.whatsappNumber, {
      name: name.trim(),
      phone: phone.trim(),
      interest: interest.trim(),
      message: message.trim(),
    });
    setSubmittedUrl(url);
  };

  return (
    <section
      id="contact"
      className="py-20 sm:py-28 bg-[#F8F5EF] text-[#292929] border-b border-[#E9DFCE]"
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <RevealBlock className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Showroom Visit Details */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-xs tracking-[0.22em] uppercase text-[#7D602B] mb-3 font-semibold">
                Private Consultation
              </p>
              <h2
                className="font-editorial text-[#292929] font-normal leading-[1.08]"
                style={{ fontSize: 'clamp(2.1rem, 4vw, 3.25rem)' }}
              >
                Enquire With Our Showroom
              </h2>
              <p className="mt-4 text-base text-[#5A544B] leading-relaxed">
                Share the piece or collection you have in mind. Our jewellery specialists in Sri
                Muktsar Sahib respond promptly on WhatsApp with detailed specifications, sizing, and
                appointment slots.
              </p>
            </div>

            <div className="mt-10 pt-8 border-t border-[#E9DFCE] space-y-5 text-sm text-[#292929]">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-4 h-4 text-[#7D602B] mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[#292929]">Showroom Address</p>
                  <p className="text-[#5A544B] mt-0.5">{settings.storeAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Phone className="w-4 h-4 text-[#7D602B] mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[#292929]">WhatsApp & Direct Desk</p>
                  <p className="text-[#5A544B] mt-0.5 tabular-nums">{settings.phoneDisplay}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Clock className="w-4 h-4 text-[#7D602B] mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-[#292929]">Showroom Hours</p>
                  <p className="text-[#5A544B] mt-0.5">{settings.openingHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Validated WhatsApp Enquiry Form */}
          <div className="lg:col-span-7 rounded-2xl bg-[#FFFFFF] border border-[#E9DFCE] p-6 sm:p-10 shadow-[0_14px_40px_rgba(41,41,41,0.05)]">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="enquiry-name"
                    className="block text-xs tracking-[0.14em] uppercase text-[#5A544B] font-semibold mb-2"
                  >
                    Your Name *
                  </label>
                  <input
                    id="enquiry-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSubmittedUrl(null);
                    }}
                    placeholder="e.g., Simranjit Kaur"
                    className="w-full min-h-[46px] px-4 rounded-lg bg-[#F8F5EF]/60 border border-[#E9DFCE] text-[#292929] placeholder:text-[#5A544B]/50 text-sm focus:outline-none focus:border-[#C6A66B] focus:bg-[#FFFFFF]"
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-700 font-medium" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="enquiry-phone"
                    className="block text-xs tracking-[0.14em] uppercase text-[#5A544B] font-semibold mb-2"
                  >
                    Phone / WhatsApp Number *
                  </label>
                  <input
                    id="enquiry-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setSubmittedUrl(null);
                    }}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full min-h-[46px] px-4 rounded-lg bg-[#F8F5EF]/60 border border-[#E9DFCE] text-[#292929] placeholder:text-[#5A544B]/50 text-sm tabular-nums focus:outline-none focus:border-[#C6A66B] focus:bg-[#FFFFFF]"
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-red-700 font-medium" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="enquiry-interest"
                  className="block text-xs tracking-[0.14em] uppercase text-[#5A544B] font-semibold mb-2"
                >
                  Product or Collection Interest *
                </label>
                <input
                  id="enquiry-interest"
                  list="jewellery-interest-list"
                  value={interest}
                  onChange={(e) => {
                    setInterest(e.target.value);
                    setSubmittedUrl(null);
                  }}
                  placeholder="Select or type a jewellery piece..."
                  className="w-full min-h-[46px] px-4 rounded-lg bg-[#F8F5EF]/60 border border-[#E9DFCE] text-[#292929] placeholder:text-[#5A544B]/50 text-sm focus:outline-none focus:border-[#C6A66B] focus:bg-[#FFFFFF]"
                />
                <datalist id="jewellery-interest-list">
                  {Array.from(new Set(interestOptions)).map((opt) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
                {errors.interest && (
                  <p className="mt-1.5 text-xs text-red-700 font-medium" role="alert">
                    {errors.interest}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="enquiry-message"
                  className="block text-xs tracking-[0.14em] uppercase text-[#5A544B] font-semibold mb-2"
                >
                  Message & Preferred Viewing Date
                </label>
                <textarea
                  id="enquiry-message"
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setSubmittedUrl(null);
                  }}
                  placeholder="Share occasion details, preferred metal purity, or custom sizing requests..."
                  className="w-full p-4 rounded-lg bg-[#F8F5EF]/60 border border-[#E9DFCE] text-[#292929] placeholder:text-[#5A544B]/50 text-sm focus:outline-none focus:border-[#C6A66B] focus:bg-[#FFFFFF] resize-y"
                />
              </div>

              {submittedUrl ? (
                <div className="p-5 rounded-xl border border-[#C6A66B] bg-[#F8F5EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-5 h-5 text-[#7D602B] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#292929]">
                        Your WhatsApp enquiry is ready
                      </p>
                      <p className="text-xs text-[#5A544B] mt-0.5">
                        Click below to send your prefilled message directly to {settings.brandName}.
                      </p>
                    </div>
                  </div>

                  <a
                    href={submittedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-lg bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.14em] uppercase font-semibold hover:bg-[#B29155] transition-colors whitespace-nowrap shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Open WhatsApp</span>
                  </a>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 min-h-[48px] px-8 py-3 rounded-lg bg-[#C6A66B] text-[#FFFFFF] text-xs tracking-[0.16em] uppercase font-semibold hover:bg-[#B29155] transition-colors shadow-[0_8px_20px_rgba(198,166,107,0.28)]"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>Prepare WhatsApp Enquiry</span>
                </button>
              )}
            </form>
          </div>
        </RevealBlock>
      </div>
    </section>
  );
}
