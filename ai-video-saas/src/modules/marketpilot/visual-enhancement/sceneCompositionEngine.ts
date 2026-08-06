import {
  VisualEnhancementMode,
  VisualEnhancementRequest,
  VisualEnhancementResult,
} from "./enhancement.types";
import { VisualProviderRegistry } from "./providers/visualProviderRegistry";

export class SceneCompositionEngine {
  /**
   * Composites product visuals into professional marketing scenes.
   * - standard mode: uses uploaded image directly
   * - hybrid_ai mode: product-focused composition and background enhancement
   * - cinematic_ai mode: placeholder interface for future premium workflows
   */
  public static async compositeSceneAsset(
    req: VisualEnhancementRequest
  ): Promise<VisualEnhancementResult> {
    const provider = VisualProviderRegistry.getProvider(req.mode);

    // If cinematic_ai is requested, check if provider has optional cinematic handler
    if (
      req.mode === "cinematic_ai" &&
      typeof provider.generateCinematicEnvironment === "function"
    ) {
      return provider.generateCinematicEnvironment(req);
    }

    // Otherwise use standard/hybrid_ai enhancement via provider
    return provider.enhanceProductScene(req);
  }

  /**
   * Resolves final renderable URL for TimelineBuilder and FFmpegRenderer.
   */
  public static resolveRenderableUrl(
    sourceUrl: string,
    enhancedUrl?: string,
    mode: VisualEnhancementMode = "standard"
  ): string {
    if (mode === "standard" || !enhancedUrl) {
      return sourceUrl;
    }
    return enhancedUrl;
  }
}
