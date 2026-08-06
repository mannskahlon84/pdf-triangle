import { VideoRenderer } from "./VideoRenderer";
import { FFmpegRenderer } from "./FFmpegRenderer";

export type RenderProviderType = "ffmpeg";

/**
 * RendererFactory
 * Selects and instantiates the active video rendering provider for MarketPilot AI.
 */
export class RendererFactory {
  private static ffmpegInstance: FFmpegRenderer | null = null;

  /**
   * Returns a singleton instance of the requested VideoRenderer provider.
   */
  public static getRenderer(
    provider: RenderProviderType = "ffmpeg"
  ): VideoRenderer {
    if (provider === "ffmpeg") {
      if (!this.ffmpegInstance) {
        this.ffmpegInstance = new FFmpegRenderer();
      }
      return this.ffmpegInstance;
    }

    // Fallback default to FFmpegRenderer
    if (!this.ffmpegInstance) {
      this.ffmpegInstance = new FFmpegRenderer();
    }
    return this.ffmpegInstance;
  }
}
