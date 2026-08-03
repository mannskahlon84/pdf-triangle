import {
  PromotionRequest,
  Campaign,
  TemplateRegistryEntry,
} from "../types/promotion.types";
import { ScriptGenerator } from "../generators/scriptGenerator";
import { CaptionGenerator } from "../generators/captionGenerator";
import { HashtagGenerator } from "../generators/hashtagGenerator";
import { AdCopyGenerator } from "../generators/adCopyGenerator";

export class CampaignBuilder {
  /**
   * Assembles a complete Campaign object from normalized PromotionRequest and Template
   */
  public static async build(
    request: PromotionRequest,
    template: TemplateRegistryEntry
  ): Promise<Campaign> {
    // 1. Generate Video Concepts
    const videoConcepts = await ScriptGenerator.generateVideoConcepts(
      request,
      template
    );

    // 2. Generate Scripts
    const scripts = await ScriptGenerator.generateScripts(
      request,
      template,
      videoConcepts
    );

    // 3. Generate Hashtags
    const hashtags = await HashtagGenerator.generateHashtags(request);

    // 4. Generate Social Captions
    const captions = await CaptionGenerator.generateCaptions(
      request,
      template,
      hashtags
    );

    // 5. Generate Ad Copy
    const adCopy = await AdCopyGenerator.generateAdCopy(request, template);

    // 6. Assemble Campaign
    return {
      id: `campaign_${Date.now()}`,
      campaignName: `${request.businessName} — ${template.name} Campaign`,
      marketingStrategy: `Multi-channel short-form vertical video campaign utilizing the ${template.name} framework (${template.scriptPattern}) to achieve ${request.campaignGoal} among ${request.targetAudience}.`,
      targetAudience: request.targetAudience,
      videoConcepts,
      scripts,
      captions,
      hashtags,
      adCopy,
      cta: template.ctaStyle,
      createdAt: new Date().toISOString(),
    };
  }
}
