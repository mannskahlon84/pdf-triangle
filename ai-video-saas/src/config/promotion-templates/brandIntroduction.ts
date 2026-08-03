export interface PromotionTemplateStructure {
  time: string;
  purpose: string;
  instruction: string;
}

export interface PromotionTemplateConfig {
  name: string;
  purpose: string;
  duration: string;
  structure: PromotionTemplateStructure[];
  scriptPattern: string;
  sceneStructure: string[];
  ctaStyle: string;
}

export const brandIntroductionTemplate: PromotionTemplateConfig = {
  name: "Brand Introduction",
  purpose: "Introduce a business, service, or brand with high authority and credibility",
  duration: "30 seconds",
  structure: [
    {
      time: "0-5",
      purpose: "Hook",
      instruction: "Create attention grabbing opening with core problem statement",
    },
    {
      time: "5-20",
      purpose: "Benefits",
      instruction: "Show value proposition, features, and key differentiators",
    },
    {
      time: "20-30",
      purpose: "CTA",
      instruction: "Ask users to visit website, schedule demo, or follow brand",
    },
  ],
  scriptPattern: "Problem Hook -> Solution Introduction -> Key Proof -> Direct CTA",
  sceneStructure: [
    "High-contrast text overlay with cinematic establishing shot",
    "Multi-angle feature showcase or UI walkthrough",
    "Animated brand logo card with clear action URL",
  ],
  ctaStyle: "Bold button overlay with website URL & instant action prompt",
};
