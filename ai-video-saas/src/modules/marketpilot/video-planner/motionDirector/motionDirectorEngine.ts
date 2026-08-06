import { VideoPlan, VideoScene, MotionMetadata } from "../types/planner.types";
import { MotionStyleRegistry, SceneMotionCategory } from "./motionStyleRegistry";

export class MotionDirectorEngine {
  /**
   * Generates a deterministic hash for picking a style based on the scene text or id.
   */
  private static deterministicPick<T>(items: T[], seed: string): T {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    return items[Math.abs(hash) % items.length];
  }

  /**
   * Applies the Motion Director AI to a video plan.
   * Modifies the plan in place by adding `motionMetadata` to each scene.
   */
  public static applyMotion(
    videoPlan: VideoPlan,
    isCinematicMode: boolean = false
  ): VideoPlan {
    const updatedScenes = videoPlan.scenes.map((scene) => {
      // Standardize purpose to a valid category
      let category: SceneMotionCategory = "feature";
      const purpose = String(scene.purpose).toLowerCase();
      
      if (purpose.includes("hook")) category = "hero";
      else if (purpose.includes("cta")) category = "cta";
      else if (purpose.includes("benefit") || purpose.includes("lifestyle")) category = "benefit";
      else category = "feature";

      const availableStyles = MotionStyleRegistry.getStylesByCategory(category);
      
      // Deterministically pick a style using the scene's voice text as a seed
      const seed = scene.voiceText || `scene-${scene.sceneNumber}`;
      const selectedStyle = this.deterministicPick(availableStyles, seed);

      // In cinematic mode, intensity could be boosted or durations prolonged. 
      // This is a placeholder for Phase 2 Cinematic AI logic.
      const intensity = isCinematicMode ? "high" : selectedStyle.defaultIntensity;

      const motionMetadata: MotionMetadata = {
        movement: selectedStyle.movement,
        emphasis: selectedStyle.emphasis,
        intensity: intensity,
        duration: 3000, // base ms logic placeholder
        reason: `Auto-assigned by Motion Director (${category} optimal style)`,
      };

      return {
        ...scene,
        motionMetadata,
      };
    });

    return {
      ...videoPlan,
      scenes: updatedScenes,
    };
  }
}
