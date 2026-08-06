export type AssetRole = "hero" | "feature" | "benefit" | "cta";
export type AssetAngle = "front" | "side" | "top" | "lifestyle";

export interface AssetMetrics {
  sharpness: number;
  resolution: number;
  productVisibility: number;
  productSize: number;
  lighting: number;
  backgroundCleanliness: number;
  visualAppeal: number;
  angle: AssetAngle;
}

export interface AnalyzedAsset {
  id: string;
  url: string;
  role: AssetRole;
  score: number; // Quality/Match score 0 to 100 for the assigned role
  metrics: AssetMetrics;
  titleOverlay: string;
  visualDescription: string;
}

export class AssetAnalyzer {
  /**
   * Generates a deterministic pseudo-random number between min and max based on a string seed
   */
  private static hashScore(str: string, seed: string, min: number, max: number): number {
    let hash = 0;
    const combined = str + seed;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    return min + (Math.abs(hash) % (max - min + 1));
  }

  /**
   * Simulates an AI Vision Analysis of the image to extract composition metrics.
   */
  public static simulateVisionAnalysis(url: string, index: number): AssetMetrics {
    const angles: AssetAngle[] = ["front", "side", "lifestyle", "top"];
    
    // We use index as a fallback hint to guarantee diversity in angles for the mock,
    // but the scores themselves will be pseudo-random based on the URL to simulate real AI evaluation.
    const angleIndex = this.hashScore(url, "angle", 0, 100) % 4;
    
    return {
      sharpness: this.hashScore(url, "sharpness", 60, 100),
      resolution: this.hashScore(url, "resolution", 70, 100),
      productVisibility: this.hashScore(url, "visibility", 50, 100),
      productSize: this.hashScore(url, "size", 40, 100),
      lighting: this.hashScore(url, "lighting", 60, 100),
      backgroundCleanliness: this.hashScore(url, "cleanliness", 40, 100),
      visualAppeal: this.hashScore(url, "appeal", 65, 100),
      angle: angles[(angleIndex + index) % 4], // ensure diversity by offsetting with index
    };
  }

  /**
   * Scores an asset's fitness for a specific marketing role based on its visual metrics.
   */
  private static calculateRoleFitness(metrics: AssetMetrics, role: AssetRole): number {
    let score = 0;
    switch (role) {
      case "hero":
        // Hook: Highest quality, front angle, large product
        score = (metrics.sharpness * 1.5 + metrics.productSize * 1.2 + metrics.visualAppeal * 1.5) / 4.2;
        if (metrics.angle === "front") score += 15;
        break;
      case "feature":
        // Feature: Side angle, high visibility, close-up (productSize)
        score = (metrics.productVisibility * 1.5 + metrics.resolution + metrics.productSize) / 3.5;
        if (metrics.angle === "side") score += 15;
        break;
      case "benefit":
        // Benefit: Lifestyle angle, beautiful lighting, appeal
        score = (metrics.visualAppeal * 1.5 + metrics.lighting * 1.2 + metrics.backgroundCleanliness) / 3.7;
        if (metrics.angle === "lifestyle") score += 15;
        break;
      case "cta":
        // CTA: Cleanest background, brand emphasis
        score = (metrics.backgroundCleanliness * 1.8 + metrics.sharpness + metrics.productVisibility) / 3.8;
        if (metrics.angle === "top" || metrics.angle === "front") score += 10;
        break;
    }
    return Math.min(Math.round(score), 100);
  }

  /**
   * Analyzes uploaded product images using simulated Vision AI to determine
   * asset quality metrics, and optimally assigns roles across
   * the 4-part marketing structure: Hook, Feature, Benefit, CTA.
   */
  public static analyze(
    mediaUrls: string[],
    brandName: string = "Brand",
    industry: string = "electronics"
  ): AnalyzedAsset[] {
    const validUrls = (mediaUrls || []).filter((u) => Boolean(u) && u.trim().length > 0);

    if (validUrls.length === 0) {
      return [];
    }

    const defaultOverlays: Record<AssetRole, string> = {
      hero: `${brandName} Deep Bass`,
      feature: "HD Audio Drivers",
      benefit: "40 Hr Battery Life",
      cta: "Order Today",
    };

    const defaultDescriptions: Record<AssetRole, string> = {
      hero: "Front Hero Product Shot",
      feature: "Product Detail / Side Angle",
      benefit: "Lifestyle Comfort Shot",
      cta: "Clean Product Call to Action",
    };

    // 1. Analyze all images
    const pool = validUrls.map((url, idx) => ({
      url,
      metrics: this.simulateVisionAnalysis(url, idx)
    }));

    // 2. Optimally assign roles based on fitness
    const roles: AssetRole[] = ["hero", "feature", "benefit", "cta"];
    const assignedAssets: AnalyzedAsset[] = [];
    const availablePool = [...pool];

    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      
      // If we run out of unique images, we recycle the best overall from the original pool
      const searchPool = availablePool.length > 0 ? availablePool : pool;
      
      // Score all available images for this role
      const scored = searchPool.map(asset => ({
        ...asset,
        fitness: this.calculateRoleFitness(asset.metrics, role)
      }));

      // Sort by best fitness
      scored.sort((a, b) => b.fitness - a.fitness);
      const bestMatch = scored[0];

      assignedAssets.push({
        id: `asset_${role}_${i + 1}`,
        url: bestMatch.url,
        role,
        score: bestMatch.fitness,
        metrics: bestMatch.metrics,
        titleOverlay: defaultOverlays[role],
        visualDescription: defaultDescriptions[role],
      });

      // Remove assigned image from available pool to avoid duplicates (unless we ran out)
      if (availablePool.length > 0) {
        const removeIdx = availablePool.findIndex(a => a.url === bestMatch.url);
        if (removeIdx > -1) availablePool.splice(removeIdx, 1);
      }
    }

    return assignedAssets;
  }

  /**
   * Selects the Hero Image from an array of analyzed assets.
   */
  public static chooseHeroImage(assets: AnalyzedAsset[]): AnalyzedAsset | undefined {
    if (!assets || assets.length === 0) return undefined;
    return (
      assets.find((a) => a.role === "hero") ||
      [...assets].sort((a, b) => b.score - a.score)[0]
    );
  }
}
