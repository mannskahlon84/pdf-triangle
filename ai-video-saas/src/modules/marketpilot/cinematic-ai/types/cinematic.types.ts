export interface CinematicInstruction {
  visualStyle: string;     // e.g., "luxury", "futuristic", "minimal", "energetic"
  environment: string;     // e.g., "studio", "city", "nature", "premium showroom"
  lighting: string;        // e.g., "softbox", "neon", "golden hour", "dramatic"
  cameraLanguage: string;  // e.g., "macro product shot", "slow dolly", "orbit camera", "handheld cinematic"
  mood: string;            // e.g., "premium", "emotional", "powerful", "trustworthy"
  colorDirection: string;  // e.g., "dark premium", "clean white", "brand colors"
}

export interface CinematicSceneResult {
  backgroundImageUrl: string;
  productImageUrl?: string;
  supportingVisualUrls?: string[];
  providerMetadata?: Record<string, any>;
}
