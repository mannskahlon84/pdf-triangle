import {
  PromotionRequest,
  SocialCaption,
  TemplateRegistryEntry,
} from "../types/promotion.types";

export class CaptionGenerator {
  /**
   * Generates social media captions tailored for Instagram, TikTok, YouTube, and LinkedIn
   */
  public static async generateCaptions(
    request: PromotionRequest,
    template: TemplateRegistryEntry,
    hashtags: string[]
  ): Promise<SocialCaption[]> {
    const platforms: SocialCaption["platform"][] = [
      "instagram",
      "tiktok",
      "youtube",
      "linkedin",
    ];

    return platforms.map((platform) => {
      let text = "";
      if (platform === "instagram") {
        text = `🔥 Discover why ${request.businessName} is transforming ${request.industry}! Whether you need speed, reliability, or premium quality, our team delivers every time.\n\n👇 Tap the link in bio to ${template.ctaStyle.replace(/ button.*$/i, "").toLowerCase()} today!`;
      } else if (platform === "tiktok") {
        text = `Stop scrolling! 🛑 Here is how ${request.businessName} helps ${request.targetAudience} get instant results in ${request.industry}. Watch until the end!`;
      } else if (platform === "youtube") {
        text = `Welcome to ${request.businessName}! In this short video, we break down our #1 solution for ${request.targetAudience}. Subscribe and visit our official website for full details.`;
      } else {
        text = `Excited to share how ${request.businessName} is driving measurable innovation across the ${request.industry} sector. Our commitment to high-standard execution empowers our partners and clients to thrive.`;
      }

      return {
        platform,
        text,
        hashtags: hashtags.slice(0, 5),
        callToAction: template.ctaStyle,
      };
    });
  }
}
