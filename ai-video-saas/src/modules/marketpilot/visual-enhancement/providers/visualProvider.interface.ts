import {
  VisualEnhancementMode,
  VisualEnhancementRequest,
  VisualEnhancementResult,
} from "../enhancement.types";

export interface IVisualProvider {
  readonly name: string;
  readonly supportedModes: VisualEnhancementMode[];

  validateCredentials(): Promise<boolean>;

  removeBackground(sourceUrl: string): Promise<string>;

  enhanceProductScene(
    req: VisualEnhancementRequest
  ): Promise<VisualEnhancementResult>;

  generateCinematicEnvironment?(
    req: VisualEnhancementRequest
  ): Promise<VisualEnhancementResult>;
}
