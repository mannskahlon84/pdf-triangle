import { SceneTemplateDefinition } from "../types/planner.types";

export const brandIntroductionScene: SceneTemplateDefinition = {
  id: "brandIntroductionScene",
  name: "Brand Introduction",
  industry: "business",
  defaultDuration: "30s",
  sceneStructure: [
    {
      purpose: "hook",
      durationRatio: 0.17, // 5s of 30s
      defaultTransition: "zoom-in",
      defaultAnimation: "ken-burns-in",
      visualGuidance: "Modern small business office or enterprise headquarters wide shot",
      promptTemplate: "Cinematic establishing shot of a modern enterprise office with glass windows, warm daylight, high-end corporate aesthetic",
    },
    {
      purpose: "problem",
      durationRatio: 0.17, // 5s
      defaultTransition: "whip-pan",
      defaultAnimation: "kinetic-text",
      visualGuidance: "Business owner looking at multiple tasks or outdated workflow screens",
      promptTemplate: "Professional executive looking thoughtfully at dual screens showing analytics metrics, sleek corporate atmosphere",
    },
    {
      purpose: "solution",
      durationRatio: 0.23, // 7s
      defaultTransition: "slide-left",
      defaultAnimation: "ken-burns-out",
      visualGuidance: "Productivity dashboard automation in action with glowing metric increase",
      promptTemplate: "Macro view of automated SaaS software dashboard with rising growth charts, clean indigo and emerald UI lighting",
    },
    {
      purpose: "benefit",
      durationRatio: 0.23, // 7s
      defaultTransition: "fade",
      defaultAnimation: "3d-float",
      visualGuidance: "Team collaboration success and happy client handshake or celebration",
      promptTemplate: "Diverse enterprise team collaborating happily in a bright boardroom, professional smiles, corporate achievement",
    },
    {
      purpose: "cta",
      durationRatio: 0.20, // 6s
      defaultTransition: "cut",
      defaultAnimation: "static-highlight",
      visualGuidance: "Branded title card with logo, website URL, and direct CTA button",
      promptTemplate: "Minimalist dark glassmorphism title card with vibrant glowing call to action badge and sleek typography",
    },
  ],
};
