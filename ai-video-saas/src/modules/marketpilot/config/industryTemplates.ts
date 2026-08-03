import { PromotionTargetType } from "@/types/database";
import { CampaignGoal } from "../types/promotion.types";

export interface IndustryTemplateMetadata {
  id: string;
  industry: PromotionTargetType;
  displayName: string;
  defaultGoal: CampaignGoal;
  recommendedTemplates: string[];
  visualAesthetic: string;
  keywords: string[];
}

export const INDUSTRY_TEMPLATE_METADATA: Record<string, IndustryTemplateMetadata> = {
  business: {
    id: "business",
    industry: "business",
    displayName: "Corporate & B2B Agency",
    defaultGoal: "lead_generation",
    recommendedTemplates: ["Brand Introduction", "Service Explanation", "Recruitment Campaign"],
    visualAesthetic: "Sleek Corporate Enterprise Glassmorphism",
    keywords: ["B2B", "enterprise", "reliability", "scalability", "team"],
  },
  product: {
    id: "product",
    industry: "product",
    displayName: "E-Commerce & Retail Product",
    defaultGoal: "sales_conversion",
    recommendedTemplates: ["Product Launch", "Product Showcase", "Sale Announcement"],
    visualAesthetic: "High-Contrast Studio Macro Photography & Kinetic Typography",
    keywords: ["buy now", "limited drop", "shipping", "discount", "360 view"],
  },
  website: {
    id: "website",
    industry: "website",
    displayName: "SaaS & Web Application",
    defaultGoal: "lead_generation",
    recommendedTemplates: ["Brand Introduction", "Feature Walkthrough", "Sale Announcement"],
    visualAesthetic: "Clean UI Screen Walkthroughs & Dynamic Cursor Clicks",
    keywords: ["SaaS", "cloud", "free trial", "automation", "dashboard"],
  },
  app: {
    id: "app",
    industry: "app",
    displayName: "Mobile App (iOS / Android)",
    defaultGoal: "app_installs",
    recommendedTemplates: ["App Launch", "Feature Demo", "Brand Introduction"],
    visualAesthetic: "3D Floating Mockups & Touch Interaction Beats",
    keywords: ["download", "app store", "play store", "mobile", "on-the-go"],
  },
  "social-profile": {
    id: "social-profile",
    industry: "social-profile",
    displayName: "Social Profile & Creator",
    defaultGoal: "audience_growth",
    recommendedTemplates: ["Influencer Growth", "Brand Introduction"],
    visualAesthetic: "Vertical Talking Head with Dynamic Karaoke Captions",
    keywords: ["follow", "subscribe", "daily tips", "viral", "community"],
  },
  restaurant: {
    id: "restaurant",
    industry: "restaurant",
    displayName: "Restaurant & Culinary",
    defaultGoal: "sales_conversion",
    recommendedTemplates: ["Restaurant Offer", "Event Promotion", "Sale Announcement"],
    visualAesthetic: "4K Slow-Motion Food Sizzle & Artisan Ambiance",
    keywords: ["reserve", "menu", "chef", "dining", "flavor", "weekend"],
  },
  shop: {
    id: "shop",
    industry: "shop",
    displayName: "Retail Shop & Boutique",
    defaultGoal: "sales_conversion",
    recommendedTemplates: ["Sale Announcement", "Product Launch", "Brand Introduction"],
    visualAesthetic: "Streetwear Editorial & Dynamic Promo Strikethroughs",
    keywords: ["in-store", "boutique", "collection", "drop", "sale"],
  },
  "real-estate": {
    id: "real-estate",
    industry: "real-estate",
    displayName: "Real Estate & Luxury Properties",
    defaultGoal: "lead_generation",
    recommendedTemplates: ["Property Showcase", "Luxury Home Tour", "Brand Introduction"],
    visualAesthetic: "Cinematic Drone Aerials & Golden Hour Interior Glides",
    keywords: ["luxury", "penthouse", "tour", "broker", "view", "architecture"],
  },
  "hotel-hospitality": {
    id: "hotel-hospitality",
    industry: "hotel-hospitality",
    displayName: "Hotel & Resort Hospitality",
    defaultGoal: "sales_conversion",
    recommendedTemplates: ["Hotel Introduction", "Event Promotion", "Brand Introduction"],
    visualAesthetic: "Tropical Beachfront Luxury & Relaxed Slow-Motion Ambiance",
    keywords: ["resort", "escape", "villa", "all-inclusive", "booking"],
  },
  "fitness-gym": {
    id: "fitness-gym",
    industry: "fitness-gym",
    displayName: "Fitness Center & Gym",
    defaultGoal: "lead_generation",
    recommendedTemplates: ["Transformation Story", "Sale Announcement", "Brand Introduction"],
    visualAesthetic: "High-Energy EDM Workout Cuts & Gritty Iron Contrast",
    keywords: ["shred", "challenge", "free pass", "trainer", "transformation"],
  },
  education: {
    id: "education",
    industry: "education",
    displayName: "Education, School & Online Course",
    defaultGoal: "lead_generation",
    recommendedTemplates: ["Course Introduction", "Brand Introduction", "Recruitment Campaign"],
    visualAesthetic: "Clean Infographic Typography & Inspirational Campus B-Roll",
    keywords: ["bootcamp", "enroll", "scholarship", "curriculum", "career"],
  },
  "salon-beauty": {
    id: "salon-beauty",
    industry: "salon-beauty",
    displayName: "Salon, Spa & Beauty Care",
    defaultGoal: "sales_conversion",
    recommendedTemplates: ["Service Showcase", "Sale Announcement", "Brand Introduction"],
    visualAesthetic: "Satisfying Before/After Glamour Zoom & Warm Esthetics",
    keywords: ["balayage", "treatment", "book online", "glam", "spa"],
  },
  healthcare: {
    id: "healthcare",
    industry: "healthcare",
    displayName: "Healthcare, Medical & Wellness",
    defaultGoal: "lead_generation",
    recommendedTemplates: ["Clinic Introduction", "Brand Introduction"],
    visualAesthetic: "Warm Patient Trust & Clean High-Tech Diagnostic Tour",
    keywords: ["doctor", "consultation", "care", "specialist", "health"],
  },
  recruitment: {
    id: "recruitment",
    industry: "recruitment",
    displayName: "Corporate Recruitment & HR",
    defaultGoal: "recruitment",
    recommendedTemplates: ["Recruitment Campaign", "Brand Introduction"],
    visualAesthetic: "Dynamic Workplace Team Culture & Fast Career Callouts",
    keywords: ["hiring", "careers", "benefits", "remote", "apply now"],
  },
  "freelancer-personal-brand": {
    id: "freelancer-personal-brand",
    industry: "freelancer-personal-brand",
    displayName: "Freelancer, Consultant & Coach",
    defaultGoal: "lead_generation",
    recommendedTemplates: ["Portfolio Introduction", "Brand Introduction", "Influencer Growth"],
    visualAesthetic: "Cinematic Case Study Showcase & Bold Metric Overlay",
    keywords: ["hire me", "discovery call", "results", "portfolio", "sprint"],
  },
};

export const getIndustryMetadata = (industry: string): IndustryTemplateMetadata => {
  return (
    INDUSTRY_TEMPLATE_METADATA[industry] ||
    INDUSTRY_TEMPLATE_METADATA["business"]
  );
};
