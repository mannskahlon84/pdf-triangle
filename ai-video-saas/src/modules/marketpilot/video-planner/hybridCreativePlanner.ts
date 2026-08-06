import { Campaign } from "../types/promotion.types";
import {
  AspectRatio,
  VideoDuration,
  VideoPlan,
  VideoScene,
} from "./types/planner.types";
import { TimingCalculator } from "./timingCalculator";
import { VisualPlanner } from "./visualPlanner";
import { AssetAnalyzer, AnalyzedAsset, AssetRole } from "./analyzers/assetAnalyzer";
import { MotionDirectorEngine } from "./motionDirector/motionDirectorEngine";
import { CinematicEngine } from "../cinematic-ai/cinematicEngine";
import { VoicePersonalityEngine } from "../voice-personality/voicePersonalityEngine";
import { VoicePersonalityMode } from "../voice-personality/types/voice.types";
import { AvatarMode } from "../avatar-engine/types/avatar.types";
import { AvatarSelector } from "../avatar-engine/avatarSelector";
import { AvatarPromptEngine } from "../avatar-engine/avatarPromptEngine";

import { CampaignProfile } from "../campaign-profile/types/campaign.types";
import { CampaignDefaults } from "../campaign-profile/campaignDefaults";
import { BrandProfile } from "../brand-profile/types/brand.types";

export interface CreateVideoPlanOptions {
  duration?: VideoDuration;
  aspectRatio?: AspectRatio;
  customTitle?: string;
  mediaUrls?: string[];
  hybridAiMode?: boolean;
  // Future compatibility hooks for modular extensions
  cinematicAiMode?: boolean;
  voicePersonalityMode?: VoicePersonalityMode;
  avatarMode?: AvatarMode;
  voicePersonality?: "energetic" | "professional" | "empathetic" | "cinematic" | string;
  industryTemplate?: string;
  campaignProfile?: Partial<CampaignProfile>;
  brandProfile?: BrandProfile;
}

