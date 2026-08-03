import {
  TemplateRegistryEntry,
  PromotionRequest,
} from "../types/promotion.types";
import {
  findTemplatesByCriteria,
  getTemplateByIdOrName,
} from "../config/templateRegistry";

export class TemplateResolver {
  /**
   * Resolves the primary template and alternate template suggestions
   * for a given promotion request.
   */
  public static resolve(request: PromotionRequest): {
    primaryTemplate: TemplateRegistryEntry;
    suggestions: TemplateRegistryEntry[];
  } {
    // 1. If explicit selectedTemplate was provided, try to find it first
    if (request.selectedTemplate) {
      const explicit = getTemplateByIdOrName(request.selectedTemplate);
      if (explicit) {
        const others = findTemplatesByCriteria({
          promotionType: request.promotionType,
          industry: request.industry,
          campaignGoal: request.campaignGoal,
        }).filter((t) => t.id !== explicit.id);

        return {
          primaryTemplate: explicit,
          suggestions: others.slice(0, 3),
        };
      }
    }

    // 2. Otherwise query by criteria
    const candidates = findTemplatesByCriteria({
      promotionType: request.promotionType,
      industry: request.industry,
      campaignGoal: request.campaignGoal,
    });

    if (candidates.length > 0) {
      return {
        primaryTemplate: candidates[0],
        suggestions: candidates.slice(1, 4),
      };
    }

    // 3. Fallback to Brand Introduction
    const fallback = getTemplateByIdOrName("Brand Introduction");
    return {
      primaryTemplate: fallback,
      suggestions: [],
    };
  }
}
