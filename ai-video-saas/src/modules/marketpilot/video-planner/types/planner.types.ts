export type VideoDuration = "15s" | "30s" | "60s";
export type AspectRatio = "9:16" | "16:9" | "1:1";
export type PlatformType = "instagram" | "tiktok" | "youtube" | "linkedin" | "universal";

export type ScenePurpose =
  | "hook"
  | "problem"
  | "solution"
  | "benefit"
  | "social_proof"
  | "showcase"
  | "cta";

export type TransitionStyle =
  | "zoom-in"
  | "zoom-out"
  | "fade"
  | "whip-pan"
  | "slide-left"
  | "slide-right"
  | "glitch"
  | "cut";

export type AnimationStyle =
  | "ken-burns-in"
  | "ken-burns-out"
  | "kinetic-text"
  | "3d-float"
  | "macro-pan"
  | "drone-glide"
  | "static-highlight";

export interface MotionMetadata {
  movement: string; // e.g. "slow_push_in"
  emphasis: string; // e.g. "hero_product"
  intensity: "low" | "medium" | "high";
  duration: number; // in milliseconds
  reason: string;
}


import { CinematicInstruction } from "../../cinematic-ai/types/cinematic.types";

export interface VideoScene {
  sceneNumber: number;
  startTime: string; // e.g., "0s" or "00:00"
  endTime: string; // e.g., "5s" or "00:05"
  duration: string; // e.g., "5 seconds"
  purpose: ScenePurpose | string;
  voiceText: string;
  visualDescription: string;
  imagePrompt: string;
  videoPrompt: string;
  animationStyle: AnimationStyle | string;
  transition: TransitionStyle | string;
  textOverlay: string;
  cta?: string;
  backgroundImageUrl?: string;
  productImageUrl?: string;
  supportingVisualUrls?: string[];
  motionMetadata?: MotionMetadata;
  cinematicInstruction?: CinematicInstruction;
}

export interface VisualAssetSpecification {
  id: string;
  sceneNumber: number;
  assetType: "image_prompt" | "video_prompt" | "ui_mockup" | "stock_broll";
  prompt: string;
  aspectRatio: AspectRatio;
  styleKeywords: string[];
}

export interface AssetLineageRecord {
  sceneNumber: number;
  originalAssetUrl: string;
  enhancedAssetUrl: string;
  enhancementMode: "standard" | "hybrid_ai" | "cinematic_ai";
  providerMetadata: {
    providerName: string;
    modelName?: string;
    processingTimeMs: number;
  };
  createdAt: string;
}

import { VoiceInstruction } from "../../voice-personality/types/voice.types";
import { AvatarInstruction } from "../../avatar-engine/types/avatar.types";

export interface VideoPlan {
  id: string;
  campaignId?: string;
  title: string;
  duration: VideoDuration;
  aspectRatio: AspectRatio;
  platform: PlatformType;
  scenes: VideoScene[];
  voiceScript: string;
  visualAssets: VisualAssetSpecification[];
  thumbnailPrompt: string;
  caption: string;
  hashtags: string[];
  createdAt: string;
  mediaUrls?: string[];
  assetLineage?: AssetLineageRecord[];
  voiceInstruction?: VoiceInstruction;
  avatarInstruction?: AvatarInstruction;
}

export interface SceneTemplateDefinition {
  id: string;
  name: string;
  industry: string;
  defaultDuration: VideoDuration;
  sceneStructure: {
    purpose: ScenePurpose;
    durationRatio: number; // e.g. 0.166 for 5s of 30s
    defaultTransition: TransitionStyle;
    defaultAnimation: AnimationStyle;
    visualGuidance: string;
    promptTemplate: string;
  }[];
}
