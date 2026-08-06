import {
  MarketingCampaign,
  PublishRequest,
  PublishResult,
  ScheduleRequest,
  ScheduleResult,
  SocialPlatformType,
} from "./types/publisher.types";
import { CampaignManager } from "./campaignManager";
import { PlatformAdapterRegistry } from "./platformAdapters";
import { ContentFormatter } from "./contentFormatter";
import { SocialScheduler } from "./scheduler";
import {
  AnalyticsTracker,
  PortfolioAnalyticsSummary,
} from "./analyticsTracker";
import { Campaign } from "@/modules/marketpilot/types/promotion.types";

export class SocialPublisherEngine {
  /**
   * Converts a Phase 1-3 MarketPilot Campaign into a Phase 4 MarketingCampaign item in the Manager.
   */
  public static registerCampaignForPublishing(
    campaign: Campaign,
    videoId: string,
    videoUrl?: string,
    platforms?: SocialPlatformType[]
  ): MarketingCampaign {
    const targetPlatforms: SocialPlatformType[] = platforms || [
      "instagram",
      "youtube_shorts",
      "tiktok",
      "linkedin",
    ];

    const platformContents = ContentFormatter.formatForPlatforms(
      campaign,
      targetPlatforms
    );

    return CampaignManager.createCampaign({
      userId: "user_enterprise",
      campaignName: campaign.campaignName,
      industry: campaign.industry || "general",
      promotionType: campaign.promotionType || "product",
      videoId,
      videoUrl: videoUrl || "/demo-reels/recruitment-tech.mp4",
      thumbnailUrl: "/placeholder-tech-recruitment.png",
      platforms: targetPlatforms,
      platformContents,
      status: "READY",
      analytics: AnalyticsTracker.generateInitialAnalytics(
        "READY",
        campaign.industry || "general"
      ),
    });
  }

  /**
   * Publishes a campaign immediately across the selected platform adapters.
   */
  public static async publish(req: PublishRequest): Promise<PublishResult> {
    const campaign = CampaignManager.getCampaignById(req.campaignId);
    if (!campaign) {
      return {
        success: false,
        campaignId: req.campaignId,
        status: "FAILED",
        publishedPlatforms: [],
        error: `Marketing campaign not found: ${req.campaignId}`,
      };
    }

    const targetPlatforms =
      req.platforms && req.platforms.length > 0
        ? req.platforms
        : campaign.platforms;

    try {
      const publishedPlatforms: {
        platform: SocialPlatformType;
        postId: string;
        url: string;
        publishedAt: string;
      }[] = [];

      for (const platform of targetPlatforms) {
        const adapter = PlatformAdapterRegistry.getAdapter(platform);
        const content =
          campaign.platformContents.find((c) => c.platform === platform) || {
            platform,
            caption: `${campaign.campaignName} - #MarketPilot`,
            hashtags: ["#MarketPilotAI"],
          };

        const result = await adapter.publishVideo(
          campaign.videoUrl || "/demo-reels/recruitment-tech.mp4",
          content
        );

        publishedPlatforms.push({
          platform,
          postId: result.postId,
          url: result.url,
          publishedAt: result.publishedAt,
        });
      }

      // Update Campaign Status
      CampaignManager.updateStatus(req.campaignId, "PUBLISHED", {
        platforms: targetPlatforms,
      });

      return {
        success: true,
        campaignId: req.campaignId,
        status: "PUBLISHED",
        publishedPlatforms,
      };
    } catch (err: any) {
      CampaignManager.updateStatus(req.campaignId, "FAILED");
      return {
        success: false,
        campaignId: req.campaignId,
        status: "FAILED",
        publishedPlatforms: [],
        error: err.message || "Social publication failed across adapters.",
      };
    }
  }

  /**
   * Schedules a campaign for automatic future release.
   */
  public static async schedule(req: ScheduleRequest): Promise<ScheduleResult> {
    return SocialScheduler.scheduleCampaign(req);
  }

  /**
   * Retrieves aggregated portfolio analytics for the Campaign Insights Dashboard.
   */
  public static getPortfolioAnalytics(): PortfolioAnalyticsSummary {
    const campaigns = CampaignManager.listCampaigns();
    return AnalyticsTracker.aggregatePortfolio(campaigns);
  }
}
