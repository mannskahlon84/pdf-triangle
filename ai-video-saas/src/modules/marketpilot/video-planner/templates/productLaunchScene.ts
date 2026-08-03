import { SceneTemplateDefinition } from "../types/planner.types";

export const productLaunchScene: SceneTemplateDefinition = {
  id: "productLaunchScene",
  name: "Product Launch",
  industry: "product",
  defaultDuration: "30s",
  sceneStructure: [
    {
      purpose: "hook",
      durationRatio: 0.17, // 5s
      defaultTransition: "zoom-in",
      defaultAnimation: "macro-pan",
      visualGuidance: "Macro slow-motion texture reveal of the new product under studio lights",
      promptTemplate: "Ultra-high-definition studio macro photography of premium luxury product texture, dramatic rim lighting, 8k resolution",
    },
    {
      purpose: "showcase",
      durationRatio: 0.25, // 7.5s
      defaultTransition: "slide-left",
      defaultAnimation: "3d-float",
      visualGuidance: "360-degree floating product turntable rotation from multiple camera angles",
      promptTemplate: "Cinematic 360-degree floating turntable reveal of product against clean dark glassmorphic studio backdrop",
    },
    {
      purpose: "benefit",
      durationRatio: 0.25, // 7.5s
      defaultTransition: "whip-pan",
      defaultAnimation: "kinetic-text",
      visualGuidance: "Lifestyle shot of customer using product with joy and ease",
      promptTemplate: "High-end lifestyle commercial shot of confident customer enjoying product in a modern urban apartment, golden hour lighting",
    },
    {
      purpose: "cta",
      durationRatio: 0.33, // 10s
      defaultTransition: "cut",
      defaultAnimation: "static-highlight",
      visualGuidance: "Strikethrough discount price card with Order Now button and shipping badge",
      promptTemplate: "Sleek e-commerce end card displaying product box, limited drop price strikethrough, and Order Today CTA badge",
    },
  ],
};
