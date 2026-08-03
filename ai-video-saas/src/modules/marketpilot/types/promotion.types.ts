import { PromotionTargetType, PromotionVideoTemplateType } from "@/types/database";

export type CampaignGoal =
  | "brand_awareness"
  | "lead_generation"
  | "sales_conversion"
  | "app_installs"
  | "audience_growth"
  | "event_rsvps"
  | "recruitment"
  | "product_launch";

export interface PromotionRequest {
  promotionType: PromotionTargetType;
  industry: string;
  businessName: string;
  userInputs: Record<string, any>;
  targetAudience: string;
  campaignGoal: CampaignGoal;
  selectedTemplate?: PromotionVideoTemplateType | string;
}

export interface VideoConcept {
  id: string;
  title: string;
  hook: string;
  format: string;
  duration: "15s" | "30s" | "60s";
  visualDescription: string;
  ctaStyle: string;
}

export interface ScriptTimelineSegment {
  timeRange: string; // e.g. "0-5s"
  purpose: "hook" | "body" | "cta";
  spokenText: string;
  visualCue: string;
  onScreenText: string;
}

export interface GeneratedVideoScript {
  scriptId: string;
  title: string;
  templateUsed: string;
  duration: string;
  hook: string;
  body: string;
  cta: string;
  timeline: ScriptTimelineSegment[];
}

export interface SocialCaption {
  platform: "instagram" | "tiktok" | "youtube" | "linkedin" | "facebook";
  text: string;
  hashtags: string[];
  callToAction: string;
}

export interface Campaign {
  id: string;
  campaignName: string;
  marketingStrategy: string;
  targetAudience: string;
  videoConcepts: VideoConcept[];
  scripts: GeneratedVideoScript[];
  captions: SocialCaption[];
  hashtags: string[];
  adCopy: string[];
  cta: string;
  createdAt: string;
  brandName?: string;
  industry?: string;
  promotionType?: string;
  goal?: CampaignGoal | string;
  valueProposition?: string;
}


export interface TemplateRegistryEntry {
  id: string;
  name: string;
  industry: PromotionTargetType | "universal" | string;
  category: string;
  supportedGoals: CampaignGoal[];
  duration: "15s" | "30s" | "60s";
  purpose: string;
  scriptPattern: string;
  sceneStructure: string[];
  ctaStyle: string;
  templateStructure: {
    time: string;
    purpose: string;
    instruction: string;
  }[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  normalizedRequest?: PromotionRequest;
}
