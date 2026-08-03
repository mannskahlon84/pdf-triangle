import { SceneTemplateDefinition } from "../types/planner.types";

export const recruitmentVideoScene: SceneTemplateDefinition = {
  id: "recruitmentVideoScene",
  name: "Recruitment Video",
  industry: "recruitment",
  defaultDuration: "30s",
  sceneStructure: [
    {
      purpose: "hook",
      durationRatio: 0.17, // 5s
      defaultTransition: "zoom-in",
      defaultAnimation: "ken-burns-in",
      visualGuidance: "Energetic team huddle or modern office collaboration wide shot",
      promptTemplate: "Modern open-concept tech office with diverse engineering team collaborating around an interactive whiteboard, upbeat corporate energy",
    },
    {
      purpose: "showcase",
      durationRatio: 0.30, // 9s
      defaultTransition: "slide-left",
      defaultAnimation: "kinetic-text",
      visualGuidance: "Employee testimonial quote or highlights of company benefits & culture",
      promptTemplate: "Smiling senior software engineer speaking in a bright executive lounge, clean glass windows, modern professional atmosphere",
    },
    {
      purpose: "benefit",
      durationRatio: 0.23, // 7s
      defaultTransition: "fade",
      defaultAnimation: "3d-float",
      visualGuidance: "Remote work flexibility and competitive career perks typography card",
      promptTemplate: "Clean infographic card showing top employee benefits: remote flexibility, competitive equity, and continuous learning",
    },
    {
      purpose: "cta",
      durationRatio: 0.30, // 9s
      defaultTransition: "cut",
      defaultAnimation: "static-highlight",
      visualGuidance: "Careers page URL card with Apply Today CTA button",
      promptTemplate: "Sleek corporate recruitment end card with company logo, careers portal link, and glowing Apply Today button",
    },
  ],
};
