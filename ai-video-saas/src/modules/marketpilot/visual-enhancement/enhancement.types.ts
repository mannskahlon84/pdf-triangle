import { AssetLineageRecord } from "../video-planner/types/planner.types";

export type VisualEnhancementMode = "standard" | "hybrid_ai" | "cinematic_ai";

export interface VisualEnhancementOptions {
  mode: VisualEnhancementMode;
  brandName?: string;
  industry?: string;
  aspectRatio?: "9:16" | "16:9" | "1:1";
  enableBackgroundRemoval?: boolean;
  enableDropShadow?: boolean;
}

export interface VisualEnhancementRequest {
  sceneNumber: number;
  purpose: string;
  sourceImageUrl: string;
  brandName: string;
  industry: string;
  mode: VisualEnhancementMode;
  aspectRatio: "9:16" | "16:9" | "1:1";
  titleOverlay?: string;
}

export interface VisualEnhancementResult {
  sceneNumber: number;
  originalUrl: string;
  enhancedUrl: string;
  providerUsed: string;
  modelUsed?: string;
  mode: VisualEnhancementMode;
  processingDurationMs: number;
}

export type { AssetLineageRecord };
