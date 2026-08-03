import { PromotionRequest, TemplateRegistryEntry } from "../types/promotion.types";

export class AdCopyGenerator {
  /**
   * Generates high-converting ad copies for paid advertising campaigns
   */
  public static async generateAdCopy(
    request: PromotionRequest,
    template: TemplateRegistryEntry
  ): Promise<string[]> {
    const copy1 = `Looking for the most reliable way to succeed in ${request.industry}? ${request.businessName} delivers proven outcomes for ${request.targetAudience} with guaranteed satisfaction. Click below to explore our official platform and claim your exclusive offer today.`;
    const copy2 = `Why settle for ordinary when you can have industry-leading quality? Join thousands who trust ${request.businessName}. High performance, zero hassle. ${template.ctaStyle}`;

    return [copy1, copy2];
  }
}
