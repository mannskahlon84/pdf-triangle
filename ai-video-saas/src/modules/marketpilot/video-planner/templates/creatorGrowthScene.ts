import { SceneTemplateDefinition } from "../types/planner.types";

export const creatorGrowthScene: SceneTemplateDefinition = {
  id: "creatorGrowthScene",
  name: "Creator Growth Reel",
  industry: "social-profile",
  defaultDuration: "30s",
  sceneStructure: [
    {
      purpose: "hook",
      durationRatio: 0.17, // 5s
      defaultTransition: "zoom-in",
      defaultAnimation: "kinetic-text",
      visualGuidance: "Vertical talking head creator hook with dynamic karaoke subtitles",
      promptTemplate: "Vertical 9:16 studio shot of charismatic content creator speaking directly to camera, vibrant neon rim light, dynamic subtitle box",
    },
    {
      purpose: "problem",
      durationRatio: 0.23, // 7s
      defaultTransition: "whip-pan",
      defaultAnimation: "ken-burns-in",
      visualGuidance: "Split screen of common mistake vs expert technique demonstration",
      promptTemplate: "Vertical split-screen comparing common rookie mistake on top with professional creator workflow below",
    },
    {
      purpose: "solution",
      durationRatio: 0.33, // 10s
      defaultTransition: "slide-left",
      defaultAnimation: "ken-burns-out",
      visualGuidance: "Screen recording tutorial or high-value actionable checklist steps",
      promptTemplate: "Clean animated checklist graphic with 3 golden rules for viral subscriber growth, bold kinetic typography",
    },
    {
      purpose: "cta",
      durationRatio: 0.27, // 8s
      defaultTransition: "cut",
      defaultAnimation: "static-highlight",
      visualGuidance: "Subscribe bell animation with Follow for Daily Tips profile badge",
      promptTemplate: "Sleek social media profile end card with animated Subscribe button, notification bell icon, and handle badge",
    },
  ],
};
