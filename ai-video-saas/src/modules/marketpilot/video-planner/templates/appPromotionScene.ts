import { SceneTemplateDefinition } from "../types/planner.types";

export const appPromotionScene: SceneTemplateDefinition = {
  id: "appPromotionScene",
  name: "App Promotion",
  industry: "app",
  defaultDuration: "30s",
  sceneStructure: [
    {
      purpose: "hook",
      durationRatio: 0.17, // 5s
      defaultTransition: "zoom-in",
      defaultAnimation: "3d-float",
      visualGuidance: "Floating 3D iPhone smartphone mockup revealing the app splash screen",
      promptTemplate: "3D render of floating iPhone 15 Pro titanium mockup displaying sleek mobile app splash screen, studio lighting",
    },
    {
      purpose: "problem",
      durationRatio: 0.17, // 5s
      defaultTransition: "slide-left",
      defaultAnimation: "kinetic-text",
      visualGuidance: "User tapping screen and instantly resolving a complex task",
      promptTemplate: "Close-up of finger tapping clean mobile app UI screen, instant success checkmark animation, modern app interface",
    },
    {
      purpose: "solution",
      durationRatio: 0.33, // 10s
      defaultTransition: "whip-pan",
      defaultAnimation: "ken-burns-out",
      visualGuidance: "Dynamic split-screen walkthrough of the app's top 3 core features",
      promptTemplate: "Dynamic vertical split-screen showcasing 3 clean mobile app screens: dashboard, real-time sync, and notification alerts",
    },
    {
      purpose: "cta",
      durationRatio: 0.33, // 10s
      defaultTransition: "cut",
      defaultAnimation: "static-highlight",
      visualGuidance: "App Store and Google Play badges with Download Free CTA button",
      promptTemplate: "Clean dark glassmorphism end screen with iOS App Store and Google Play badges, glowing Download Free button",
    },
  ],
};