export class HybridCreativePlanner {
  /**
   * Synthesizes an AI-optimized VideoPlan using the Hybrid Creative layer.
   * - Analyzes uploaded product images
   * - Chooses hero image
   * - Assigns scenes across the Hook -> Feature -> Benefit -> CTA marketing structure
   * - Produces output 100% compatible with existing VideoPlan schema
   * - Ready for Cinematic AI mode, Voice Personality Engine, and Industry Templates
   */
  public static async createCreativePlan(
    campaign: Campaign,
    options: CreateVideoPlanOptions = {},
    mediaUrls: string[] = []
  ): Promise<VideoPlan> {
    
    // 0. Resolve Campaign Profile context
    const rawProfile = options.campaignProfile || {
      userType: "business" as const,
      industry: campaign.industry || campaign.promotionType,
      campaignGoal: campaign.goal,
      targetAudience: { customerType: campaign.targetAudience },
      promotionType: "brand" as any,
    };
    
    // Explicitly carry over legacy mode overrides if provided
    if (options.cinematicAiMode === true) rawProfile.visualMode = "cinematic_ai";
    if (options.voicePersonalityMode) rawProfile.voiceMode = options.voicePersonalityMode as any;
    if (options.avatarMode) rawProfile.avatarMode = options.avatarMode as any;

    const profile = CampaignDefaults.applyDefaults(rawProfile, options.brandProfile);

    const duration: VideoDuration = options.duration || "15s";
    const aspectRatio: AspectRatio = options.aspectRatio || "9:16";
    const brandName =
      options.brandProfile?.brandName || campaign.brandName || campaign.campaignName.split(" ")[0] || "Brand";
    const industry =
      profile.industry || options.industryTemplate || campaign.industry || campaign.promotionType || "electronics";
    const voicePersonality = options.voicePersonality || "professional";
    const isCinematicMode = profile.visualMode === "cinematic_ai";
    const title =
      options.customTitle || `${brandName} — Hybrid Creative ${campaign.campaignName}`;

    // 1. Analyze uploaded product images and designate roles
    const analyzedAssets = AssetAnalyzer.analyze(mediaUrls, brandName, industry);
    const heroAsset = AssetAnalyzer.chooseHeroImage(analyzedAssets);

    // 2. Define the 4-part marketing structure: Hook -> Feature -> Benefit -> CTA
    const marketingStructure: {
      role: AssetRole;
      purpose: "hook" | "showcase" | "benefit" | "cta";
      defaultVoiceText: string;
      animationStyle: "ken-burns-in" | "ken-burns-out" | "static-highlight";
    }[] = [
      {
        role: "hero",
        purpose: "hook",
        defaultVoiceText:
          campaign.valueProposition ||
          campaign.videoConcepts?.[0]?.hook ||
          `Discover ${brandName} with premium quality and deep bass sound.`,
        animationStyle: "ken-burns-in",
      },
      {
        role: "feature",
        purpose: "showcase",
        defaultVoiceText:
          campaign.marketingStrategy ||
          "Engineered with studio-grade acoustic drivers for crystal clear clarity.",
        animationStyle: "ken-burns-out",
      },
      {
        role: "benefit",
        purpose: "benefit",
        defaultVoiceText:
          "Enjoy all day comfort with 40 hours of non-stop battery life on a single charge.",
        animationStyle: "ken-burns-in",
      },
      {
        role: "cta",
        purpose: "cta",
        defaultVoiceText:
          campaign.cta ||
          `Order your ${brandName} earphones today and elevate your audio experience.`,
        animationStyle: "static-highlight",
      },
    ];

    // 3. Compute exact scene timings across the 4 marketing stages
    const durationRatios = [0.25, 0.25, 0.25, 0.25];
    const timings = TimingCalculator.calculateSceneTimings(
      durationRatios,
      duration
    );

    // 4. Build VideoScene objects with assigned asset URLs
    const scenes: VideoScene[] = marketingStructure.map((stage, idx) => {
      const timing = timings[idx];
      const sceneNum = idx + 1;
      const assignedAsset =
        analyzedAssets.find((a) => a.role === stage.role) || heroAsset;

      // Ensure valid fallback URL from analyzed assets
      const bgUrl = assignedAsset?.url;
      const prodUrl = assignedAsset?.url;
      const supportingUrls = analyzedAssets
        .filter((a) => a.url !== bgUrl)
        .map((a) => a.url);
      const nextAssetUrl =
        analyzedAssets[(idx + 1) % analyzedAssets.length]?.url || bgUrl;

      const rawVoiceText = this.applyVoicePersonality(
        stage.defaultVoiceText,
        voicePersonality
      );
      const { animationStyle, transition, videoPrompt } = this.applyCinematicStyle(
        stage.animationStyle,
        isCinematicMode,
        stage.role,
        brandName
      );

      return {
        sceneNumber: sceneNum,
        startTime: timing.startTimeFormatted,
        endTime: timing.endTimeFormatted,
        duration: timing.durationFormatted,
        purpose: stage.purpose,
        voiceText: rawVoiceText,
        visualDescription: assignedAsset?.visualDescription || `Scene ${sceneNum} Visual (${industry})`,
        imagePrompt: `${brandName} ${stage.role} shot (${industry})`,
        videoPrompt,
        animationStyle,
        transition,
        textOverlay:
          assignedAsset?.titleOverlay || `${brandName} ${stage.role.toUpperCase()}`,
        backgroundImageUrl: bgUrl,
        productImageUrl: undefined,
        supportingVisualUrls: nextAssetUrl ? [nextAssetUrl] : undefined,
      };
    });

    const visualAssets = VisualPlanner.generateAssetSpecifications(scenes, aspectRatio);

    const basePlan: VideoPlan = {
      id: `plan-${Date.now()}`,
      campaignId: campaign.id,
      title,
      duration,
      aspectRatio,
      platform: "Instagram",
      scenes,
      voiceScript: scenes.map((s) => s.voiceText).join(" "),
      visualAssets,
      thumbnailPrompt: `${brandName} premium product visualization, 8k resolution`,
      caption: `${campaign.valueProposition}\n\n#${brandName} #${industry}`,
      hashtags: [brandName.toLowerCase(), industry, "premium"],
      createdAt: new Date().toISOString(),
      mediaUrls,
    };

    let motionPlan = MotionDirectorEngine.applyMotion(basePlan, isCinematicMode);

    if (profile.voiceMode && profile.voiceMode !== "individual_creator") { // Handle default or actual logic
      const voiceInstruction = VoicePersonalityEngine.generateVoiceInstruction(
        profile.voiceMode as VoicePersonalityMode,
        profile.promotionType || "product",
        profile.targetAudience?.customerType || "general",
        industry,
        profile.campaignGoal || "awareness"
      );
      motionPlan.voiceInstruction = voiceInstruction;

      // Apply script style modifier
      motionPlan.scenes.forEach(scene => {
        scene.voiceText = this.applyVoicePersonality(scene.voiceText, voiceInstruction.scriptStyle);
      });
      motionPlan.voiceScript = motionPlan.scenes.map(s => s.voiceText).join(" ");
    } else if (profile.voiceMode === "individual_creator") {
      const voiceInstruction = VoicePersonalityEngine.generateVoiceInstruction(
        "individual_creator",
        profile.promotionType || "product",
        profile.targetAudience?.customerType || "general",
        industry,
        profile.campaignGoal || "awareness"
      );
      motionPlan.voiceInstruction = voiceInstruction;

      motionPlan.scenes.forEach(scene => {
        scene.voiceText = this.applyVoicePersonality(scene.voiceText, voiceInstruction.scriptStyle);
      });
      motionPlan.voiceScript = motionPlan.scenes.map(s => s.voiceText).join(" ");
    }

    if (profile.avatarMode === "ai_presenter") {
      const audienceString = profile.targetAudience ? `${profile.targetAudience.location} ${profile.targetAudience.customerType}` : profile.region;
      const avatarProfile = AvatarSelector.selectAvatar(
        audienceString || "global",
        industry,
        profile.campaignGoal || "awareness",
        profile.targetAudience?.customerType || "general",
        profile.brandStyle || "modern"
      );
      motionPlan.avatarInstruction = AvatarPromptEngine.generateInstruction(avatarProfile);
    }

    if (isCinematicMode) {
      motionPlan = await CinematicEngine.applyCinematicGeneration(motionPlan);
    }

    return motionPlan;
  }

