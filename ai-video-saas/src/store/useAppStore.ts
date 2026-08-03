import { create } from "zustand";
import {
  ProductCatalogItem,
  ProductVideoTemplateType,
  AIContentCopy,
  AISalesSuggestion,
  SaaSPricingTier,
  PromotionTargetType,
  PromotionCampaign,
} from "@/types/database";

export interface KeyframeInsight {
  id: string;
  timestamp: number; // in seconds
  label: string;
  description: string;
  valueProp: string;
  confidence: number;
}

export interface ProductAngle {
  id: string;
  label: string; // e.g., "Angle 1: Front Profile", "Angle 2: Side Detail", "Angle 3: Lifestyle View"
  url: string;
  timestamp: number; // in seconds (e.g. 2, 6, 10)
}

export interface MediaAsset {
  id: string;
  title: string;
  type: "video" | "image";
  url: string;
  thumbnailUrl: string;
  duration?: number;
  resolution?: string;
  brandId: string;
  keyframes: KeyframeInsight[];
  angles?: ProductAngle[];
  isMultiAngle?: boolean;
}

export interface ScriptSegment {
  id: string;
  start: number;
  end: number;
  speaker: "Avatar" | "Voiceover";
  text: string;
  visualCue: string;
}

export interface GeneratedScript {
  id: string;
  title: string;
  hook: string;
  cta: string;
  segments: ScriptSegment[];
  targetKeyframes: number[];
  tone: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  scriptSnapshot?: GeneratedScript;
  videoPreviewUrl?: string;
  keyframeFocused?: number;
}

export interface BrandProfile {
  id: string;
  name: string;
  industry: string;
  primaryColor: string;
  colorName: string;
  accentColor: string;
  logoUrl: string;
  defaultAvatarId: string;
  defaultAvatarName: string;
  defaultTone: string;
  tagline: string;
}

export interface ScheduledPost {
  id: string;
  title: string;
  videoId: string;
  thumbnailUrl: string;
  caption: string;
  platforms: string[];
  scheduledTime: string; // ISO date string
  status: "scheduled" | "published";
  views: number;
  engagementRate: number;
  clicks: number;
  shares: number;
}

export interface AppState {
  // Brands
  brands: BrandProfile[];
  activeBrandId: string;
  setActiveBrandId: (id: string) => void;
  updateBrand: (id: string, updates: Partial<BrandProfile>) => void;

  // Media & Multimodal Vision
  mediaLibrary: MediaAsset[];
  selectedMedia: MediaAsset | null;
  setSelectedMedia: (media: MediaAsset | null) => void;
  addUploadedMedia: (media: MediaAsset) => void;
  appendAngleToMedia: (
    mediaId: string,
    angle: { id: string; label: string; url: string; timestamp: number }
  ) => void;
  activeScrubberTime: number;
  setActiveScrubberTime: (time: number) => void;

  // Studio Settings
  compositorMode: "pip" | "alternating";
  setCompositorMode: (mode: "pip" | "alternating") => void;
  videoLength: "15s" | "30s" | "60s";
  setVideoLength: (len: "15s" | "30s" | "60s") => void;
  aspectRatio: "9:16" | "16:9" | "1:1";
  setAspectRatio: (ratio: "9:16" | "16:9" | "1:1") => void;
  promptText: string;
  setPromptText: (text: string) => void;

  // Current Generation
  currentScript: GeneratedScript | null;
  setCurrentScript: (script: GeneratedScript | null) => void;
  isGeneratingScript: boolean;
  setIsGeneratingScript: (val: boolean) => void;
  isRenderingVideo: boolean;
  setIsRenderingVideo: (val: boolean) => void;
  renderProgress: number;
  setRenderProgress: (val: number) => void;
  renderStepText: string;
  setRenderStepText: (text: string) => void;
  finishedVideoUrl: string | null;
  setFinishedVideoUrl: (url: string | null) => void;

  // Session Chat Memory
  chatMessages: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChatMemory: () => void;

  // Social Calendar & Scheduler
  scheduledPosts: ScheduledPost[];
  addScheduledPost: (post: ScheduledPost) => void;
  connectedPlatforms: {
    instagram: boolean;
    tiktok: boolean;
    youtube: boolean;
    metaAds: boolean;
  };
  togglePlatformConnection: (platform: "instagram" | "tiktok" | "youtube" | "metaAds") => void;

  // Module 6: Individual Seller Product Video Creator
  workspaceMode: "business" | "seller";
  setWorkspaceMode: (mode: "business" | "seller") => void;
  activeCreatorTab: "business" | "product";
  setActiveCreatorTab: (tab: "business" | "product") => void;
  sellerProducts: ProductCatalogItem[];
  activeProductId: string | null;
  setActiveProductId: (id: string | null) => void;
  addProductToCatalog: (product: ProductCatalogItem) => void;
  updateProductInCatalog: (id: string, updates: Partial<ProductCatalogItem>) => void;
  deleteProductFromCatalog: (id: string) => void;
  saasPlan: SaaSPricingTier;
  setSaaSPlan: (plan: SaaSPricingTier) => void;

  // Module 7: AI Brand Promotion Creator
  activePromotionType: PromotionTargetType;
  setActivePromotionType: (type: PromotionTargetType) => void;
  promotionCampaigns: PromotionCampaign[];
  activeCampaignId: string | null;
  setActiveCampaignId: (id: string | null) => void;
  addPromotionCampaign: (campaign: PromotionCampaign) => void;
  updatePromotionCampaign: (id: string, updates: Partial<PromotionCampaign>) => void;
  deletePromotionCampaign: (id: string) => void;
}

