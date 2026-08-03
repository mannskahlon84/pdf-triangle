import { PromotionTemplateConfig } from "./brandIntroduction";

export const appLaunchTemplate: PromotionTemplateConfig = {
  name: "App Launch",
  purpose: "Drive mobile application installs on iOS App Store & Android Play Store",
  duration: "30 seconds",
  structure: [
    {
      time: "0-5",
      purpose: "Problem Hook",
      instruction: "State the user's biggest daily pain point or inefficiency",
    },
    {
      time: "5-20",
      purpose: "App Features Showcase",
      instruction: "Dynamic screen recordings showing how the app solves the problem in 2 taps",
    },
    {
      time: "20-30",
      purpose: "Download CTA",
      instruction: "Show iOS & Android store badges with free download link",
    },
  ],
  scriptPattern: "Pain Hook -> Screen Demo -> Speed Proof -> App Store CTA",
  sceneStructure: [
    "3D device mockup floating in space with notification popups",
    "Screen recording with cursor/finger tap highlights",
    "Dual App Store & Google Play download badges",
  ],
  ctaStyle: "App store install button with QR code and instant download link",
};
