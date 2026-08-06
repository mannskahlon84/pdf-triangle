import { CinematicInstruction, CinematicSceneResult } from "../types/cinematic.types";

export interface ICinematicProvider {
  readonly providerName: string;

  /**
   * Generates cinematic assets based on the given cinematic instruction and optionally a base image.
   * 
   * @param instruction The structured instruction containing mood, environment, etc.
   * @param baseImageUrl Optional uploaded asset to base the generation on.
   */
  generateSceneAssets(
    instruction: CinematicInstruction,
    baseImageUrl?: string
  ): Promise<CinematicSceneResult>;
}
