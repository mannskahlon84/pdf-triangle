import {
  CampaignStatus,
  MarketingCampaign,
  PublishRequest,
  PublishResult,
  ScheduleRequest,
  ScheduleResult,
  SocialPlatformType,
} from "./types/publisher.types";
import { ContentFormatter } from "./contentFormatter";
import { PlatformAdapterRegistry } from "./platformAdapters";
import { AnalyticsTracker } from "./analyticsTracker";

export class CampaignManager {
  private static campaigns: Map<string, MarketingCampaign> = new Map();
  private static seeded = false;

  private static seedDefaultCampaigns() {
    if (this.seeded) return;
    this.seeded = true;

    const seedData: MarketingCampaign[] = [
      {
        id: "camp_mp_101",
        userId: "user_enterprise",
        campaignName: "Manpower Corp — 2026 Tech Hiring Reel",
        industry: "recruitment",
        promotionType: "business",
        videoId: "vid_mp_101",
        videoUrl: "/demo-reels/recruitment-tech.mp4",
        thumbnailUrl: "/placeholder-tech-recruitment.png",
        platforms: ["linkedin", "instagram", "youtube_shorts"],
        platformContents: [
          {
            platform: "linkedin",
            title: "Manpower Corp | Enterprise Tech Leadership",
            caption:
              "We're scaling enterprise engineering teams across North America and Europe. Watch our 30-second hiring breakdown.",
            hashtags: ["#TechHiring", "#EngineeringLeadership", "#Manpower"],
          },
          {
            platform: "instagram",
            caption:
              "Looking for top engineering talent? Scale with Manpower Corp AI-assisted screening! 👉 Request Demo",
            hashtags: ["#Hiring", "#TechRecruiter", "#CareerGoals"],
          },
        ],
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        analytics: {
          views: 18450,
          likes: 1320,
          comments: 184,
          shares: 245,
          clicks: 640,
          followersGained: 142,
          engagementRatePct: 9.5,
          lastUpdated: new Date().toISOString(),
        },
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "camp_mp_102",
        userId: "user_enterprise",
        campaignName: "Urban Fitness — 30-Day AI Workout Challenge",
        industry: "fitness",
        promotionType: "business",
        videoId: "vid_mp_102",
        videoUrl: "/demo-reels/fitness-challenge.mp4",
        thumbnailUrl: "/placeholder-fitness-workout.png",
        platforms: ["instagram", "tiktok"],
        platformContents: [
          {
            platform: "instagram",
            caption:
              "Transform your training with AI-personalized macro & workout planning. First 7 days free!",
            hashtags: ["#UrbanFitness", "#GymReels", "#WorkoutChallenge"],
          },
          {
            platform: "tiktok",
            caption:
              "🔥 Why gym members are switching to AI workout plans | Tap to start free",
            hashtags: ["#fyp", "#gymtok", "#fitnessmotivation"],
          },
        ],
        status: "SCHEDULED",
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        analytics: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          clicks: 0,
          followersGained: 0,
          engagementRatePct: 0,
          lastUpdated: new Date().toISOString(),
        },
        createdAt: new Date(Date.now() - 36000000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "camp_mp_103",
        userId: "user_enterprise",
        campaignName: "Dental Care — Pain-Free Laser Whitening Reel",
        industry: "healthcare",
        promotionType: "business",
        videoId: "vid_mp_103",
        videoUrl: "/demo-reels/dental-whitening.mp4",
        thumbnailUrl: "/placeholder-dental-clinic.png",
        platforms: ["instagram", "facebook"],
        platformContents: [
          {
            platform: "instagram",
            caption:
              "Smile brighter without sensitive teeth! Our laser whitening takes just 45 minutes.",
            hashtags: ["#DentalCare", "#SmileMakeover", "#TeethWhitening"],
          },
        ],
        status: "READY",
        analytics: {
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          clicks: 0,
          followersGained: 0,
          engagementRatePct: 0,
          lastUpdated: new Date().toISOString(),
        },
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "camp_mp_104",
        userId: "user_enterprise",
        campaignName: "CloudFlow Pro — Zero-Code Automation Demo",
        industry: "website",
        promotionType: "website",
        videoId: "vid_mp_104",
        videoUrl: "/demo-reels/saas-automation.mp4",
        thumbnailUrl: "/placeholder-saas-cloudflow.png",
        platforms: ["youtube_shorts", "linkedin", "tiktok"],
        platformContents: [
          {
            platform: "youtube_shorts",
            title: "Automate your team workflows in 60s #Shorts",
            caption: "Zero-code automations for SaaS engineering teams.",
            hashtags: ["#SaaS", "#Automation", "#CloudFlow"],
          },
        ],
        status: "PUBLISHED",
        publishedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        analytics: {
          views: 26800,
          likes: 2140,
          comments: 312,
          shares: 490,
          clicks: 1120,
          followersGained: 285,
          engagementRatePct: 11.0,
          lastUpdated: new Date().toISOString(),
        },
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    seedData.forEach((c) => this.campaigns.set(c.id, c));
  }

  /**
   * Retrieves all Marketing Campaigns, optionally filtered by status or industry.
   */
  public static listCampaigns(filter?: {
    status?: CampaignStatus;
    industry?: string;
  }): MarketingCampaign[] {
    this.seedDefaultCampaigns();
    const all = Array.from(this.campaigns.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return all.filter((c) => {
      if (filter?.status && c.status !== filter.status) return false;
      if (
        filter?.industry &&
        c.industry.toLowerCase() !== filter.industry.toLowerCase()
      )
        return false;
      return true;
    });
  }

  public static getCampaignById(id: string): MarketingCampaign | undefined {
    this.seedDefaultCampaigns();
    return this.campaigns.get(id);
  }

  /**
   * Registers a new MarketingCampaign in the manager.
   */
  public static createCampaign(
    data: Omit<MarketingCampaign, "id" | "createdAt" | "updatedAt">
  ): MarketingCampaign {
    this.seedDefaultCampaigns();
    const id = `camp_mp_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    const campaign: MarketingCampaign = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.campaigns.set(id, campaign);
    return campaign;
  }

  public static updateStatus(
    id: string,
    status: CampaignStatus,
    extras?: Partial<MarketingCampaign>
  ): MarketingCampaign {
    const existing = this.getCampaignById(id);
    if (!existing) {
      throw new Error(`Campaign with ID ${id} not found.`);
    }

    const updated: MarketingCampaign = {
      ...existing,
      ...extras,
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === "PUBLISHED" && existing.status !== "PUBLISHED") {
      updated.publishedAt = new Date().toISOString();
      updated.analytics = AnalyticsTracker.generateInitialAnalytics(
        "PUBLISHED",
        existing.industry
      );
    }

    this.campaigns.set(id, updated);
    return updated;
  }
}
