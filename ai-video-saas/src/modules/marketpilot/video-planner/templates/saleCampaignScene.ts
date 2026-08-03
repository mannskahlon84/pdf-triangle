import { SceneTemplateDefinition } from "../types/planner.types";

export const saleCampaignScene: SceneTemplateDefinition = {
  id: "saleCampaignScene",
  name: "Sale Campaign",
  industry: "universal",
  defaultDuration: "30s",
  sceneStructure: [
    {
      purpose: "hook",
      durationRatio: 0.17, // 5s
      defaultTransition: "zoom-in",
      defaultAnimation: "kinetic-text",
      visualGuidance: "Bold neon discount percentage card or flash sale announcement banner",
      promptTemplate: "High-contrast kinetic typography banner announcing Flash Sale 50% OFF, vibrant crimson and gold neon lighting",
    },
    {
      purpose: "showcase",
      durationRatio: 0.33, // 10s
      defaultTransition: "slide-left",
      defaultAnimation: "3d-float",
      visualGuidance: "Dynamic fast-paced montage of featured promotional products or services",
      promptTemplate: "Kinetic grid showcase of top-selling products gliding across screen with glowing price discount tags",
    },
    {
      purpose: "benefit",
      durationRatio: 0.25, // 7.5s
      defaultTransition: "whip-pan",
      defaultAnimation: "ken-burns-in",
      visualGuidance: "Urgent countdown timer animation emphasizing limited time availability",
      promptTemplate: "Sleek glowing digital countdown clock ticking down to midnight, urgency graphic overlay",
    },
    {
      purpose: "cta",
      durationRatio: 0.25, // 7.5s
      defaultTransition: "cut",
      defaultAnimation: "static-highlight",
      visualGuidance: "Promo code card with Shop Now CTA button",
      promptTemplate: "High-impact promotional end card displaying exclusive coupon code badge and vibrant Shop Now button",
    },
  ],
};
