import type { CartItem, VideoClip } from '../types/jewellery';

export function sanitizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/[^\d]/g, '');
  return digits.length >= 8 ? digits : '919876543210';
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildVideoEnquiryWhatsAppUrl(whatsappNumber: string, clip: VideoClip): string {
  const cleanNumber = sanitizeWhatsAppNumber(whatsappNumber);
  const message =
    clip.enquiryMessage?.trim() ||
    `Hello Modern Jewellers, I watched your ${clip.title} video (${clip.category}) and would like to enquire about this jewellery set. Please share the details and price.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppUrl(
  whatsappNumber: string,
  productName: string,
  productCode?: string,
  demoPriceLabel?: string
): string {
  const cleanNumber = sanitizeWhatsAppNumber(whatsappNumber);
  const codeNote = productCode ? ` (ID: ${productCode})` : '';
  const priceNote = demoPriceLabel ? ` [Demo Catalogue Price: ${demoPriceLabel}]` : '';
  const message = `Hello Modern Jewellers, I am interested in ${productName}${codeNote}${priceNote}. Please share more details and live store pricing.`;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function buildCartWhatsAppOrderUrl(
  whatsappNumber: string,
  items: CartItem[],
  totalInr: number
): string {
  const cleanNumber = sanitizeWhatsAppNumber(whatsappNumber);
  const lines = [
    'Hello Modern Jewellers, I would like to place an enquiry / order for the following selected pieces:',
    '',
    ...items.map((item, idx) => {
      const unitLabel = item.product.priceOnRequest
        ? 'Price on Request'
        : formatInr(item.product.demoPriceInr);
      const lineTotal = item.product.priceOnRequest
        ? 'Price on Request'
        : formatInr(item.product.demoPriceInr * item.quantity);
      return `${idx + 1}. ${item.product.name} (${item.product.productCode}) — Qty: ${item.quantity} × ${unitLabel} = ${lineTotal}`;
    }),
    '',
    `Total Estimated Demo Amount: ${formatInr(totalInr)}`,
    '(Note: Demo catalogue estimate — please confirm final store pricing and availability.)',
  ];

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function buildGeneralWhatsAppUrl(whatsappNumber: string, customMessage?: string): string {
  const cleanNumber = sanitizeWhatsAppNumber(whatsappNumber);
  const message =
    customMessage ||
    'Hello Modern Jewellers, I would like to book a showroom consultation and learn more about your jewellery collections.';
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function buildEnquiryWhatsAppUrl(
  whatsappNumber: string,
  payload: {
    name: string;
    phone: string;
    interest: string;
    message: string;
  }
): string {
  const cleanNumber = sanitizeWhatsAppNumber(whatsappNumber);
  const lines = [
    'Hello Modern Jewellers, I would like to make an enquiry:',
    `Name: ${payload.name}`,
    `Phone: ${payload.phone}`,
    `Product / Collection Interest: ${payload.interest}`,
    payload.message ? `Message: ${payload.message}` : '',
  ].filter(Boolean);

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function isSafeHttpUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function safeExternalUrl(url: string, fallback = '#'): string {
  if (!url) return fallback;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : fallback;
  } catch {
    return fallback;
  }
}
