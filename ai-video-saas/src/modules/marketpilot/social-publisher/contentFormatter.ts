import { Campaign } from "@/modules/marketpilot/types/promotion.types";
import {
  PlatformContent,
  SocialPlatformType,
} from "./types/publisher.types";

export class ContentFormatter {
  /**
   * Converts a MarketPilot Campaign (or base inputs) into tailored platform versions.
   */
  public static formatForPlatforms(
    campaign: Campaign,
    targetPlatforms?: SocialPlatformType[]
  ): PlatformContent[] {
    const platforms: SocialPlatformType[] = targetPlatforms || [
      "instagram",
      "youtube_shorts",
      "tiktok",
      "facebook",
      "linkedin",
    ];

    const primaryCaption =
      campaign.captions[0]?.text ||
      `${campaign.valueProposition}\n\n👉 ${campaign.cta}`;
    const tags =
      campaign.hashtags && campaign.hashtags.length > 0
        ? campaign.hashtags
        : ["#MarketPilotAI", `#${campaign.industry}`, "#ViralReels"];

    return platforms.map((platform) =>
      this.formatPlatformContent(platform, campaign, primaryCaption, tags)
    );
  }

  private static formatPlatformContent(
    platform: SocialPlatformType,
    campaign: Campaign,
    baseCaption: string,
    tags: string[]
  ): PlatformContent {
    const brand = campaign.brandName || "MarketPilot";

    switch (platform) {
      case "instagram":
        return {
          platform: "instagram",
          caption: `${baseCaption}\n\n✨ Follow @${brand.replace(
            /\s+/g,
            ""
          )} for more ${campaign.industry} insights!`,
          hashtags: tags.slice(0, 15),
          coverUrl: "/placeholder-cover-instagram.jpg",
        };

      case "youtube_shorts":
        return {
          platform: "youtube_shorts",
          title: `${campaign.campaignName} — #Shorts`,
          caption: baseCaption,
          description: `${baseCaption}\n\n🔗 ${campaign.cta}\n\nProduced by MarketPilot AI for ${brand}.\n${tags.join(
            " "
          )}`,
          hashtags: tags.slice(0, 8),
        };

      case "tiktok":
        return {
          platform: "tiktok",
          caption: `🔥 ${campaign.valueProposition} | ${campaign.cta}`,
          hashtags: [
            "#fyp",
            "#viral",
            ...tags.map((t) => (t.startsWith("#") ? t : `#${t}`)),
          ].slice(0, 7),
        };

      case "linkedin":
        return {
          platform: "linkedin",
          title: `${brand} | Strategic ${campaign.industry} Innovation`,
          caption: `We're excited to share our latest initiative at ${brand}.\n\n${campaign.valueProposition}\n\nKey Takeaway: Consistent execution and AI-driven workflows empower teams to scale without bottlenecking quality.\n\n${campaign.cta}\n\nWhat are your thoughts on modern ${campaign.industry} automation? Let us know in the comments below.`,
          hashtags: tags
            .filter((t) => !t.toLowerCase().includes("fyp"))
            .slice(0, 5),
          professionalNote:
            "Formatted with executive tone and business networking CTA.",
        };

      case "facebook":
      default:
        return {
          platform: "facebook",
          caption: `${baseCaption}\n\n💬 Drop a comment below or send us a message to learn more!`,
          hashtags: tags.slice(0, 6),
        };
    }
  }
}
