import {
  AssetLineageRecord,
  VideoPlan,
} from "../video-planner/types/planner.types";
import {
  VisualEnhancementMode,
  VisualEnhancementOptions,
  VisualEnhancementRequest,
} from "./enhancement.types";
import { SceneCompositionEngine } from "./sceneCompositionEngine";

export class VisualEnhancementEngine {
  /**
   * Transforms uploaded assets into professional scene assets before TimelineBuilder.
   * - Preserves full asset lineage in videoPlan.assetLineage
   * - Returns ONLY final renderable URLs in scene.backgroundImageUrl for downstream rendering
   * - Never exposes provider details to FFmpegRenderer or RenderTimeline
   */
  public static async enhanceVideoPlan(
    videoPlan: VideoPlan,
    options: VisualEnhancementOptions
  ): Promise<VideoPlan> {
    const mode: VisualEnhancementMode = options.mode || "standard";
    const brandName = options.brandName || videoPlan.title || "Brand";
    const industry = options.industry || "General";

    const enhancedScenes = [...videoPlan.scenes];
    const assetLineage: AssetLineageRecord[] =
      videoPlan.assetLineage || [];

    for (let i = 0; i < enhancedScenes.length; i++) {
      const scene = enhancedScenes[i];
      const sourceUrl =
        scene.backgroundImageUrl ||
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1080&h=1920&fit=crop";

      const req: VisualEnhancementRequest = {
        sceneNumber: scene.sceneNumber,
        purpose: String(scene.purpose),
        sourceImageUrl: sourceUrl,
        brandName,
        industry,
        mode,
        aspectRatio: videoPlan.aspectRatio || "9:16",
        titleOverlay: scene.textOverlay,
      };

      try {
        const res = await SceneCompositionEngine.compositeSceneAsset(req);

        // Record immutable lineage in VideoPlan (Creative Layer Only)
        const lineageRecord: AssetLineageRecord = {
          sceneNumber: scene.sceneNumber,
          originalAssetUrl: res.originalUrl,
          enhancedAssetUrl: res.enhancedUrl,
          enhancementMode: mode,
          providerMetadata: {
            providerName: res.providerUsed,
            modelName: res.modelUsed,
            processingTimeMs: res.processingDurationMs,
          },
          createdAt: new Date().toISOString(),
        };

        // Replace or add lineage record for this scene
        const existingIdx = assetLineage.findIndex(
          (rec) => rec.sceneNumber === scene.sceneNumber
        );
        if (existingIdx >= 0) {
          assetLineage[existingIdx] = lineageRecord;
        } else {
          assetLineage.push(lineageRecord);
        }

        // Set ONLY final renderable URL on scene for TimelineBuilder & FFmpegRenderer
        scene.backgroundImageUrl = res.enhancedUrl;
        scene.productImageUrl = undefined; // Prevent duplicate square overlay in FFmpeg
      } catch (error) {
        console.warn(
          `[VisualEnhancementEngine] Error enhancing scene ${scene.sceneNumber}:`,
          error
        );
        // Fallback to sourceUrl if provider fails
        scene.backgroundImageUrl = sourceUrl;
        scene.productImageUrl = undefined;
      }
    }

    return {
      ...videoPlan,
      scenes: enhancedScenes,
      assetLineage,
    };
  }
}