const DEMO_BRANDS: BrandProfile[] = [
  {
    id: "manpower",
    name: "Manpower Corp",
    industry: "Enterprise Engineering & Recruiter",
    primaryColor: "#6366f1",
    colorName: "Indigo",
    accentColor: "#4f46e5",
    logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop&q=80",
    defaultAvatarId: "alex",
    defaultAvatarName: "Alex - Corporate Recruiter",
    defaultTone: "Professional & Authoritative",
    tagline: "Connecting Fortune 500 tech leaders with elite talent worldwide.",
  },
  {
    id: "urban-fitness",
    name: "Urban Fitness",
    industry: "SMB Gym & High-Energy Wellness",
    primaryColor: "#10b981",
    colorName: "Emerald",
    accentColor: "#059669",
    logoUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=120&h=120&fit=crop&q=80",
    defaultAvatarId: "marcus",
    defaultAvatarName: "Marcus - Fitness Coach",
    defaultTone: "High-Energy & Gen-Z",
    tagline: "High-intensity functional training for modern athletes.",
  },
  {
    id: "smileone",
    name: "Dental Care",
    industry: "Healthcare & Patient Advocacy",
    primaryColor: "#0891b2",
    colorName: "Cyan",
    accentColor: "#0e7490",
    logoUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=120&h=120&fit=crop&q=80",
    defaultAvatarId: "sarah",
    defaultAvatarName: "Sarah - Patient Host",
    defaultTone: "Empathetic & Trustworthy",
    tagline: "Painless, state-of-the-art cosmetic and preventive dental care.",
  },
  {
    id: "shopkeeper",
    name: "Solo Shopkeeper & Retail",
    industry: "Individual E-Commerce & Retail Shopkeeper",
    primaryColor: "#f59e0b",
    colorName: "Amber",
    accentColor: "#d97706",
    logoUrl: "https://images.unsplash.com/photo-1556742049-0a67d55febc4?w=120&h=120&fit=crop&q=80",
    defaultAvatarId: "alex",
    defaultAvatarName: "Alex - Product Host",
    defaultTone: "Engaging & Sales-Driven",
    tagline: "Multi-angle product reels for independent store owners & single/multi-item sellers.",
  },
  {
    id: "product-seller",
    name: "Product Seller & D2C",
    industry: "Individual E-Commerce & D2C Brand",
    primaryColor: "#ec4899",
    colorName: "Pink",
    accentColor: "#db2777",
    logoUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&h=120&fit=crop&q=80",
    defaultAvatarId: "sarah",
    defaultAvatarName: "Sarah - Lifestyle Host",
    defaultTone: "Casual & Trendy",
    tagline: "High-converting social video reels for direct-to-consumer product sellers.",
  },
  {
    id: "freelancer",
    name: "Freelance Video Creator",
    industry: "Independent Freelancer & Agency",
    primaryColor: "#8b5cf6",
    colorName: "Violet",
    accentColor: "#7c3aed",
    logoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&q=80",
    defaultAvatarId: "alex",
    defaultAvatarName: "Alex - Creative Producer",
    defaultTone: "Creative & Energetic",
    tagline: "Turn raw client product clips into polished social media ads in seconds.",
  },
  {
    id: "creator",
    name: "Creator Pro Studio",
    industry: "Content Creator & Influencer",
    primaryColor: "#10b981",
    colorName: "Emerald",
    accentColor: "#059669",
    logoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80",
    defaultAvatarId: "marcus",
    defaultAvatarName: "Marcus - Viral Host",
    defaultTone: "Viral & Fast-Paced",
    tagline: "Dynamic TikTok & Reels product reviews for solo online creators.",
  },
];

