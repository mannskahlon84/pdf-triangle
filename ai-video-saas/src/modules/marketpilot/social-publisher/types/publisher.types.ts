export type SocialPlatformType =
  | "instagram"
  | "youtube_shorts"
  | "tiktok"
  | "facebook"
  | "linkedin";

export type CampaignStatus =
  | "DRAFT"
  | "GENERATING"
  | "READY"
  | "SCHEDULED"
  | "PUBLISHED"
  | "FAILED";

export interface PlatformContent {
  platform: SocialPlatformType;
  title?: string; // YouTube / LinkedIn
  caption: string; // Instagram / TikTok / Facebook
  hashtags: string[];
  coverUrl?: string;
  description?: string; // YouTube Shorts
  professionalNote?: string; // LinkedIn
}

export interface CampaignAnalytics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  followersGained: number;
  engagementRatePct: number;
  lastUpdated: string;
}

export interface MarketingCampaign {
  id: string;
  userId: string;
  campaignName: string;
  industry: string;
  promotionType: string;
  videoId: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  platforms: SocialPlatformType[];
  platformContents: PlatformContent[];
  status: CampaignStatus;
  scheduledTime?: string; // ISO string if SCHEDULED
  publishedAt?: string; // ISO string if PUBLISHED
  analytics: CampaignAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface PublishRequest {
  campaignId: string;
  platforms: SocialPlatformType[];
  immediate: boolean;
  scheduledTime?: string;
}

export interface PublishResult {
  success: boolean;
  campaignId: string;
  status: CampaignStatus;
  publishedPlatforms: {
    platform: SocialPlatformType;
    postId: string;
    url: string;
    publishedAt: string;
  }[];
  error?: string;
}

export interface ScheduleRequest {
  campaignId: string;
  platforms: SocialPlatformType[];
  scheduledTime: string; // ISO string
}

export interface ScheduleResult {
  success: boolean;
  campaignId: string;
  status: CampaignStatus;
  scheduledTime: string;
  platforms: SocialPlatformType[];
  error?: string;
}
