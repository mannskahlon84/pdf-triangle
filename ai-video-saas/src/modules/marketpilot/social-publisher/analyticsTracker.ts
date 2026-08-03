import { CampaignAnalytics, MarketingCampaign } from "./types/publisher.types";

export interface PortfolioAnalyticsSummary {
  totalCampaigns: number;
  publishedCampaigns: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalClicks: number;
  totalFollowersGained: number;
  avgEngagementRatePct: number;
  topPerformingPlatform: string;
  viewsByPlatform: { platform: string; views: number }[];
}

export class AnalyticsTracker {
  /**
   * Generates baseline realistic analytics for a newly created/published campaign.
   */
  public static generateInitialAnalytics(
    status: string,
    industry: string
  ): CampaignAnalytics {
    if (status !== "PUBLISHED") {
      return {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        clicks: 0,
        followersGained: 0,
        engagementRatePct: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Generate realistic simulated metrics
    const baseViews = Math.floor(Math.random() * 12000) + 3800;
    const likes = Math.floor(baseViews * (0.06 + Math.random() * 0.04));
    const comments = Math.floor(likes * (0.08 + Math.random() * 0.05));
    const shares = Math.floor(likes * (0.12 + Math.random() * 0.08));
    const clicks = Math.floor(baseViews * (0.035 + Math.random() * 0.025));
    const followersGained = Math.floor(baseViews * (0.012 + Math.random() * 0.01));
    const totalEngagement = likes + comments + shares;
    const engagementRatePct = Number(
      ((totalEngagement / baseViews) * 100).toFixed(1)
    );

    return {
      views: baseViews,
      likes,
      comments,
      shares,
      clicks,
      followersGained,
      engagementRatePct,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Aggregates portfolio analytics across an array of campaigns.
   */
  public static aggregatePortfolio(
    campaigns: MarketingCampaign[]
  ): PortfolioAnalyticsSummary {
    const published = campaigns.filter((c) => c.status === "PUBLISHED");

    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    let totalClicks = 0;
    let totalFollowers = 0;

    const platformViews: Record<string, number> = {
      instagram: 0,
      youtube_shorts: 0,
      tiktok: 0,
      facebook: 0,
      linkedin: 0,
    };

    published.forEach((c) => {
      const a = c.analytics;
      totalViews += a.views;
      totalLikes += a.likes;
      totalComments += a.comments;
      totalShares += a.shares;
      totalClicks += a.clicks;
      totalFollowers += a.followersGained;

      // Distribute views across platforms
      const pCount = Math.max(c.platforms.length, 1);
      const perPlatform = Math.floor(a.views / pCount);
      c.platforms.forEach((p) => {
        platformViews[p] = (platformViews[p] || 0) + perPlatform;
      });
    });

    const totalEngagement = totalLikes + totalComments + totalShares;
    const avgEngagementRatePct =
      totalViews > 0
        ? Number(((totalEngagement / totalViews) * 100).toFixed(1))
        : 0;

    const topPlatformEntry = Object.entries(platformViews).sort(
      (a, b) => b[1] - a[1]
    )[0];

    const formatPlatformName = (key: string) => {
      switch (key) {
        case "instagram":
          return "Instagram Reels";
        case "youtube_shorts":
          return "YouTube Shorts";
        case "tiktok":
          return "TikTok";
        case "facebook":
          return "Facebook Reels";
        case "linkedin":
          return "LinkedIn";
        default:
          return key;
      }
    };

    return {
      totalCampaigns: campaigns.length,
      publishedCampaigns: published.length,
      totalViews,
      totalLikes: totalLikes,
      totalComments: totalComments,
      totalShares: totalShares,
      totalClicks: totalClicks,
      totalFollowersGained: totalFollowers,
      avgEngagementRatePct,
      topPerformingPlatform: topPlatformEntry
        ? formatPlatformName(topPlatformEntry[0])
        : "Instagram Reels",
      viewsByPlatform: Object.entries(platformViews).map(([k, v]) => ({
        platform: formatPlatformName(k),
        views: v,
      })),
    };
  }
}