const DEMO_MEDIA: MediaAsset[] = [
  {
    id: "media-tech-lab",
    title: "Precision Tech & Robotics Lab (MP4)",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-a-motherboard-41618-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&h=340&fit=crop&q=80",
    duration: 15,
    resolution: "1080p · 60fps",
    brandId: "manpower",
    keyframes: [
      {
        id: "kf-1",
        timestamp: 2,
        label: "Safety Gear Compliance",
        description: "Technician wearing OSHA-approved eye protection and ESD grounding wrist straps.",
        valueProp: "Emphasize strict safety standards and zero-accident compliance records.",
        confidence: 98,
      },
      {
        id: "kf-2",
        timestamp: 8,
        label: "Precision Assembly Process",
        description: "Engineer calibrating micro-components on high-density circuit board.",
        valueProp: "Highlight elite technical precision and specialized robotics skillsets.",
        confidence: 96,
      },
      {
        id: "kf-3",
        timestamp: 13,
        label: "Collaborative Team Review",
        description: "Senior lead mentoring junior technician on diagnostics display.",
        valueProp: "Showcase collaborative mentorship and rapid on-site problem solving.",
        confidence: 94,
      },
    ],
  },
  {
    id: "media-warehouse",
    title: "Automated Logistics & Warehouse (MP4)",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-worker-walking-in-a-warehouse-with-boxes-42045-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=340&fit=crop&q=80",
    duration: 15,
    resolution: "1080p · 30fps",
    brandId: "manpower",
    keyframes: [
      {
        id: "kf-4",
        timestamp: 3,
        label: "Smart Inventory Tracking",
        description: "Logistics specialist scanning RFID barcodes on automated conveyor.",
        valueProp: "Demonstrate 99.9% inventory accuracy and automated dispatch speed.",
        confidence: 97,
      },
      {
        id: "kf-5",
        timestamp: 9,
        label: "Ergonomic Handling",
        description: "Staff utilizing robotic lift assist for heavy cargo crates.",
        valueProp: "Spotlight ergonomic employee welfare and modern industrial tools.",
        confidence: 95,
      },
    ],
  },
  {
    id: "media-gym",
    title: "High-Intensity Functional Training (MP4)",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-man-working-out-with-a-battle-rope-in-a-gym-22879-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&h=340&fit=crop&q=80",
    duration: 15,
    resolution: "4K · 60fps",
    brandId: "urban-fitness",
    keyframes: [
      {
        id: "kf-6",
        timestamp: 4,
        label: "Explosive Battle Ropes",
        description: "Athlete executing high-RPM functional cardio conditioning.",
        valueProp: "Focus on calorie-torching metabolic conditioning and stamina.",
        confidence: 99,
      },
      {
        id: "kf-7",
        timestamp: 11,
        label: "Personal Coach Motivation",
        description: "Lead trainer providing real-time form correction and cadence cues.",
        valueProp: "Spotlight personalized coaching and high-energy community support.",
        confidence: 97,
      },
    ],
  },
  {
    id: "media-dental",
    title: "State-of-the-Art Dental Imaging (MP4)",
    type: "video",
    url: "https://assets.mixkit.co/videos/preview/mixkit-dentist-working-on-a-patient-42352-large.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&h=340&fit=crop&q=80",
    duration: 15,
    resolution: "1080p · 60fps",
    brandId: "smileone",
    keyframes: [
      {
        id: "kf-8",
        timestamp: 3,
        label: "3D Digital Scan Diagnostics",
        description: "Dentist reviewing painless digital impressions on 4K medical display.",
        valueProp: "Highlight zero-radiation digital precision and comfortable patient visits.",
        confidence: 98,
      },
    ],
  },
  {
    id: "media-flyer",
    title: "2026 Tech Leadership Hiring Banner (PNG)",
    type: "image",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=340&fit=crop&q=80",
    brandId: "manpower",
    keyframes: [
      {
        id: "kf-9",
        timestamp: 0,
        label: "Visual Contrast & Header OCR",
        description: "Detected bold typography: 'Elite Engineering Teams Fast-Tracked'.",
        valueProp: "Focus on speed-to-hire for senior software architects.",
        confidence: 95,
      },
    ],
  },
  {
    id: "media-watch-multi",
    title: "ProSeries X1 Smartwatch — 3-Angle Product Showcase (JPG/PNG)",
    type: "image",
    url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop&q=80",
    brandId: "shopkeeper",
    isMultiAngle: true,
    angles: [
      {
        id: "ang-1",
        label: "Angle 1: Front Sapphire Glass Face",
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&q=80",
        timestamp: 2,
      },
      {
        id: "ang-2",
        label: "Angle 2: Side Crown & Titanium Bezel",
        url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=800&fit=crop&q=80",
        timestamp: 6,
      },
      {
        id: "ang-3",
        label: "Angle 3: On-Wrist Lifestyle Sport Mode",
        url: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&h=800&fit=crop&q=80",
        timestamp: 10,
      },
    ],
    keyframes: [
      {
        id: "kf-10",
        timestamp: 2,
        label: "Angle 1: Front Glass Face",
        description: "High-resolution front view showing sapphire crystal display and health UI.",
        valueProp: "Spotlight zero-scratch durability and always-on OLED biometric screen.",
        confidence: 99,
      },
      {
        id: "kf-11",
        timestamp: 6,
        label: "Angle 2: Titanium Side Crown",
        description: "Macro profile showing precision aerospace-grade titanium bezel and haptic crown.",
        valueProp: "Highlight military-grade toughness and tactile rotary navigation.",
        confidence: 98,
      },
      {
        id: "kf-12",
        timestamp: 10,
        label: "Angle 3: Active Sport Lifestyle",
        description: "Dynamic shot of smartwatch worn during outdoor endurance training.",
        valueProp: "Demonstrate 50M water resistance and real-time GPS marathon tracking.",
        confidence: 97,
      },
    ],
  },
  {
    id: "media-drone-multi",
    title: "Lumina 4K Drone — 3-Angle Product Showcase (JPG/JPEG)",
    type: "image",
    url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&h=800&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=600&h=600&fit=crop&q=80",
    brandId: "shopkeeper",
    isMultiAngle: true,
    angles: [
      {
        id: "ang-d1",
        label: "Angle 1: Top Hover Profile",
        url: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&h=800&fit=crop&q=80",
        timestamp: 2,
      },
      {
        id: "ang-d2",
        label: "Angle 2: 4K Gimbal Camera Detail",
        url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&h=800&fit=crop&q=80",
        timestamp: 6,
      },
      {
        id: "ang-d3",
        label: "Angle 3: In-Flight Aerial Action",
        url: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&h=800&fit=crop&q=80",
        timestamp: 10,
      },
    ],
    keyframes: [
      {
        id: "kf-13",
        timestamp: 2,
        label: "Angle 1: Aerodynamic Carbon Body",
        description: "Top-down view of lightweight carbon-fiber chassis and brushless rotors.",
        valueProp: "Highlight 45-minute battery endurance and whisper-quiet propulsion.",
        confidence: 98,
      },
      {
        id: "kf-14",
        timestamp: 6,
        label: "Angle 2: 3-Axis 4K Gimbal",
        description: "Close-up of stabilized 1-inch CMOS camera sensor assembly.",
        valueProp: "Emphasize cinema-grade 4K60 HDR video and obstacle avoidance sensors.",
        confidence: 99,
      },
      {
        id: "kf-15",
        timestamp: 10,
        label: "Angle 3: High-Altitude Action",
        description: "Wide angle showing drone tracking subject across rugged terrain.",
        valueProp: "Showcase AI ActiveTrack 5.0 and 10km OcuSync video transmission.",
        confidence: 97,
      },
    ],
  },
  {
    id: "media-wallet-multi",
    title: "Artisanal Bifold Leather Wallet — 3-Angle Showcase (JPG/PNG)",
    type: "image",
    url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop&q=80",
    brandId: "shopkeeper",
    isMultiAngle: true,
    angles: [
      {
        id: "ang-w1",
        label: "Angle 1: Front Full-Grain Leather Profile",
        url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop&q=80",
        timestamp: 2,
      },
      {
        id: "ang-w2",
        label: "Angle 2: Interior Card Slots & Cash Pocket",
        url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&q=80",
        timestamp: 6,
      },
      {
        id: "ang-w3",
        label: "Angle 3: Handcrafted Saddle Stitching Macro",
        url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop&q=80",
        timestamp: 10,
      },
    ],
    keyframes: [
      {
        id: "kf-w1",
        timestamp: 2,
        label: "Angle 1: Full-Grain Leather Exterior",
        description: "Front product view emphasizing vegetable-tanned full-grain leather.",
        valueProp: "Spotlight authentic craftsmanship and developing patina over time.",
        confidence: 99,
      },
      {
        id: "kf-w2",
        timestamp: 6,
        label: "Angle 2: Functional Interior & RFID",
        description: "Interior layout view showing 8 card slots and RFID protection layer.",
        valueProp: "Highlight everyday utility and digital security features.",
        confidence: 98,
      },
      {
        id: "kf-w3",
        timestamp: 10,
        label: "Angle 3: Artisan Hand Stitching",
        description: "Macro zoom on reinforced waxed-thread edge stitching.",
        valueProp: "Emphasize lifetime durability and premium retail quality.",
        confidence: 97,
      },
    ],
  },
  {
    id: "media-shopkeeper-combo",
    title: "Summer Retail Lineup — 3 Single Products Combo Reel (JPG/PNG)",
    type: "image",
    url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&h=600&fit=crop&q=80",
    brandId: "shopkeeper",
    isMultiAngle: true,
    angles: [
      {
        id: "ang-c1",
        label: "Product 1: Polarized Aviator Sunglasses (JPG)",
        url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop&q=80",
        timestamp: 2,
      },
      {
        id: "ang-c2",
        label: "Product 2: Titanium Chronograph Watch (JPG)",
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&q=80",
        timestamp: 6,
      },
      {
        id: "ang-c3",
        label: "Product 3: Minimalist Leather Wallet (PNG)",
        url: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&h=800&fit=crop&q=80",
        timestamp: 10,
      },
    ],
    keyframes: [
      {
        id: "kf-c1",
        timestamp: 2,
        label: "Product 1: Polarized Aviators",
        description: "Single product showcase of UV400 polarized aviator sunglasses.",
        valueProp: "Convert summer accessory shoppers with high-contrast glare reduction.",
        confidence: 99,
      },
      {
        id: "kf-c2",
        timestamp: 6,
        label: "Product 2: Titanium Chronograph",
        description: "Single product showcase of scratch-resistant titanium chronograph watch.",
        valueProp: "Upsell premium men's accessory with precision Japanese movement.",
        confidence: 98,
      },
      {
        id: "kf-c3",
        timestamp: 10,
        label: "Product 3: Artisan Leather Wallet",
        description: "Single product showcase of handcrafted bifold leather wallet.",
        valueProp: "Drive bundle discounts and multi-item shopping cart add-ons.",
        confidence: 97,
      },
    ],
  },
];

