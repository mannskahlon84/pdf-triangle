import { Campaign } from "../types/promotion.types";
import {
  AspectRatio,
  VideoDuration,
  VideoPlan,
  VideoScene,
} from "./types/planner.types";
import { SceneTemplatesService } from "./sceneTemplates";
import { TimingCalculator } from "./timingCalculator";
import { TransitionPlanner } from "./transitionPlanner";
import { VisualPlanner } from "./visualPlanner";
import { VoicePlanner } from "./voicePlanner";

import { HybridCreativePlanner } from "./hybridCreativePlanner";

export interface CreateVideoPlanOptions {
  duration?: VideoDuration;
  aspectRatio?: AspectRatio;
  customTitle?: string;
  mediaUrls?: string[];
  hybridAiMode?: boolean;
}

export class ScenePlanner {
  /**
   * Converts a MarketPilot Campaign object into a structured VideoPlan.
   * Works as the bridge between Campaign Strategy -> Video Script -> Production Plan -> Hybrid Rendering.
   */
  public static async generateVideoPlanFromCampaign(
    campaign: Campaign,
    options: CreateVideoPlanOptions = {}
  ): Promise<VideoPlan> {
    // Check feature flag HYBRID_AI_MODE
    const isHybridAiMode =
      process.env.HYBRID_AI_MODE === "true" || options.hybridAiMode === true;

    if (isHybridAiMode) {
      return await HybridCreativePlanner.createCreativePlan(
        campaign,
        options,
        options.mediaUrls || []
      );
    }

    const duration: VideoDuration = options.duration || "30s";
    const aspectRatio: AspectRatio = options.aspectRatio || "9:16";
    const brandName = campaign.brandName || campaign.campaignName.split(" ")[0] || "Brand";
    const industry = campaign.industry || campaign.promotionType || "business";
    const title = options.customTitle || `${brandName} — ${campaign.campaignName}`;

    // 1. Resolve matching scene template
    const template = SceneTemplatesService.resolveTemplate(industry, campaign.goal as any);

    // 2. Compute exact scene timings
    const durationRatios = template.sceneStructure.map((s) => s.durationRatio);
    const timings = TimingCalculator.calculateSceneTimings(durationRatios, duration);

    // 3. Build VideoScene objects
    const scenes: VideoScene[] = [];
    const voiceTexts: string[] = [];

    const valueHook =
      campaign.valueProposition ||
      campaign.videoConcepts?.[0]?.hook ||
      campaign.marketingStrategy ||
      "Discover smarter results today.";
    const ctaText = campaign.cta || "Learn More";

    template.sceneStructure.forEach((struct, idx) => {
      const timing = timings[idx];
      const sceneNum = idx + 1;

      const voiceText = VoicePlanner.generateSceneVoiceText(
        struct.purpose,
        brandName,
        industry,
        idx === 0 ? valueHook : undefined,
        ctaText
      );
      voiceTexts.push(voiceText);

      const textOverlay = VoicePlanner.generateTextOverlay(
        struct.purpose,
        brandName,
        idx === 0 ? valueHook : undefined
      );

      const { imagePrompt, videoPrompt } = VisualPlanner.enhancePrompt(
        struct.promptTemplate,
        brandName,
        industry,
        aspectRatio
      );

      const transition = TransitionPlanner.getTransitionForScene(idx, struct.defaultTransition);
      const animationStyle = TransitionPlanner.getAnimationForScene(idx, struct.defaultAnimation);

      scenes.push({
        sceneNumber: sceneNum,
        startTime: timing.startTimeFormatted,
        endTime: timing.endTimeFormatted,
        duration: timing.durationFormatted,
        purpose: struct.purpose,
        voiceText,
        visualDescription: struct.visualGuidance,
        imagePrompt,
        videoPrompt,
        animationStyle,
        transition,
        textOverlay,
        cta: idx === template.sceneStructure.length - 1 ? ctaText : undefined,
      });
    });

    // 4. Generate Visual Asset Specifications
    const visualAssets = VisualPlanner.generateAssetSpecifications(scenes, aspectRatio);

    // 5. Compile Voice Script
    const voiceScript = VoicePlanner.compileFullVoiceScript(voiceTexts);

    // 6. Thumbnail prompt & social metadata
    const thumbnailPrompt = `Vertical 9:16 high-impact social media reel cover for ${brandName} (${industry}), high-contrast bold text overlay reading "${scenes[0]?.textOverlay || brandName}", vibrant studio lighting, 4K commercial quality.`;
    const caption =
      campaign.captions?.[0]?.text ||
      `Experience the future with ${brandName}. #MarketPilotAI #${industry}`;
    const hashtags =
      campaign.hashtags ||
      campaign.captions?.[0]?.hashtags || [
        `#${brandName.replace(/\s+/g, "")}`,
        `#${industry}`,
        "#SocialReel",
      ];


    const videoPlan: VideoPlan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      campaignId: campaign.campaignName,
      title,
      duration,
      aspectRatio,
      platform: "universal",
      scenes,
      voiceScript,
      visualAssets,
      thumbnailPrompt,
      caption,
      hashtags,
      createdAt: new Date().toISOString(),
    };

    // 7. Validate generated plan
    this.validateVideoPlan(videoPlan);

    return videoPlan;
  }

  /**
   * Validates video plan schema, scene ordering, timestamps, and required properties.
   */
  public static validateVideoPlan(plan: VideoPlan): boolean {
    if (!plan || !plan.scenes || plan.scenes.length === 0) {
      throw new Error("VideoPlan validation failed: scenes array is empty or undefined.");
    }

    let prevEndSec = 0;
    plan.scenes.forEach((scene, index) => {
      if (scene.sceneNumber !== index + 1) {
        throw new Error(`Scene ordering error at index ${index}: expected sceneNumber ${index + 1} but got ${scene.sceneNumber}`);
      }

      const startSec = parseFloat(scene.startTime);
      const endSec = parseFloat(scene.endTime);

      if (isNaN(startSec) || isNaN(endSec) || endSec <= startSec) {
        throw new Error(`Invalid timestamps in Scene ${scene.sceneNumber}: start=${scene.startTime}, end=${scene.endTime}`);
      }

      if (Math.abs(startSec - prevEndSec) > 0.5 && index > 0) {
        throw new Error(`Scene gap detected between Scene ${index} and Scene ${scene.sceneNumber}: prevEnd=${prevEndSec}s, currStart=${startSec}s`);
      }

      prevEndSec = endSec;

      if (!scene.voiceText || !scene.imagePrompt || !scene.videoPrompt) {
        throw new Error(`Missing required content in Scene ${scene.sceneNumber}: voiceText, imagePrompt, or videoPrompt is empty.`);
      }
    });

    return true;
  }
}
