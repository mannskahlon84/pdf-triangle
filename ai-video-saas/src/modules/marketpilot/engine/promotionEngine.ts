import {
  PromotionRequest,
  Campaign,
  ValidationResult,
  TemplateRegistryEntry,
} from "../types/promotion.types";
import { validatePromotionRequest } from "./validationEngine";
import { TemplateResolver } from "./templateResolver";
import { CampaignBuilder } from "./campaignBuilder";

export interface PromotionEngineResponse {
  success: boolean;
  validation: ValidationResult;
  selectedTemplate?: TemplateRegistryEntry;
  suggestedTemplates: TemplateRegistryEntry[];
  campaign?: Campaign;
}

export class MarketPilotPromotionEngine {
  /**
   * Main entry point to run the AI Promotion Engine
   */
  public static async generateCampaign(
    rawRequest: Partial<PromotionRequest>
  ): Promise<PromotionEngineResponse> {
    // 1. Validate & Normalize Request
    const validation = validatePromotionRequest(rawRequest);

    if (!validation.valid || !validation.normalizedRequest) {
      return {
        success: false,
        validation,
        suggestedTemplates: [],
      };
    }

    const request = validation.normalizedRequest;

    // 2. Resolve Template by industry / goal / type
    const { primaryTemplate, suggestions } = TemplateResolver.resolve(request);

    // 3. Generate Complete Multi-Channel Campaign
    const campaign = await CampaignBuilder.build(request, primaryTemplate);

    return {
      success: true,
      validation,
      selectedTemplate: primaryTemplate,
      suggestedTemplates: suggestions,
      campaign,
    };
  }
}