const DEMO_SELLER_PRODUCTS: ProductCatalogItem[] = [
  {
    id: "prod-leather-bag",
    sellerId: "shopkeeper",
    name: "Premium Leather Bag",
    price: "$129.99",
    category: "Fashion Product",
    features: [
      "Full-grain Italian leather finish",
      "Spacious laptop & travel interior",
      "Waterproof reinforced lining",
      "Office and travel friendly design",
    ],
    offerInfo: "20% OFF Summer Sale - Free Worldwide Shipping",
    angles: [
      {
        id: "ang-lb-1",
        label: "Front view",
        url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop&q=80",
        timestamp: 2,
      },
      {
        id: "ang-lb-2",
        label: "Side view",
        url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=800&fit=crop&q=80",
        timestamp: 5,
      },
      {
        id: "ang-lb-3",
        label: "Inside view",
        url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop&q=80",
        timestamp: 9,
      },
      {
        id: "ang-lb-4",
        label: "Close-up stitching view",
        url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop&q=80",
        timestamp: 12,
      },
    ],
    detectedCategory: "Leather handbag",
    materials: ["Full-grain Italian cowhide", "Waxed nylon stitching", "Solid brass hardware"],
    colors: ["Cognac Brown", "Midnight Black", "Saddle Tan"],
    marketingPoints: [
      "✓ Premium leather finish",
      "✓ Spacious interior",
      "✓ Office and travel friendly",
    ],
    generatedVideos: [
      "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-leather-bag-43407-large.mp4",
    ],
    previousScripts: [
      "Upgrade your style with premium leather. Handcrafted full-grain finish with spacious interior. Order now and get 20% OFF!",
    ],
    aiContentCopy: {
      instagramCaption:
        "Upgrade your style with premium leather. Handcrafted full-grain Italian leather bag designed for office and travel. 👜✨ Tag someone who needs this upgrade! #PremiumLeather #TravelBag #EverydayLuxury #LeatherHandbag",
      tiktokCaption:
        "Why this leather bag is taking over TikTok 😍 Waterproof interior + lifetime brass hardware. Get 20% OFF today! #LeatherBag #StyleUpgrade #FashionFinds",
      youtubeShortsDescription:
        "Looking for a versatile leather handbag that transitions from office to travel? Check out our Premium Leather Bag with full-grain Italian finish and spacious interior.",
      hashtags: [
        "#PremiumLeather",
        "#FashionProduct",
        "#LeatherBag",
        "#StyleUpgrade",
        "#EverydayLuxury",
        "#TravelFriendly",
      ],
      productTitle: "Premium Full-Grain Italian Leather Handbag & Travel Tote",
      advertisementCopy:
        "Upgrade your style with premium leather. Built for daily commuters and weekend travelers with 100% full-grain cowhide and waterproof lining. Order now and claim 20% OFF with Free Worldwide Shipping.",
    },
    aiSalesSuggestion: {
      bestCustomerSegment: "Urban commuters, fashion-conscious professionals, and weekend travelers aged 24–45",
      sellingAngle: "Luxury craft at accessible direct-to-consumer price point with lifetime durability",
      pricingPsychology: "Charm pricing ($129.99) + limited-time 20% OFF bundle incentive",
      seasonalCampaigns: [
        "Back-to-Office Commuter Promo",
        "Fall Weekend Getaway Campaign",
        "Holiday Gifting Luxury Bundle",
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-shoes",
    sellerId: "shopkeeper",
    name: "Shoes",
    price: "$89.99",
    category: "Fashion Product",
    features: [
      "Ultralight EVA memory foam sole",
      "Breathable knit mesh exterior",
      "All-weather anti-slip tread",
    ],
    offerInfo: "Buy 1 Get 2nd Pair 30% OFF",
    angles: [
      {
        id: "ang-sh-1",
        label: "Front Profile",
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop&q=80",
        timestamp: 2,
      },
      {
        id: "ang-sh-2",
        label: "Sole Tread Detail",
        url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&h=800&fit=crop&q=80",
        timestamp: 6,
      },
      {
        id: "ang-sh-3",
        label: "On-Foot Street View",
        url: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=800&h=800&fit=crop&q=80",
        timestamp: 10,
      },
    ],
    detectedCategory: "Performance lifestyle sneaker",
    materials: ["Knit mesh fiber", "EVA foam sole", "Eco-friendly TPU accents"],
    colors: ["Crimson Red", "Triple White", "Stealth Grey"],
    marketingPoints: [
      "✓ Cloud-like memory foam comfort",
      "✓ Zero-blister breathable knit",
      "✓ Street style versatility",
    ],
    generatedVideos: [],
    previousScripts: [
      "Step into all-day comfort with breathable knit sneakers. Ultralight EVA foam for your daily hustle. Visit our store!",
    ],
    aiContentCopy: {
      instagramCaption:
        "Step into cloud-like comfort 👟✨ Ultralight knit sneakers built for all-day wear. Buy 1 get 2nd pair 30% OFF! #Sneakerhead #StreetStyle #ComfortShoes",
      tiktokCaption:
        "The most comfortable sneakers on TikTok? Test walking in these memory foam kicks 👟🔥 #Shoes #Sneakers #DailyStyle",
      youtubeShortsDescription:
        "Discover our breathable knit lifestyle sneakers with ultralight EVA memory foam sole.",
      hashtags: ["#Sneakers", "#FashionProduct", "#StreetStyle", "#DailyHustle", "#Footwear"],
      productTitle: "Ultralight Knit Lifestyle & Performance Sneakers",
      advertisementCopy:
        "Experience zero foot fatigue with our Ultralight EVA Memory Foam Sneakers. Designed for urban commuters and fitness enthusiasts.",
    },
    aiSalesSuggestion: {
      bestCustomerSegment: "Active urban professionals, fitness lifestyle enthusiasts, sneaker buyers",
      sellingAngle: "All-day orthopedic comfort without sacrificing streetwear aesthetics",
      pricingPsychology: "BOGO 30% OFF upsell incentive to increase average order value (AOV)",
      seasonalCampaigns: ["Spring Walkabout Special", "Summer Fitness Push"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-watch",
    sellerId: "shopkeeper",
    name: "Watch",
    price: "$249.00",
    category: "Jewellery",
    features: [
      "Sapphire crystal anti-scratch glass",
      "Grade-5 Aerospace Titanium Bezel",
      "50M Water Resistance",
    ],
    offerInfo: "Includes free Italian leather replacement strap",
    angles: [
      {
        id: "ang-wt-1",
        label: "Front Sapphire Glass Face",
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&q=80",
        timestamp: 2,
      },
      {
        id: "ang-wt-2",
        label: "Side Titanium Bezel & Crown",
        url: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&h=800&fit=crop&q=80",
        timestamp: 6,
      },
      {
        id: "ang-wt-3",
        label: "Lifestyle On-Wrist Sport View",
        url: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&h=800&fit=crop&q=80",
        timestamp: 10,
      },
    ],
    detectedCategory: "Titanium luxury timepiece",
    materials: ["Aerospace Grade-5 Titanium", "Sapphire Crystal Glass", "Italian Calfskin Strap"],
    colors: ["Brushed Titanium", "Matte Black Bezel", "Silver Dial"],
    marketingPoints: [
      "✓ Aerospace titanium toughness",
      "✓ Sapphire crystal scratch immunity",
      "✓ Executive presence",
    ],
    generatedVideos: [],
    previousScripts: [
      "Command respect with aerospace titanium. Scratch-proof sapphire glass built for leaders. Order today with free extra strap!",
    ],
    aiContentCopy: {
      instagramCaption:
        "Engineered for excellence ⌚ Built from Grade-5 Aerospace Titanium with zero-scratch sapphire glass. Includes complimentary Italian leather strap. #LuxuryWatch #MenStyle #Timepiece",
      tiktokCaption:
        "Is titanium really 3x stronger than steel? Testing our scratch-proof sapphire watch ⌚🔥 #WatchCollector #TitaniumWatch #Luxury",
      youtubeShortsDescription:
        "Take a close-up look at the Titanium Executive Chronograph with sapphire glass.",
      hashtags: ["#LuxuryWatch", "#Jewellery", "#Timepiece", "#Titanium", "#ExecutiveStyle"],
      productTitle: "Executive Grade-5 Titanium Chronograph Timepiece",
      advertisementCopy:
        "Crafted from aerospace titanium and protected by sapphire crystal. Includes a complimentary Italian calfskin strap with your order.",
    },
    aiSalesSuggestion: {
      bestCustomerSegment: "Executive men, watch collectors, luxury gift buyers aged 28–55",
      sellingAngle: "High-end luxury specification (Titanium + Sapphire) at direct-to-consumer price",
      pricingPsychology: "Free premium bonus strap ($50 value) creates immediate purchase urgency",
      seasonalCampaigns: ["Father's Day Signature Collection", "Holiday Luxury Gifting"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "prod-perfume",
    sellerId: "shopkeeper",
    name: "Perfume",
    price: "$65.00",
    category: "Beauty Product",
    features: [
      "24-hour long-lasting Eau de Parfum",
      "Top notes of Sicilian Bergamot & Oud",
      "Cruelty-free organic ingredients",
    ],
    offerInfo: "Free luxury travel atomizer with order",
    angles: [
      {
        id: "ang-pf-1",
        label: "Front Crystal Bottle",
        url: "https://images.unsplash.com/photo-1547887537-6158d64c35e3?w=800&h=800&fit=crop&q=80",
        timestamp: 2,
      },
      {
        id: "ang-pf-2",
        label: "Atomizer Spray Mist Detail",
        url: "https://images.unsplash.com/photo-1588405765082-628d002f2324?w=800&h=800&fit=crop&q=80",
        timestamp: 6,
      },
      {
        id: "ang-pf-3",
        label: "Luxury Gift Box Packaging",
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&h=800&fit=crop&q=80",
        timestamp: 10,
      },
    ],
    detectedCategory: "Artisanal Eau de Parfum",
    materials: ["Organic Essential Oils", "French Glass Bottle", "24k Gold Accents"],
    colors: ["Amber Gold", "Crystal Clear", "Onyx Black Box"],
    marketingPoints: [
      "✓ 24-hour long-lasting fragrance",
      "✓ Exotic Oud & Amber wood notes",
      "✓ Luxury gift packaging",
    ],
    generatedVideos: [],
    previousScripts: [
      "Turn heads with 24-hour long-lasting Oud & Bergamot. Cruelty-free luxury perfume that captivates. DM for exclusive price!",
    ],
    aiContentCopy: {
      instagramCaption:
        "The scent everyone will ask you about ✨ Warm Amber & Sicilian Bergamot with 24-hour stay. Free luxury atomizer with every bottle! #LuxuryPerfume #Fragrance #OudScent #BeautyProduct",
      tiktokCaption:
        "Why this 24-hour fragrance is going viral on PerfumeTok ✨ Lasts all day and night! #PerfumeTok #Fragrance #ScentOfTheDay",
      youtubeShortsDescription:
        "Explore the luxury notes of Oud & Bergamot in our 24-hour Eau de Parfum.",
      hashtags: ["#Perfume", "#BeautyProduct", "#Fragrance", "#Oud", "#PerfumeTok"],
      productTitle: "Artisanal Oud & Amber 24-Hour Eau de Parfum (100ml)",
      advertisementCopy:
        "Indulge in Sicilian Bergamot and rare Oud wood. Formulated for 24-hour wear without harsh chemicals. Free travel atomizer included.",
    },
    aiSalesSuggestion: {
      bestCustomerSegment: "Fragrance enthusiasts, gift shoppers, beauty lovers aged 20–50",
      sellingAngle: "Niche artisanal scent longevity without luxury designer markup",
      pricingPsychology: "Free travel atomizer removes purchase hesitation",
      seasonalCampaigns: ["Valentine's Romantic Fragrance Promo", "Winter Amber Collection"],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_SCRIPT: GeneratedScript = {
  id: "script-1",
  title: "Precision Engineers Fast-Tracked (15s Reel)",
  hook: "Struggling to hire certified robotics engineers who know OSHA safety compliance on day one?",
  cta: "Partner with Manpower Corp today. We deliver pre-vetted tech talent in 48 hours.",
  segments: [
    {
      id: "seg-1",
      start: 0,
      end: 3,
      speaker: "Avatar",
      text: "Struggling to hire certified robotics engineers who know OSHA safety compliance on day one?",
      visualCue: "Avatar speaking in corner over high-tech laboratory opening shot.",
    },
    {
      id: "seg-2",
      start: 3,
      end: 11,
      speaker: "Voiceover",
      text: "Watch our technicians in action—wearing OSHA eye protection and calibrating sub-millimeter robotics with 99% precision.",
      visualCue: "Cut to raw work video: timestamp 0:02 (Safety gear) -> timestamp 0:08 (Precision assembly).",
    },
    {
      id: "seg-3",
      start: 11,
      end: 15,
      speaker: "Avatar",
      text: "Partner with Manpower Corp today. We deliver pre-vetted tech talent in 48 hours.",
      visualCue: "Cut back to Avatar with brand logo and bold CTA button.",
    },
  ],
  targetKeyframes: [2, 8],
  tone: "Professional & Authoritative",
  createdAt: new Date().toISOString(),
};

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-init-1",
    sender: "ai",
    text: "Welcome to Market Pilot AI! I've loaded the 'Precision Tech & Robotics Lab (MP4)' video and analyzed 3 workplace keyframe actions. I generated your initial 15-second Hybrid Reel script above.",
    timestamp: "10:00 AM",
    scriptSnapshot: INITIAL_SCRIPT,
  },
  {
    id: "msg-init-2",
    sender: "user",
    text: "Can we focus more on the safety certification shown in second 8 of the video? Make it punchier for hiring managers.",
    timestamp: "10:02 AM",
  },
  {
    id: "msg-init-3",
    sender: "ai",
    text: "Done! I updated the script to target timestamp 0:08 (Precision Micro-Assembly & safety standards) and switched the pacing to highlight zero-accident compliance.",
    timestamp: "10:03 AM",
    scriptSnapshot: INITIAL_SCRIPT,
    keyframeFocused: 8,
  },
];

const INITIAL_SCHEDULE: ScheduledPost[] = [
  {
    id: "post-1",
    title: "Why Fortune 500s Choose Manpower Tech Lab",
    videoId: "video-tech-1",
    thumbnailUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=250&fit=crop&q=80",
    caption: "Looking for elite robotics technicians? Look no further. ⚡ #Engineering #TechTalent #Recruiting",
    platforms: ["instagram", "tiktok"],
    scheduledTime: "2026-07-31T14:00:00.000Z",
    status: "scheduled",
    views: 14250,
    engagementRate: 6.8,
    clicks: 840,
    shares: 312,
  },
  {
    id: "post-2",
    title: "Safety Compliance in Modern Engineering",
    videoId: "video-tech-2",
    thumbnailUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop&q=80",
    caption: "OSHA-approved safety gear + sub-millimeter precision = perfection. #SafetyFirst #Manufacturing",
    platforms: ["instagram", "tiktok", "youtube"],
    scheduledTime: "2026-08-02T10:30:00.000Z",
    status: "published",
    views: 38900,
    engagementRate: 8.4,
    clicks: 2150,
    shares: 945,
  },
];

const DEMO_PROMOTION_CAMPAIGNS: PromotionCampaign[] = [
  {
    id: "promo-web-1",
    name: "CloudFlow Pro SaaS Launch",
    targetType: "website",
    template: "Brand Introduction",
    inputData: {
      websiteUrl: "https://cloudflowpro.io",
      businessCategory: "SaaS Workflow & Project Management",
      targetAudience: "SMB Founders & Distributed Product Teams",
      mainBenefits: [
        "Discover the easiest way to manage your business online.",
        "Zero-code workflow automations in minutes",
        "Real-time team productivity & analytics dashboard",
      ],
    },
    aiCampaignPlan: {
      campaignName: "CloudFlow Pro Digital Presence Accelerator",
      targetAudience: "SMB Founders, Operations Leads & Remote Product Teams",
      contentCalendar: [
        { day: "Day 1 (Mon)", topic: "1-Minute Setup Demo", platform: "Instagram Reels", format: "60s Screen Recording + Hook" },
        { day: "Day 3 (Wed)", topic: "Why Excel Sheet Managing is Killing Time", platform: "TikTok", format: "30s Problem/Solution Skit" },
        { day: "Day 5 (Fri)", topic: "Customer Success Metrics After 30 Days", platform: "YouTube Shorts", format: "45s Case Study Reel" },
      ],
      videoIdeas: [
        { title: "The 15-Second Workflow Revolution", hook: "Discover the easiest way to manage your business online.", format: "9:16 Vertical Reel", duration: "15s" },
        { title: "3 Tools You Should Cancel Today", hook: "Paying $200/mo for 3 different tools? Here's the all-in-one fix.", format: "TikTok Explainer", duration: "30s" },
        { title: "Zero to Automation in 4 Clicks", hook: "Watch me automate our team's entire daily reporting in 20 seconds.", format: "Screen Share Tutorial", duration: "45s" },
      ],
      captions: [
        { platform: "instagram", text: "Discover the easiest way to manage your business online 🚀 Start your 14-day free trial today! #SaaS #BusinessTools #Workflow", hashtags: ["#SaaS", "#BusinessTools", "#Productivity", "#CloudFlow"] },
        { platform: "tiktok", text: "Why hard-working teams are switching to CloudFlow Pro in 2026 🔥 Try free at link in bio #BusinessOwner #TechTips", hashtags: ["#BusinessOwner", "#TechTips", "#StartupLife"] },
      ],
      hashtagStrategy: ["#SaaSProduct", "#BusinessManagement", "#WorkflowAutomation", "#ProductivityHack", "#OnlineBusiness"],
      adCopy: "Discover the easiest way to manage your business online. CloudFlow Pro replaces 4 fragmented tools with one intuitive dashboard. Get started in 60 seconds—no credit card required.",
    },
    timelineStructure: [
      { startSec: 0, endSec: 5, title: "0–5 sec: Attention Hook", content: "Discover the easiest way to manage your business online.", badge: "HOOK" },
      { startSec: 5, endSec: 20, title: "5–20 sec: Platform & Benefits Showcase", content: "Smooth dashboard UI walk-through showing zero-code workflow automations & team analytics.", badge: "SHOWCASE" },
      { startSec: 20, endSec: 30, title: "20–30 sec: Actionable CTA", content: "Try 14 Days Free at cloudflowpro.io — Instant signup, zero credit card required.", badge: "CTA" },
    ],
    generatedVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-leather-bag-43407-large.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "promo-app-1",
    name: "PilotTask Mobile App Campaign",
    targetType: "app",
    template: "App Launch",
    inputData: {
      appName: "PilotTask Mobile",
      appScreenshots: [
        "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=800&fit=crop&q=80",
        "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=800&fit=crop&q=80",
      ],
      appLogo: "⚡",
      appFeatures: ["Offline sync", "Instant voice notes to tasks", "Team collaboration"],
      downloadLink: "https://apps.apple.com/app/id12345678",
    },
    aiCampaignPlan: {
      campaignName: "PilotTask App Install & Virality Campaign",
      targetAudience: "On-the-go freelancers, field managers & busy entrepreneurs",
      contentCalendar: [
        { day: "Day 1 (Tue)", topic: "Voice to Task in 2 Seconds", platform: "TikTok", format: "15s Speed Test" },
        { day: "Day 4 (Thu)", topic: "How I Manage 15 Projects from my Phone", platform: "Instagram Reels", format: "30s POV Lifestyle" },
      ],
      videoIdeas: [
        { title: "Manage Your Business Anywhere", hook: "Manage your business anywhere with our powerful mobile app.", format: "9:16 Mobile Ad", duration: "30s" },
        { title: "The Voice Note Shortcut", hook: "Stop typing tasks with two thumbs. Do this instead.", format: "Shorts Hack", duration: "20s" },
      ],
      captions: [
        { platform: "instagram", text: "Manage your business anywhere with our powerful mobile app 📲 Download PilotTask free on iOS & Android! #MobileApp #Productivity", hashtags: ["#MobileApp", "#AppLaunch", "#ProductivityApp"] },
        { platform: "tiktok", text: "This app changed how I run my store on the go 🔥 Tap to install #AppRecommendations #BusinessHack", hashtags: ["#AppRecommendations", "#BusinessHack"] },
      ],
      hashtagStrategy: ["#MobileApp", "#AppStore", "#BusinessApp", "#ProductivityTools", "#EntrepreneurLife"],
      adCopy: "Manage your business anywhere with our powerful mobile app. PilotTask syncs offline and turns your voice notes into organized team sprints. Download today on iOS and Android.",
    },
    timelineStructure: [
      { startSec: 0, endSec: 5, title: "0–5 sec: Problem Hook", content: "Manage your business anywhere with our powerful mobile app.", badge: "HOOK" },
      { startSec: 5, endSec: 20, title: "5–20 sec: App Features Showcase", content: "Dynamic iPhone mockup animations showing voice-to-task speed & instant offline team sync.", badge: "SHOWCASE" },
      { startSec: 20, endSec: 30, title: "20–30 sec: Download CTA", content: "Download PilotTask on iOS & Google Play — Tap the link below to install free.", badge: "CTA" },
    ],
    generatedVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-leather-bag-43407-large.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "promo-social-1",
    name: "@marketpilot_daily Profile Growth",
    targetType: "social-profile",
    template: "Influencer Growth",
    inputData: {
      socialProfileUrl: "https://instagram.com/marketpilot_daily",
      socialPlatform: "instagram",
      existingTopics: ["Daily Business Tips", "AI SaaS Secrets", "Marketing Psychology"],
    },
    aiCampaignPlan: {
      campaignName: "Viral Profile Authority & Follower Surge",
      targetAudience: "Aspiring entrepreneurs, SaaS founders & digital marketers",
      contentCalendar: [
        { day: "Day 1 (Mon)", topic: "Why You Should Follow This Channel", platform: "Instagram Reels", format: "15s Trailer" },
        { day: "Day 2 (Tue)", topic: "3 Psychological Pricing Tricks", platform: "Instagram Reels", format: "30s Explainer" },
      ],
      videoIdeas: [
        { title: "Welcome to Market Pilot Daily", hook: "Follow this channel for daily business tips.", format: "Pinned Reel", duration: "15s" },
        { title: "The 30-Day Marketing Challenge", hook: "Here is what we are building over the next 30 days.", format: "Series Intro", duration: "30s" },
      ],
      captions: [
        { platform: "instagram", text: "Follow this channel for daily business tips 💡 Hit follow and turn on notifications so you never miss an update! #BusinessTips #Marketing #Entrepreneur", hashtags: ["#BusinessTips", "#Marketing", "#Entrepreneur"] },
      ],
      hashtagStrategy: ["#BusinessTips", "#MarketingStrategy", "#DailyLearning", "#Entrepreneurship", "#GrowthHacking"],
      adCopy: "Follow this channel for daily business tips. From pricing psychology to AI automation shortcuts, @marketpilot_daily delivers 60-second masterclasses every morning.",
    },
    timelineStructure: [
      { startSec: 0, endSec: 5, title: "0–5 sec: Channel Hook", content: "Follow this channel for daily business tips.", badge: "HOOK" },
      { startSec: 5, endSec: 20, title: "5–20 sec: Value Proposition Preview", content: "Fast-paced montage of past viral business tips, revenue breakdowns & AI tool shortcuts.", badge: "SHOWCASE" },
      { startSec: 20, endSec: 30, title: "20–30 sec: Follow CTA", content: "Hit follow on @marketpilot_daily and turn on notifications for tomorrow's tip.", badge: "CTA" },
    ],
    generatedVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-leather-bag-43407-large.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "promo-rest-1",
    name: "Bistro 54 Authentic Dining Experience",
    targetType: "restaurant",
    template: "Restaurant Offer",
    inputData: {
      restaurantMenu: ["Truffle Pasta", "Woodfire Artisan Pizza", "Signature Tiramisu"],
      location: "Downtown Arts District, NY",
      offers: "Free Artisan Dessert with any table reservation this weekend",
    },
    aiCampaignPlan: {
      campaignName: "Bistro 54 Local Foodie & Weekend Dining Blitz",
      targetAudience: "Local foodies, date-night diners & weekend brunch crowds in NY",
      contentCalendar: [
        { day: "Day 1 (Thu)", topic: "Sizzling Truffle Pasta Kitchen Cut", platform: "Instagram Reels", format: "15s ASMR Reel" },
        { day: "Day 3 (Sat)", topic: "Why Our Tiramisu Went Viral", platform: "TikTok", format: "20s Dessert Focus" },
      ],
      videoIdeas: [
        { title: "Experience Authentic Flavors Near You", hook: "Experience authentic flavors near you.", format: "9:16 Local Reel", duration: "25s" },
        { title: "The Secret Behind Our Truffle Sauce", hook: "Here is how our chef prepares fresh truffle pasta every morning.", format: "Behind the Scenes", duration: "30s" },
      ],
      captions: [
        { platform: "instagram", text: "Experience authentic flavors near you 🍝 Reserve your table at Bistro 54 this weekend and get a complimentary artisan dessert! #NYCFoodie #AuthenticDining", hashtags: ["#NYCFoodie", "#ItalianFood", "#RestaurantReels"] },
      ],
      hashtagStrategy: ["#FoodReels", "#RestaurantLife", "#NYCDining", "#FoodieGram", "#AuthenticFlavors"],
      adCopy: "Experience authentic flavors near you. Bistro 54 brings handcrafted woodfire pizza and signature truffle pasta to Downtown NY. Reserve your table today and enjoy a complimentary dessert.",
    },
    timelineStructure: [
      { startSec: 0, endSec: 5, title: "0–5 sec: Sizzling Hook", content: "Experience authentic flavors near you.", badge: "HOOK" },
      { startSec: 5, endSec: 20, title: "5–20 sec: Dishes & Ambiance Showcase", content: "Close-up macro cinematography of woodfire pizza crust, steaming truffle pasta & cozy dining room.", badge: "SHOWCASE" },
      { startSec: 20, endSec: 30, title: "20–30 sec: Offer & Reservation CTA", content: "Free Artisan Dessert this weekend — Reserve online at bistro54.com or call our host desk.", badge: "CTA" },
    ],
    generatedVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-leather-bag-43407-large.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "promo-shop-1",
    name: "Urban Retail Boutique Seasonal Sale",
    targetType: "shop",
    template: "Sale Announcement",
    inputData: {
      shopPhotos: [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=800&fit=crop&q=80",
      ],
      location: "SoHo Shopping Walk, NYC",
      offers: "30% OFF all Summer arrivals in-store & online",
    },
    aiCampaignPlan: {
      campaignName: "Urban Boutique Foot-Traffic & Online Sale Surge",
      targetAudience: "Fashion-forward shoppers & SoHo retail visitors",
      contentCalendar: [
        { day: "Day 1 (Fri)", topic: "30% OFF Summer Drop", platform: "Instagram Reels", format: "15s Store Walkthrough" },
      ],
      videoIdeas: [
        { title: "Inside NYC's Favorite Indie Boutique", hook: "Looking for curated street fashion in NYC?", format: "Store Tour Reel", duration: "20s" },
      ],
      captions: [
        { platform: "instagram", text: "Visit us in SoHo for 30% OFF all Summer arrivals ✨ Show this reel at checkout! #SoHoShopping #NYCBoutique #Sale", hashtags: ["#SoHoShopping", "#NYCBoutique", "#FashionSale"] },
      ],
      hashtagStrategy: ["#BoutiqueShopping", "#RetailDesign", "#NYCFashion", "#ShopLocal", "#SummerSale"],
      adCopy: "Visit Urban Retail Boutique in SoHo for 30% OFF all Summer arrivals. Experience curated independent fashion design in our flagship store.",
    },
    timelineStructure: [
      { startSec: 0, endSec: 5, title: "0–5 sec: Store Hook", content: "Looking for curated street fashion in NYC?", badge: "HOOK" },
      { startSec: 5, endSec: 20, title: "5–20 sec: Product & Store Walkthrough", content: "Steadicam tour of clothing racks, designer footwear and bright modern retail lighting.", badge: "SHOWCASE" },
      { startSec: 20, endSec: 30, title: "20–30 sec: In-Store Discount CTA", content: "30% OFF Summer arrivals — Visit us at 142 SoHo Walk or order online.", badge: "CTA" },
    ],
    generatedVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-leather-bag-43407-large.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "promo-creator-1",
    name: "TechGrowth Channel Authority",
    targetType: "creator-channel",
    template: "Influencer Growth",
    inputData: {
      creatorHandle: "@TechGrowthMastery",
      existingTopics: ["AI Tool Reviews", "Tech Founder Stories", "SaaS Growth Tactics"],
    },
    aiCampaignPlan: {
      campaignName: "TechGrowth 100k Subscriber Sprint",
      targetAudience: "Tech enthusiasts, startup builders & YouTube Shorts viewers",
      contentCalendar: [
        { day: "Day 1 (Mon)", topic: "Best AI Tool of the Week", platform: "YouTube Shorts", format: "45s Direct Review" },
        { day: "Day 3 (Wed)", topic: "How I Built a $5k/mo Micro SaaS", platform: "YouTube Shorts", format: "60s Case Study" },
      ],
      videoIdeas: [
        { title: "Want to scale your business online?", hook: "Want to scale your digital business from $0 to $10k/month?", format: "9:16 Shorts", duration: "30s" },
      ],
      captions: [
        { platform: "youtube", text: "Subscribe to @TechGrowthMastery for weekly AI tool teardowns & founder case studies! #TechChannel #Startup #AISaaS", hashtags: ["#TechChannel", "#Startup", "#AISaaS"] },
      ],
      hashtagStrategy: ["#YouTubeCreator", "#TechReviews", "#SaaSGrowth", "#FounderStories", "#ShortsVideo"],
      adCopy: "Want to scale your digital business from $0 to $10k/month? Subscribe to @TechGrowthMastery for actionable breakdowns 3 days a week.",
    },
    timelineStructure: [
      { startSec: 0, endSec: 5, title: "0–5 sec: Hook Question", content: "Want to scale your digital business from $0 to $10k/month?", badge: "HOOK" },
      { startSec: 5, endSec: 20, title: "5–20 sec: Content Pillar Breakdown", content: "Preview clips of AI tool tutorials, revenue dashboards and founder interviews.", badge: "SHOWCASE" },
      { startSec: 20, endSec: 30, title: "20–30 sec: Subscribe CTA", content: "Subscribe to TechGrowth on YouTube & TikTok — New videos every Mon, Wed, Fri.", badge: "CTA" },
    ],
    generatedVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-leather-bag-43407-large.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  brands: DEMO_BRANDS,
  activeBrandId: "manpower",
  setActiveBrandId: (id) => {
    const brand = get().brands.find((b) => b.id === id);
    if (!brand) return;
    // Filter media for this brand or default to first matching
    const matchingMedia = get().mediaLibrary.find((m) => m.brandId === id) || get().mediaLibrary[0];
    set({
      activeBrandId: id,
      selectedMedia: matchingMedia,
      activeScrubberTime: matchingMedia.keyframes[0]?.timestamp || 0,
    });
  },
  updateBrand: (id, updates) => {
    set((state) => ({
      brands: state.brands.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    }));
  },

  mediaLibrary: DEMO_MEDIA,
  selectedMedia: DEMO_MEDIA[0],
  setSelectedMedia: (media) => {
    set({
      selectedMedia: media,
      activeScrubberTime: media?.keyframes[0]?.timestamp || 0,
    });
  },
  addUploadedMedia: (media) => {
    set((state) => ({
      mediaLibrary: [media, ...state.mediaLibrary],
      selectedMedia: media,
      activeScrubberTime: media.keyframes[0]?.timestamp || 0,
    }));
  },
  appendAngleToMedia: (mediaId, newAngle) => {
    set((state) => {
      const updatedLibrary = state.mediaLibrary.map((item) => {
        if (item.id === mediaId) {
          const currentAngles = item.angles || [];
          const updatedAngles = [...currentAngles, newAngle];
          const newKeyframe = {
            id: `kf-app-${Date.now()}-${updatedAngles.length}`,
            timestamp: newAngle.timestamp,
            label: newAngle.label,
            description: `Shopkeeper uploaded additional product angle/photo (${newAngle.label}).`,
            valueProp: `Spotlight multi-angle product presentation or multi-item showcase.`,
            confidence: 98,
          };
          const updatedKeyframes = [...item.keyframes, newKeyframe];
          return {
            ...item,
            isMultiAngle: true,
            angles: updatedAngles,
            keyframes: updatedKeyframes,
            title: item.title.includes("(+")
              ? item.title.replace(
                  /\(\+\d+.*$/,
                  `(+${updatedAngles.length - 1} Angles / Products)`
                )
              : `${item.title} (+1 Angle / Product)`,
          };
        }
        return item;
      });
      const updatedSelected =
        state.selectedMedia?.id === mediaId
          ? updatedLibrary.find((m) => m.id === mediaId) || null
          : state.selectedMedia;
      return {
        mediaLibrary: updatedLibrary,
        selectedMedia: updatedSelected,
      };
    });
  },
  activeScrubberTime: 2,
  setActiveScrubberTime: (time) => set({ activeScrubberTime: time }),

  compositorMode: "pip",
  setCompositorMode: (mode) => set({ compositorMode: mode }),
  videoLength: "15s",
  setVideoLength: (len) => set({ videoLength: len }),
  aspectRatio: "9:16",
  setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
  promptText: "Create a high-energy 15s recruiting reel emphasizing OSHA safety compliance and robotics precision shown in the video.",
  setPromptText: (text) => set({ promptText: text }),

  currentScript: INITIAL_SCRIPT,
  setCurrentScript: (script) => set({ currentScript: script }),
  isGeneratingScript: false,
  setIsGeneratingScript: (val) => set({ isGeneratingScript: val }),
  isRenderingVideo: false,
  setIsRenderingVideo: (val) => set({ isRenderingVideo: val }),
  renderProgress: 0,
  setRenderProgress: (val) => set({ renderProgress: val }),
  renderStepText: "",
  setRenderStepText: (text) => set({ renderStepText: text }),
  finishedVideoUrl: null,
  setFinishedVideoUrl: (url) => set({ finishedVideoUrl: url }),

  chatMessages: INITIAL_MESSAGES,
  addChatMessage: (msg) => {
    set((state) => ({
      chatMessages: [...state.chatMessages, msg],
    }));
  },
  clearChatMemory: () => {
    set({
      chatMessages: [
        {
          id: `msg-reset-${Date.now()}`,
          sender: "ai",
          text: "Session memory cleared. Let's create a fresh video concept! What angle should we focus on next?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ],
    });
  },

  scheduledPosts: INITIAL_SCHEDULE,
  addScheduledPost: (post) => {
    set((state) => ({
      scheduledPosts: [post, ...state.scheduledPosts],
    }));
  },
  connectedPlatforms: {
    instagram: true,
    tiktok: true,
    youtube: true,
    metaAds: false,
  },
  togglePlatformConnection: (platform) => {
    set((state) => ({
      connectedPlatforms: {
        ...state.connectedPlatforms,
        [platform]: !state.connectedPlatforms[platform],
      },
    }));
  },

  // Module 6: Individual Seller Product Video Creator
  workspaceMode: "business",
  setWorkspaceMode: (mode) => set({ workspaceMode: mode }),
  activeCreatorTab: "business",
  setActiveCreatorTab: (tab) => set({ activeCreatorTab: tab }),
  sellerProducts: DEMO_SELLER_PRODUCTS,
  activeProductId: DEMO_SELLER_PRODUCTS[0]?.id || null,
  setActiveProductId: (id) => set({ activeProductId: id }),
  addProductToCatalog: (product) => {
    set((state) => ({
      sellerProducts: [product, ...state.sellerProducts],
      activeProductId: product.id,
    }));
  },
  updateProductInCatalog: (id, updates) => {
    set((state) => ({
      sellerProducts: state.sellerProducts.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },
  deleteProductFromCatalog: (id) => {
    set((state) => ({
      sellerProducts: state.sellerProducts.filter((p) => p.id !== id),
      activeProductId:
        state.activeProductId === id
          ? state.sellerProducts.find((p) => p.id !== id)?.id || null
          : state.activeProductId,
    }));
  },
  saasPlan: "Free",
  setSaaSPlan: (plan) => set({ saasPlan: plan }),

  // Module 7: AI Brand Promotion Creator
  activePromotionType: "website",
  setActivePromotionType: (type) => set({ activePromotionType: type }),
  promotionCampaigns: DEMO_PROMOTION_CAMPAIGNS,
  activeCampaignId: DEMO_PROMOTION_CAMPAIGNS[0]?.id || null,
  setActiveCampaignId: (id) => set({ activeCampaignId: id }),
  addPromotionCampaign: (campaign) => {
    set((state) => ({
      promotionCampaigns: [campaign, ...state.promotionCampaigns],
      activeCampaignId: campaign.id,
    }));
  },
  updatePromotionCampaign: (id, updates) => {
    set((state) => ({
      promotionCampaigns: state.promotionCampaigns.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    }));
  },
  deletePromotionCampaign: (id) => {
    set((state) => ({
      promotionCampaigns: state.promotionCampaigns.filter((c) => c.id !== id),
      activeCampaignId:
        state.activeCampaignId === id
          ? state.promotionCampaigns.find((c) => c.id !== id)?.id || null
          : state.activeCampaignId,
    }));
  },
}));

