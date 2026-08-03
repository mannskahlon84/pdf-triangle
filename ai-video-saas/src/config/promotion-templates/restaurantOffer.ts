import { PromotionTemplateConfig } from "./brandIntroduction";

export const restaurantOfferTemplate: PromotionTemplateConfig = {
  name: "Restaurant Offer",
  purpose: "Showcase dining ambiance and signature dishes to drive table reservations and foot traffic",
  duration: "30 seconds",
  structure: [
    {
      time: "0-5",
      purpose: "Sizzling Food Hook",
      instruction: "High-definition macro video of sizzling signature dish or chef plating",
    },
    {
      time: "5-20",
      purpose: "Ambiance & Menu Showcase",
      instruction: "Walkthrough of restaurant interior, cocktails, and happy hour specials",
    },
    {
      time: "20-30",
      purpose: "Reservation CTA",
      instruction: "Present weekend special offer with instant table reservation prompt",
    },
  ],
  scriptPattern: "Visual Taste Hook -> Signature Menu Tour -> Location & Weekend Offer CTA",
  sceneStructure: [
    "4K slow-motion sizzle/steam shot of food",
    "Customer cheers and cozy interior lighting montage",
    "Location address card with Reserve Table button",
  ],
  ctaStyle: "Reservation button with address and phone number overlay",
};
