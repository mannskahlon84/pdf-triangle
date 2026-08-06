import { ICinematicProvider } from "./cinematicProvider.interface";
import { CinematicInstruction, CinematicSceneResult } from "../types/cinematic.types";

export class MockCinematicProvider implements ICinematicProvider {
  public readonly providerName = "mock";

  public async generateSceneAssets(
    instruction: CinematicInstruction,
    baseImageUrl?: string
  ): Promise<CinematicSceneResult> {
    // In a real implementation, this would call Flux or Replicate APIs.
    // For Phase 1, we return deterministically mapped mock URLs based on the style to prove the architecture.
    
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let bgUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80"; // Default abstract
    
    if (instruction.environment.includes("city")) {
      bgUrl = "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1080&q=80";
    } else if (instruction.environment.includes("nature")) {
      bgUrl = "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1080&q=80";
    } else if (instruction.visualStyle.includes("luxury")) {
      bgUrl = "https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&w=1080&q=80";
    }

    return {
      backgroundImageUrl: bgUrl,
      productImageUrl: baseImageUrl,
      supportingVisualUrls: [
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80"
      ],
      providerMetadata: {
        model: "mock-cinematic-v1",
        generatedAt: new Date().toISOString(),
        instructionSnapshot: instruction
      }
    };
  }
}
