import { PromotionRequest, ValidationResult } from "../types/promotion.types";
import { getPromotionTypeConfig } from "../config/promotionTypes";
import { getIndustryMetadata } from "../config/industryTemplates";

export const validatePromotionRequest = (request: Partial<PromotionRequest>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!request.promotionType) {
    errors.push("Missing required field: promotionType");
  }

  if (!request.businessName || !request.businessName.trim()) {
    errors.push("Missing required field: businessName");
  }

  const promoType = request.promotionType || "website";
  const config = getPromotionTypeConfig(promoType);

  // Check required inputs defined in config
  if (request.userInputs) {
    config.requiredFields.forEach((field) => {
      if (!request.userInputs || !request.userInputs[field]) {
        warnings.push(`Recommended input '${field}' for ${config.name} is empty or missing.`);
      }
    });
  } else {
    warnings.push("No userInputs provided; defaults will be synthesized.");
  }

  const normalizedRequest: PromotionRequest = {
    promotionType: promoType,
    industry: request.industry || promoType,
    businessName: request.businessName || "Valued Enterprise",
    userInputs: request.userInputs || {},
    targetAudience: request.targetAudience || "High-intent prospective buyers & clients",
    campaignGoal:
      request.campaignGoal ||
      getIndustryMetadata(request.industry || promoType).defaultGoal ||
      "lead_generation",
    selectedTemplate: request.selectedTemplate || config.defaultTemplate,
  };

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedRequest,
  };
};
