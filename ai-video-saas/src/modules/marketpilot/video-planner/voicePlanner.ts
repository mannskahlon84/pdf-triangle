import { ScenePurpose } from "./types/planner.types";

export class VoicePlanner {
  /**
   * Generates scene-appropriate voiceover lines tailored to brand and target audience.
   */
  public static generateSceneVoiceText(
    purpose: ScenePurpose | string,
    brandName: string,
    industry: string,
    valueHook?: string,
    ctaText?: string
  ): string {
    switch (purpose) {
      case "hook":
        return valueHook || `Still managing your ${industry} the hard way? Discover the smarter way with ${brandName}.`;
      case "problem":
        return `We know how challenging it can be to stand out and deliver consistent results without the right tools.`;
      case "solution":
      case "showcase":
        return `${brandName} simplifies your entire workflow, delivering premium quality in seconds.`;
      case "benefit":
      case "social_proof":
        return `Save time, scale faster, and join thousands of satisfied customers who trust ${brandName}.`;
      case "cta":
        return ctaText || `Visit us today and start your journey with ${brandName}.`;
      default:
        return `Experience the future of ${industry} with ${brandName}.`;
    }
  }

  /**
   * Generates text overlays tailored to each scene purpose.
   */
  public static generateTextOverlay(
    purpose: ScenePurpose | string,
    brandName: string,
    valueHook?: string
  ): string {
    switch (purpose) {
      case "hook":
        return valueHook ? valueHook.slice(0, 32) : "Smarter. Faster. Better.";
      case "problem":
        return "Stop Wasting Time & Effort";
      case "solution":
      case "showcase":
        return `${brandName} Power in Action`;
      case "benefit":
      case "social_proof":
        return "Save Time. Grow Faster.";
      case "cta":
        return `Visit ${brandName} Today`;
      default:
        return brandName;
    }
  }

  /**
   * Compiles all scene voice texts into an integrated voiceover script for TTS.
   */
  public static compileFullVoiceScript(sceneVoiceTexts: string[]): string {
    return sceneVoiceTexts.join(" ");
  }
}
