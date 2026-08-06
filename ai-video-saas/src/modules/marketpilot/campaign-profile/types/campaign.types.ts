export type PromotionType = 
  | "product"
  | "service"
  | "brand"
  | "website"
  | "app"
  | "social_profile"
  | "event"
  | "recruitment";

export interface TargetAudience {
  ageGroup?: string;
  location?: string;
  language?: string;
  customerType?: string;
}

export type BrandStyle = "modern" | "premium" | "luxury" | "friendly" | "corporate";
export type VisualMode = "standard" | "hybrid_ai" | "cinematic_ai";
export type VoiceMode = "individual_creator" | "business_industry" | "premium_cinematic";
export type AvatarMode = "none" | "ai_presenter";

export interface CampaignProfile {
  id?: string;
  profileVersion?: number;
  
  userType: "individual" | "business";

  region?: string;
  country?: string;
  language?: string;
  industry?: string;
  
  promotionType?: PromotionType;
  targetAudience?: TargetAudience;
  campaignGoal?: string;
  brandStyle?: BrandStyle;
  
  visualMode?: VisualMode;
  voiceMode?: VoiceMode;
  avatarMode?: AvatarMode;
}
