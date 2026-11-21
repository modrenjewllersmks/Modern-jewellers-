export type VideoOrientation = 'landscape' | 'portrait';

export interface VideoClip {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl: string;
  orientation: VideoOrientation;
  durationSeconds: number;
  sortOrder: number;
  optionalPrice?: string;
  enquiryMessage?: string;
}

export interface JewelleryProduct {
  id: string;
  productCode: string;
  name: string;
  category: string;
  description: string;
  demoPriceInr: number;
  priceLabel: string;
  priceOnRequest: boolean;
  metalPurity: string;
  imageUrl: string;
  featured: boolean;
  sortOrder: number;
}

export interface CartItem {
  product: JewelleryProduct;
  quantity: number;
}

export interface CollectionCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
}

export interface ShowroomImage {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
}

export interface CraftPillar {
  id: string;
  title: string;
  summary: string;
}

export interface SiteSettings {
  brandName: string;
  locationLabel: string;
  heroHeadline: string;
  heroSubheading: string;
  heroVideoUrl: string;
  heroPosterUrl: string;
  showroomHeadline: string;
  showroomDescription: string;
  showroomImages: ShowroomImage[];
  aboutHeadline: string;
  aboutIntro: string;
  aboutImageUrl: string;
  aboutPillars: CraftPillar[];
  whatsappNumber: string;
  phoneDisplay: string;
  instagramUrl: string;
  mapsUrl: string;
  storeAddress: string;
  openingHours: string;
}

export interface UploadProgressState {
  active: boolean;
  percent: number;
  fileName: string;
  error: string | null;
}