  /**
   * Modifies script style and tone based on Voice Personality Engine setting.
   */
  private static applyVoicePersonality(
    text: string,
    personality?: string
  ): string {
    if (!personality || personality === "professional") {
      return text;
    }
    
    const p = personality.toLowerCase();
    if (p.includes("energetic") || p.includes("personal")) {
      return text.replace(/\.$/, "!") + " Get ready for peak performance!";
    }
    if (p.includes("empathetic") || p.includes("cinematic") || p.includes("slow")) {
      return `In a world of sound... ${text}`;
    }
    
    // Default fallback
    return text;
  }

  /**
   * Modifies animationStyle, transition, and videoPrompt for Cinematic AI mode.
   */
  private static applyCinematicStyle(
    defaultAnimation: string,
    isCinematicMode: boolean,
    role: AssetRole,
    brandName: string
  ): {
    animationStyle: string;
    transition: string;
    videoPrompt: string;
  } {
    if (!isCinematicMode) {
      return {
        animationStyle: defaultAnimation,
        transition: "fade",
        videoPrompt: `Cinematic camera motion for ${role}`,
      };
    }

    // Cinematic mode overrides
    const cinematicAnimations: Record<AssetRole, string> = {
      hero: "3d-float",
      feature: "macro-pan",
      benefit: "ken-burns-in",
      cta: "static-highlight",
    };

    return {
      animationStyle: cinematicAnimations[role] || "ken-burns-in",
      transition: "whip-pan",
      videoPrompt: `Anamorphic 35mm cinematic depth-of-field movement focusing on ${brandName} (${role})`,
    };
  }
}
