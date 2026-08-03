import { TemplateRegistryEntry, CampaignGoal } from "../types/promotion.types";
import { PROMOTION_TEMPLATES_CONFIG } from "@/config/promotion-templates";
import { PromotionTargetType } from "@/types/database";

// Create structured registry items from our 16 PromotionTemplates
export const TEMPLATE_REGISTRY: TemplateRegistryEntry[] = [
  {
    id: "brand_introduction",
    name: "Brand Introduction",
    industry: "universal",
    category: "brand",
    supportedGoals: ["brand_awareness", "lead_generation"],
    duration: "30s",
    purpose: "Establish authority and explain core value proposition",
    scriptPattern: "Problem -> Unique Solution -> Social Proof -> CTA",
    sceneStructure: ["Dynamic Logo Title Card", "Workplace/Product B-Roll", "Website URL Card"],
    ctaStyle: "Learn More Today button with website badge",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Brand Introduction"].structure,
  },
  {
    id: "product_launch",
    name: "Product Launch",
    industry: "product",
    category: "product",
    supportedGoals: ["product_launch", "sales_conversion"],
    duration: "30s",
    purpose: "Introduce a new physical or digital product with high visual impact",
    scriptPattern: "Hook Feature -> 360 Showcase -> Key Specs -> Order CTA",
    sceneStructure: ["Macro Product Zoom", "360 Multi-Angle Reveal", "Strikethrough Price Card"],
    ctaStyle: "Order Today button with express shipping badge",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Product Launch"].structure,
  },
  {
    id: "sale_announcement",
    name: "Sale Announcement",
    industry: "universal",
    category: "sales",
    supportedGoals: ["sales_conversion"],
    duration: "30s",
    purpose: "Announce flash sales, seasonal discounts, or promotional codes",
    scriptPattern: "Bold % OFF -> Featured Deals -> Deadline -> Shop CTA",
    sceneStructure: ["Neon Discount Banner", "Product Grid Slideshow", "Countdown Clock"],
    ctaStyle: "Claim Discount button with promo code badge",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Sale Announcement"].structure,
  },
  {
    id: "app_launch",
    name: "App Launch",
    industry: "app",
    category: "app",
    supportedGoals: ["app_installs", "product_launch"],
    duration: "30s",
    purpose: "Showcase mobile app screens and drive app store installations",
    scriptPattern: "Problem Hook -> Screen Demo -> Core Features -> Download CTA",
    sceneStructure: ["Floating iPhone 3D Mockup", "Screen Tap Highlight", "App Store Badges"],
    ctaStyle: "Download on App Store & Play Store button",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["App Launch"].structure,
  },
  {
    id: "restaurant_offer",
    name: "Restaurant Offer",
    industry: "restaurant",
    category: "food",
    supportedGoals: ["sales_conversion", "event_rsvps"],
    duration: "30s",
    purpose: "Showcase signature menu dishes and weekend table offers",
    scriptPattern: "Sizzle Hook -> Artisan Dishes -> Weekend Offer -> Table CTA",
    sceneStructure: ["Slow-Motion Gourmet Dish Sizzle", "Chef Preparation Cut", "Reservation Link"],
    ctaStyle: "Reserve Your Table Now button",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Restaurant Offer"].structure,
  },
  {
    id: "event_promotion",
    name: "Event Promotion",
    industry: "universal",
    category: "event",
    supportedGoals: ["event_rsvps"],
    duration: "30s",
    purpose: "Drive ticket sales and RSVPs for live or virtual events",
    scriptPattern: "Date & City Hook -> Headliners -> Attendee Vibe -> RSVP CTA",
    sceneStructure: ["Event Logo & Date Card", "Crowd & Speaker Stage", "Ticket Tier Card"],
    ctaStyle: "Get Tickets button with early-bird badge",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Event Promotion"].structure,
  },
  {
    id: "recruitment_campaign",
    name: "Recruitment Campaign",
    industry: "recruitment",
    category: "hr",
    supportedGoals: ["recruitment", "brand_awareness"],
    duration: "30s",
    purpose: "Attract qualified engineering and enterprise talent",
    scriptPattern: "Career Question -> Culture Showcase -> Testimonial -> Apply CTA",
    sceneStructure: ["Workplace Wide Shot", "Team Collaboration B-Roll", "Careers URL Card"],
    ctaStyle: "Apply Today button with direct ATS link",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Recruitment Campaign"].structure,
  },
  {
    id: "influencer_growth",
    name: "Influencer Growth",
    industry: "social-profile",
    category: "creator",
    supportedGoals: ["audience_growth"],
    duration: "30s",
    purpose: "Grow social media followers and YouTube subscribers",
    scriptPattern: "Value Hook -> Proof Montage -> Daily Content Promise -> Follow CTA",
    sceneStructure: ["Talking Head Hook", "Tutorial Screen Split", "Subscribe Bell Animation"],
    ctaStyle: "Follow Channel button with profile badge",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Influencer Growth"].structure,
  },
  {
    id: "property_showcase",
    name: "Property Showcase",
    industry: "real-estate",
    category: "real-estate",
    supportedGoals: ["lead_generation", "sales_conversion"],
    duration: "30s",
    purpose: "Showcase luxury properties, architecture, and prime locations",
    scriptPattern: "Skyline Reveal -> Interior Masterpiece -> Amenities -> Schedule Tour CTA",
    sceneStructure: ["4K Drone Establishing Shot", "Steadicam Glide", "Broker Contact Overlay"],
    ctaStyle: "Schedule Private Tour button",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Property Showcase"].structure,
  },
  {
    id: "luxury_home_tour",
    name: "Luxury Home Tour",
    industry: "real-estate",
    category: "real-estate",
    supportedGoals: ["lead_generation"],
    duration: "30s",
    purpose: "Immersive architectural walk-through of high-end real estate",
    scriptPattern: "Exclusive Address -> Designer Details -> Views -> VIP Tour CTA",
    sceneStructure: ["Sunset Infinity Pool Shot", "Marble Detail Zoom", "Confidential Showing Card"],
    ctaStyle: "Request Confidential Brochure button",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Luxury Home Tour"].structure,
  },
  {
    id: "hotel_introduction",
    name: "Hotel Introduction",
    industry: "hotel-hospitality",
    category: "hospitality",
    supportedGoals: ["sales_conversion", "brand_awareness"],
    duration: "30s",
    purpose: "Attract holiday travelers with resort amenities and views",
    scriptPattern: "Paradise Escape -> Luxury Room & Spa -> Dining -> Direct Booking CTA",
    sceneStructure: ["Tropical Aerial Vista", "Poolside Cocktail Cut", "Seasonal Discount Badge"],
    ctaStyle: "Book Direct & Save 25% button",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Hotel Introduction"].structure,
  },
  {
    id: "transformation_story",
    name: "Transformation Story",
    industry: "fitness-gym",
    category: "fitness",
    supportedGoals: ["lead_generation", "sales_conversion"],
    duration: "30s",
    purpose: "Show real fitness transformation results to motivate memberships",
    scriptPattern: "Frustration Hook -> Energy Training Proof -> Milestones -> Free Pass CTA",
    sceneStructure: ["Dynamic EDM Workout Hook", "Coach Instruction B-Roll", "7-Day Free Pass Card"],
    ctaStyle: "Claim 7-Day Free Gym Pass button",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Transformation Story"].structure,
  },
  {
    id: "course_introduction",
    name: "Course Introduction",
    industry: "education",
    category: "education",
    supportedGoals: ["lead_generation", "sales_conversion"],
    duration: "30s",
    purpose: "Enroll students in high-income digital courses and bootcamps",
    scriptPattern: "High-Income Skill Hook -> Projects -> Mentorship Proof -> Apply CTA",
    sceneStructure: ["Bold Career Earnings Typography", "Code Lesson Preview", "Scholarship Code Card"],
    ctaStyle: "Apply Now with 40% Scholarship button",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Course Introduction"].structure,
  },
  {
    id: "service_showcase",
    name: "Service Showcase",
    industry: "salon-beauty",
    category: "beauty",
    supportedGoals: ["sales_conversion", "brand_awareness"],
    duration: "30s",
    purpose: "Showcase beauty and salon treatments with before/after visuals",
    scriptPattern: "Satisfying Reveal -> Artisan Technique -> Client Delight -> Book Online CTA",
    sceneStructure: ["Glamour Final Look Zoom", "Treatment B-Roll", "Online Appointment Card"],
    ctaStyle: "Book Your Appointment Online button",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Service Showcase"].structure,
  },
  {
    id: "clinic_introduction",
    name: "Clinic Introduction",
    industry: "healthcare",
    category: "healthcare",
    supportedGoals: ["lead_generation", "brand_awareness"],
    duration: "30s",
    purpose: "Build trust with prospective patients seeking specialized care",
    scriptPattern: "Symptom Empathy Hook -> Board Authority -> Modern Care -> Schedule CTA",
    sceneStructure: ["Warm Patient Interaction", "High-Tech Diagnostics", "Insurance & Consult Card"],
    ctaStyle: "Schedule Consultation Today button",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Clinic Introduction"].structure,
  },
  {
    id: "portfolio_introduction",
    name: "Portfolio Introduction",
    industry: "freelancer-personal-brand",
    category: "freelancer",
    supportedGoals: ["lead_generation", "brand_awareness"],
    duration: "30s",
    purpose: "Establish authority for independent designers, developers & coaches",
    scriptPattern: "Authority Hook -> Case Study Metrics -> Praise -> Book Call CTA",
    sceneStructure: ["Personal Studio B-Roll", "Metric Overlay", "Calendar Scheduling Card"],
    ctaStyle: "Book a Discovery Call button",
    templateStructure: PROMOTION_TEMPLATES_CONFIG["Portfolio Introduction"].structure,
  },
];

/**
 * Dynamic Template Finder for AI Engine
 */
export const findTemplatesByCriteria = (criteria: {
  promotionType?: PromotionTargetType | string;
  industry?: string;
  campaignGoal?: CampaignGoal;
}): TemplateRegistryEntry[] => {
  const { promotionType, industry, campaignGoal } = criteria;

  return TEMPLATE_REGISTRY.filter((entry) => {
    // Check industry match (or universal)
    const matchesIndustry =
      !industry ||
      entry.industry === industry ||
      entry.industry === "universal" ||
      entry.industry === promotionType;

    // Check goal match if specified
    const matchesGoal =
      !campaignGoal || entry.supportedGoals.includes(campaignGoal);

    return matchesIndustry && matchesGoal;
  });
};

export const getTemplateByIdOrName = (identifier: string): TemplateRegistryEntry => {
  const found = TEMPLATE_REGISTRY.find(
    (t) =>
      t.id.toLowerCase() === identifier.toLowerCase() ||
      t.name.toLowerCase() === identifier.toLowerCase()
  );
  return found || TEMPLATE_REGISTRY[0]; // Default to Brand Introduction
};
