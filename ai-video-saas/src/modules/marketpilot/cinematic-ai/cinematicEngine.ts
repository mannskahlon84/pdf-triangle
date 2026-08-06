import { VideoPlan } from "../video-planner/types/planner.types";
import { CinematicInstruction } from "./types/cinematic.types";
import { CinematicProviderRegistry } from "./providers/cinematicProviderRegistry";
import { MockCinematicProvider } from "./providers/mockCinematicProvider";

// Register default providers
CinematicProviderRegistry.registerProvider(new MockCinematicProvider());

export class CinematicEngine {
  /**
   * Translates a standard scene purpose into a rich cinematic instruction.
   */
  private static generateInstructionForScene(purpose: string, industry: string): CinematicInstruction {
    const purposeLower = String(purpose).toLowerCase();
    
    // Default fallback
    let instruction: CinematicInstruction = {
      visualStyle: "luxury",
      environment: "premium showroom",
      lighting: "softbox",
      cameraLanguage: "slow dolly",
      mood: "premium",
      colorDirection: "clean white"
    };

    if (purposeLower.includes("hook")) {
      instruction = {
        visualStyle: "energetic",
        environment: "city",
        lighting: "neon",
        cameraLanguage: "macro product shot",
        mood: "powerful",
        colorDirection: "dark premium"
      };
    } else if (purposeLower.includes("benefit") || purposeLower.includes("lifestyle")) {
      instruction = {
        visualStyle: "minimal",
        environment: "nature",
        lighting: "golden hour",
        cameraLanguage: "handheld cinematic",
        mood: "emotional",
        colorDirection: "brand colors"
      };
    } else if (purposeLower.includes("showcase")) {
      instruction = {
        visualStyle: "futuristic",
        environment: "studio",
        lighting: "dramatic",
        cameraLanguage: "orbit camera",
        mood: "trustworthy",
        colorDirection: "dark premium"
      };
    }

    return instruction;
  }

  /**
   * Applies the Cinematic AI layer to a VideoPlan.
   * Modifies the plan in place by overwriting backgroundImageUrl and productImageUrl,
   * without exposing CinematicInstruction to downstream RenderTimelines.
   */
  public static async applyCinematicGeneration(
    videoPlan: VideoPlan,
    providerName?: string
  ): Promise<VideoPlan> {
    const provider = CinematicProviderRegistry.getProvider(providerName);
    
    const updatedScenes = await Promise.all(
      videoPlan.scenes.map(async (scene) => {
        try {
          const instruction = this.generateInstructionForScene(
            scene.purpose as string, 
            "default"
          );

          // Attempt generation
          const result = await provider.generateSceneAssets(
            instruction,
            scene.productImageUrl || scene.backgroundImageUrl // Use existing hybrid asset as base
          );

          // Success: Map the results strictly to standard URL strings
          return {
            ...scene,
            backgroundImageUrl: result.backgroundImageUrl,
            productImageUrl: result.productImageUrl || scene.productImageUrl,
            supportingVisualUrls: result.supportingVisualUrls || scene.supportingVisualUrls,
            // We can optionally store the metadata for analytics, but we don't pass the instruction to RenderTimeline.
            cinematicMetadata: result.providerMetadata
          };
        } catch (error) {
          console.error(`Cinematic generation failed for scene ${scene.sceneNumber}:`, error);
          // Fallback mechanism: Cinematic AI -> Hybrid AI -> Standard rendering
          // By returning the original scene, we natively fall back to Hybrid/Standard assets.
          return scene;
        }
      })
    );

    return {
      ...videoPlan,
      scenes: updatedScenes,
    };
  }
}
