import { VisualEnhancementMode } from "./enhancement.types";
import { VisualProviderRegistry } from "./providers/visualProviderRegistry";

export class BackgroundRemovalService {
  /**
   * Strips distracting or plain backgrounds from product photos to prepare
   * clean transparent cutouts for composition.
   * In standard mode, returns original asset URL untouched.
   */
  public static async removeBackground(
    sourceUrl: string,
    mode: VisualEnhancementMode = "hybrid_ai"
  ): Promise<string> {
    if (!sourceUrl || mode === "standard") {
      return sourceUrl;
    }

    const provider = VisualProviderRegistry.getProvider(mode);
    try {
      const cutoutUrl = await provider.removeBackground(sourceUrl);
      return cutoutUrl || sourceUrl;
    } catch (error) {
      console.warn(
        "[BackgroundRemovalService] Fallback to original URL:",
        error
      );
      return sourceUrl;
    }
  }

  /**
   * Checks if an asset URL is already a transparent PNG cutout.
   */
  public static isCleanCutout(url: string): boolean {
    if (!url) return false;
    return (
      url.endsWith(".png") ||
      url.includes("cutout") ||
      url.includes("transparent")
    );
  }
}
