import { AspectRatio, VisualAssetSpecification } from "./types/planner.types";

export class VisualPlanner {
  /**
   * Enhances a scene prompt template with brand context and aesthetics.
   */
  public static enhancePrompt(
    basePrompt: string,
    brandName: string,
    industry: string,
    aspectRatio: AspectRatio
  ): { imagePrompt: string; videoPrompt: string } {
    const ratioKeyword = aspectRatio === "9:16" ? "Vertical 9:16 portrait composition" : "16:9 widescreen composition";
    const imagePrompt = `${ratioKeyword}, ${basePrompt}. High-end commercial aesthetic for ${brandName} (${industry}), crisp studio lighting, 8k cinematic photography, professional color grading.`;
    const videoPrompt = `Cinematic video motion: ${basePrompt}. Smooth camera movement, professional lighting for ${brandName}, high-definition commercial advertising footage.`;

    return {
      imagePrompt,
      videoPrompt,
    };
  }

  /**
   * Generates a complete array of visual asset specifications for the video plan.
   */
  public static generateAssetSpecifications(
    scenes: { sceneNumber: number; imagePrompt: string; videoPrompt: string }[],
    aspectRatio: AspectRatio
  ): VisualAssetSpecification[] {
    const assets: VisualAssetSpecification[] = [];
    for (const scene of scenes) {
      assets.push({
        id: `asset-img-s${scene.sceneNumber}`,
        sceneNumber: scene.sceneNumber,
        assetType: "image_prompt",
        prompt: scene.imagePrompt,
        aspectRatio,
        styleKeywords: ["cinematic", "high-definition", "studio-lighting", "commercial-grade"],
      });
      assets.push({
        id: `asset-vid-s${scene.sceneNumber}`,
        sceneNumber: scene.sceneNumber,
        assetType: "video_prompt",
        prompt: scene.videoPrompt,
        aspectRatio,
        styleKeywords: ["smooth-motion", "4k-footage", "professional-grade"],
      });
    }
    return assets;
  }
}
