export type SceneMotionCategory = "hero" | "feature" | "cta" | "benefit";

export interface MotionStyleDefinition {
  id: string;
  category: SceneMotionCategory;
  movement: string;
  emphasis: string;
  defaultIntensity: "low" | "medium" | "high";
  // The translation mappings for TimelineBuilder to convert conceptual motion into renderable primitives
  renderMapping: {
    animationStyle: string;
    transition: string;
  };
}

export class MotionStyleRegistry {
  private static styles: MotionStyleDefinition[] = [
    // Hero Motions
    {
      id: "motion_hero_push",
      category: "hero",
      movement: "slow_push_in",
      emphasis: "hero_product",
      defaultIntensity: "medium",
      renderMapping: { animationStyle: "ken-burns-in", transition: "fade" },
    },
    {
      id: "motion_hero_zoom",
      category: "hero",
      movement: "cinematic_zoom",
      emphasis: "hero_environment",
      defaultIntensity: "high",
      renderMapping: { animationStyle: "ken-burns-in", transition: "zoom-in" },
    },

    // Feature Motions
    {
      id: "motion_feature_pan",
      category: "feature",
      movement: "detail_pan",
      emphasis: "product_feature",
      defaultIntensity: "medium",
      renderMapping: { animationStyle: "macro-pan", transition: "slide-left" },
    },
    {
      id: "motion_feature_focus",
      category: "feature",
      movement: "product_focus",
      emphasis: "sharp_detail",
      defaultIntensity: "low",
      renderMapping: { animationStyle: "3d-float", transition: "fade" },
    },

    // Benefit / Lifestyle Motions
    {
      id: "motion_benefit_parallax",
      category: "benefit",
      movement: "parallax_glide",
      emphasis: "lifestyle_context",
      defaultIntensity: "medium",
      renderMapping: { animationStyle: "drone-glide", transition: "fade" },
    },
    
    // CTA Motions
    {
      id: "motion_cta_stable",
      category: "cta",
      movement: "stable_hold",
      emphasis: "brand_logo",
      defaultIntensity: "low",
      renderMapping: { animationStyle: "static-highlight", transition: "cut" },
    },
    {
      id: "motion_cta_fade",
      category: "cta",
      movement: "clean_fade_out",
      emphasis: "text_readability",
      defaultIntensity: "low",
      renderMapping: { animationStyle: "static-highlight", transition: "fade" },
    },
  ];

  public static getStylesByCategory(category: SceneMotionCategory): MotionStyleDefinition[] {
    return this.styles.filter((s) => s.category === category) || [];
  }

  public static getStyleById(id: string): MotionStyleDefinition | undefined {
    return this.styles.find((s) => s.id === id);
  }

  public static getStyleByMovement(movement: string): MotionStyleDefinition | undefined {
    return this.styles.find((s) => s.movement === movement);
  }
}
