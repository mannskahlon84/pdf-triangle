/**
 * Market Pilot AI — Enterprise Database-Ready Models
 * Compatible with PostgreSQL / Prisma / Drizzle ORM
 */

export interface User {
  id: string; // UUID
  email: string;
  name: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  organizationId: string;
  createdAt: string; // ISO-8601
  updatedAt: string;
}

export interface Organization {
  id: string; // UUID
  name: string;
  slug: string;
  plan: "SMB" | "AGENCY" | "ENTERPRISE";
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string; // UUID
  organizationId: string;
  name: string; // e.g., "Manpower Corp", "Urban Fitness", "Dental Care"
  industry: string;
  primaryColor: string; // Hex code
  accentColor: string;
  logoUrl: string;
  defaultAvatarId: string;
  defaultAvatarName: string;
  marketingTone: string;
  tagline: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeyframeTag {
  id: string;
  timestamp: number; // Seconds (e.g. 2, 8, 15)
  label: string; // e.g. "Safety equipment detected", "Team collaboration detected"
  confidence: number; // e.g. 98
  tags: string[];
}

export interface ProductAngleMeta {
  id: string;
  label: string;
  url: string;
  timestamp: number;
}

export interface MediaAsset {
  id: string; // UUID
  organizationId: string;
  brandId: string;
  title: string;
  type: "video" | "image";
  url: string;
  thumbnailUrl: string;
  duration?: number; // In seconds
  resolution?: string; // e.g. "1080p · 60fps"
  keyframes: KeyframeTag[];
  angles?: ProductAngleMeta[];
  isMultiAngle?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScriptSegmentMeta {
  id: string;
  start: number; // Seconds (e.g., 0)
  end: number; // Seconds (e.g., 5)
  speaker: "Avatar" | "Voiceover";
  text: string;
  visualCue: string;
}

export interface ScriptVersion {
  id: string; // UUID
  videoProjectId: string;
  title: string;
  hook: string; // e.g., "See how our team delivers quality service every day."
  problem: string;
  solution: string;
  benefits: string[];
  cta: string;
  segments: ScriptSegmentMeta[];
  tone: string;
  targetAudience: string;
  versionNumber: number;
  createdAt: string;
}

export interface VideoProject {
  id: string; // UUID
  organizationId: string;
  brandId: string;
  title: string;
  targetDuration: "15s" | "30s" | "60s";
  aspectRatio: "9:16" | "16:9" | "1:1";
  compositorMode: "pip" | "alternating";
  activeMediaId: string;
  activeScriptVersionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMemory {
  id: string; // UUID
  videoProjectId: string;
  userId: string;
  sender: "user" | "ai";
  text: string;
  metadata?: {
    keyframeFocused?: number;
    scriptVersionId?: string;
  };
  createdAt: string;
}

export type RenderJobStatus = "QUEUED" | "ANALYZING" | "SCRIPTING" | "AVATAR_PREP" | "COMPOSITING" | "COMPLETED" | "FAILED";

export interface RenderJob {
  id: string; // UUID
  videoProjectId: string;
  scriptVersionId: string;
  mediaAssetId: string;
  status: RenderJobStatus;
  progress: number; // 0 to 100
  stepText: string;
  outputUrl?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MODULE 6: INDIVIDUAL SELLER PRODUCT VIDEO CREATOR MODELS
// ============================================================================

export type ProductVideoTemplateType =
  | "Fashion Product"
  | "Food Product"
  | "Electronics"
  | "Beauty Product"
  | "Jewellery"
  | "Real Estate"
  | "Automotive"
  | "Restaurant Menu";

export interface ProductAngleImage {
  id: string;
  label: string; // e.g. "Front view", "Side view", "Inside view", "Close-up stitching view"
  url: string;
  timestamp: number; // For video timeline sequencing
}

export interface AIContentCopy {
  instagramCaption: string;
  tiktokCaption: string;
  youtubeShortsDescription: string;
  hashtags: string[];
  productTitle: string;
  advertisementCopy: string;
}

export interface AISalesSuggestion {
  bestCustomerSegment: string;
  sellingAngle: string;
  pricingPsychology: string;
  seasonalCampaigns: string[];
}

export interface ProductCatalogItem {
  id: string;
  sellerId: string;
  name: string; // e.g. "Premium Leather Bag", "Shoes", "Watch", "Perfume"
  price: string;
  category: ProductVideoTemplateType;
  features: string[];
  offerInfo: string;
  angles: ProductAngleImage[];
  detectedCategory: string;
  materials: string[];
  colors: string[];
  marketingPoints: string[]; // e.g. ["Premium leather finish", "Spacious interior", "Office and travel friendly"]
  generatedVideos: string[]; // URLs of rendered reels
  previousScripts: string[];
  aiContentCopy?: AIContentCopy;
  aiSalesSuggestion?: AISalesSuggestion;
  createdAt: string;
  updatedAt: string;
}

export type SaaSPricingTier =
  | "Free" // 5 videos/month
  | "Starter" // 50 videos/month
  | "Business" // Unlimited products
  | "Enterprise"; // Team workspace

// MODULE 7: AI Brand Promotion Creator & Industry Template Library
export type PromotionTargetType =
  | "business"
  | "product"
  | "website"
  | "app"
  | "social-profile"
  | "restaurant"
  | "shop"
  | "creator-channel"
  | "real-estate"
  | "hotel-hospitality"
  | "fitness-gym"
  | "education"
  | "salon-beauty"
  | "healthcare"
  | "recruitment"
  | "freelancer-personal-brand";

export type PromotionVideoTemplateType =
  | "Brand Introduction"
  | "Product Launch"
  | "Sale Announcement"
  | "App Launch"
  | "Restaurant Offer"
  | "Event Promotion"
  | "Recruitment Campaign"
  | "Influencer Growth"
  | "Property Showcase"
  | "Luxury Home Tour"
  | "Hotel Introduction"
  | "Transformation Story"
  | "Course Introduction"
  | "Service Showcase"
  | "Clinic Introduction"
  | "Portfolio Introduction";

export interface IndustryTemplate {
  id: string;
  industryName: string;
  promotionTypes: string[];
  requiredFields: string[];
  availableTemplates: string[];
  videoStyles: string[];
  ctaOptions: string[];
}


export interface PromotionVideoTimelineSegment {
  startSec: number;
  endSec: number;
  title: string;
  content: string;
  badge: string;
}

export interface PromotionCampaignPlan {
  campaignName: string;
  targetAudience: string;
  contentCalendar: {
    day: string;
    topic: string;
    platform: string;
    format: string;
  }[];
  videoIdeas: {
    title: string;
    hook: string;
    format: string;
    duration: string;
  }[];
  captions: {
    platform: "instagram" | "tiktok" | "youtube" | "linkedin";
    text: string;
    hashtags: string[];
  }[];
  hashtagStrategy: string[];
  adCopy: string;
}

export interface PromotionCampaign {
  id: string;
  name: string;
  targetType: PromotionTargetType;
  template: PromotionVideoTemplateType;
  inputData: {
    websiteUrl?: string;
    businessCategory?: string;
    targetAudience?: string;
    mainBenefits?: string[];
    appName?: string;
    appScreenshots?: string[];
    appLogo?: string;
    appFeatures?: string[];
    downloadLink?: string;
    socialProfileUrl?: string;
    socialPlatform?: "instagram" | "tiktok" | "youtube";
    restaurantMenu?: string[];
    location?: string;
    offers?: string;
    shopPhotos?: string[];
    creatorHandle?: string;
    existingTopics?: string[];
    customHeadline?: string;
  };
  aiCampaignPlan: PromotionCampaignPlan;
  timelineStructure: PromotionVideoTimelineSegment[];
  generatedVideoUrl?: string;
  createdAt: string;
  updatedAt: string;
}
