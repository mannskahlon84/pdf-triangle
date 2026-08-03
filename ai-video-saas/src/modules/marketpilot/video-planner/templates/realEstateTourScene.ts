import { SceneTemplateDefinition } from "../types/planner.types";

export const realEstateTourScene: SceneTemplateDefinition = {
  id: "realEstateTourScene",
  name: "Real Estate Tour",
  industry: "real-estate",
  defaultDuration: "30s",
  sceneStructure: [
    {
      purpose: "hook",
      durationRatio: 0.20, // 6s
      defaultTransition: "zoom-in",
      defaultAnimation: "drone-glide",
      visualGuidance: "4K aerial drone establishing shot of luxury property and waterfront skyline",
      promptTemplate: "4K cinematic aerial drone shot gliding over a luxury modern glass penthouse with sunset waterfront skyline views",
    },
    {
      purpose: "showcase",
      durationRatio: 0.30, // 9s
      defaultTransition: "slide-left",
      defaultAnimation: "ken-burns-in",
      visualGuidance: "Steadicam interior glide through open-concept marble living room and infinity pool",
      promptTemplate: "Steadicam walkthrough of luxury open-concept marble living room opening to a private infinity pool overlooking the ocean",
    },
    {
      purpose: "benefit",
      durationRatio: 0.25, // 7.5s
      defaultTransition: "fade",
      defaultAnimation: "macro-pan",
      visualGuidance: "Architectural kitchen detail and designer master suite walk-through",
      promptTemplate: "Architectural detail shot of custom Italian marble kitchen island and floor-to-ceiling glass windows",
    },
    {
      purpose: "cta",
      durationRatio: 0.25, // 7.5s
      defaultTransition: "cut",
      defaultAnimation: "static-highlight",
      visualGuidance: "Broker contact overlay with Schedule Private Showing CTA button",
      promptTemplate: "Minimalist luxury real estate title card with property price badge, broker headshot, and Schedule Private Showing button",
    },
  ],
};
