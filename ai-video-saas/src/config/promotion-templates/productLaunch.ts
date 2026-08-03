import { PromotionTemplateConfig } from "./brandIntroduction";

export const productLaunchTemplate: PromotionTemplateConfig = {
  name: "Product Launch",
  purpose: "Reveal a new product or collection with high-impact visuals and urgency",
  duration: "30 seconds",
  structure: [
    {
      time: "0-5",
      purpose: "Hook",
      instruction: "Dramatic reveal of product silhouette and bold headline",
    },
    {
      time: "5-20",
      purpose: "Showcase",
      instruction: "Highlight materials, craftsmanship, close-up features, and lifestyle usage",
    },
    {
      time: "20-30",
      purpose: "CTA",
      instruction: "Offer launch discount code and drive immediate purchases",
    },
  ],
  scriptPattern: "Tease -> Multi-Angle Reveal -> Key Benefit Demo -> Urgency Offer CTA",
  sceneStructure: [
    "Macro studio zoom onto product details",
    "360-degree rotating product display with floating specs",
    "Limited edition countdown badge with Shop Now button",
  ],
  ctaStyle: "Animated shopping bag icon with direct store checkout link",
};
