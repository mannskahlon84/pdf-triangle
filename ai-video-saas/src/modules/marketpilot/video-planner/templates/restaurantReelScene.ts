import { SceneTemplateDefinition } from "../types/planner.types";

export const restaurantReelScene: SceneTemplateDefinition = {
  id: "restaurantReelScene",
  name: "Restaurant Reel",
  industry: "restaurant",
  defaultDuration: "30s",
  sceneStructure: [
    {
      purpose: "hook",
      durationRatio: 0.17, // 5s
      defaultTransition: "zoom-in",
      defaultAnimation: "macro-pan",
      visualGuidance: "4K slow-motion gourmet food sizzle with steam rising off signature dish",
      promptTemplate: "4K slow-motion culinary sizzle reel of gourmet steak or pasta dish, steam rising, artisan restaurant lighting, shallow depth of field",
    },
    {
      purpose: "showcase",
      durationRatio: 0.25, // 7.5s
      defaultTransition: "whip-pan",
      defaultAnimation: "ken-burns-in",
      visualGuidance: "Master chef plating artisan dish with precision in an open kitchen",
      promptTemplate: "Artisan executive chef plating gourmet meal in a bustling warm-lit restaurant kitchen, cinematic culinary documentary style",
    },
    {
      purpose: "social_proof",
      durationRatio: 0.25, // 7.5s
      defaultTransition: "fade",
      defaultAnimation: "ken-burns-out",
      visualGuidance: "Happy guests clinking wine glasses at a candlelit table",
      promptTemplate: "Elegant couple toasting wine glasses in a sophisticated warm-lit restaurant dining room, authentic laughter and ambiance",
    },
    {
      purpose: "cta",
      durationRatio: 0.33, // 10s
      defaultTransition: "cut",
      defaultAnimation: "static-highlight",
      visualGuidance: "Weekend table reservation card with address and Book Table CTA button",
      promptTemplate: "Sleek restaurant reservation end card with location badge, weekend menu specials, and Book Table Online button",
    },
  ],
};
