import { PromotionTemplateConfig, brandIntroductionTemplate } from "./brandIntroduction";
import { productLaunchTemplate } from "./productLaunch";
import { appLaunchTemplate } from "./appLaunch";
import { restaurantOfferTemplate } from "./restaurantOffer";

export const saleCampaignTemplate: PromotionTemplateConfig = {
  name: "Sale Announcement",
  purpose: "Announce seasonal sales, flash discounts, or storewide offers",
  duration: "30 seconds",
  structure: [
    {
      time: "0-5",
      purpose: "Offer Hook",
      instruction: "Bold discount percentage overlay with energetic music beat",
    },
    {
      time: "5-20",
      purpose: "Product Showcase",
      instruction: "Fast-paced cuts of top discounted items and before/after prices",
    },
    {
      time: "20-30",
      purpose: "Urgency CTA",
      instruction: "Display sale deadline date and Shop Now link",
    },
  ],
  scriptPattern: "Bold % OFF -> Featured Deals -> Countdown Deadline -> Shop CTA",
  sceneStructure: [
    "Neon discount banner overlay",
    "Product grid slideshow with strikethrough pricing",
    "Countdown clock overlay with Store Link",
  ],
  ctaStyle: "Claim Discount button with promo code copy badge",
};

export const recruitmentCampaignTemplate: PromotionTemplateConfig = {
  name: "Recruitment Campaign",
  purpose: "Attract top-tier talent and showcase workplace culture",
  duration: "30 seconds",
  structure: [
    {
      time: "0-5",
      purpose: "Talent Hook",
      instruction: "Ask an engaging career question to qualified professionals",
    },
    {
      time: "5-20",
      purpose: "Culture & Benefits",
      instruction: "Show real workplace footage, team collaboration, and benefits",
    },
    {
      time: "20-30",
      purpose: "Apply CTA",
      instruction: "Display open positions and instant application URL",
    },
  ],
  scriptPattern: "Career Question -> Culture Showcase -> Team Testimonial -> Apply CTA",
  sceneStructure: [
    "Workplace wide shot with text overlay",
    "Employee smile/collaboration B-roll",
    "Careers URL card with QR code",
  ],
  ctaStyle: "Apply Today button with direct ATS/Careers portal link",
};

export const creatorGrowthTemplate: PromotionTemplateConfig = {
  name: "Influencer Growth",
  purpose: "Grow social media followers and YouTube/TikTok subscribers",
  duration: "30 seconds",
  structure: [
    {
      time: "0-5",
      purpose: "Channel Hook",
      instruction: "State the number 1 secret or tip your channel teaches",
    },
    {
      time: "5-20",
      purpose: "Value Pillar Montage",
      instruction: "Quick clips of tutorials, case studies, and actionable frameworks",
    },
    {
      time: "20-30",
      purpose: "Follow CTA",
      instruction: "Ask viewers to follow/subscribe for daily tips",
    },
  ],
  scriptPattern: "Value Hook -> Proof Montage -> Daily Content Promise -> Follow CTA",
  sceneStructure: [
    "Talking head hook with dynamic captions",
    "Split screen tutorial preview",
    "Animated Subscribe / Follow bell icon overlay",
  ],
  ctaStyle: "Follow Channel button with profile handle badge",
};

export const eventPromotionTemplate: PromotionTemplateConfig = {
  name: "Event Promotion",
  purpose: "Drive ticket sales and RSVPs for physical or virtual events",
  duration: "30 seconds",
  structure: [
    {
      time: "0-5",
      purpose: "Date & City Hook",
      instruction: "Display event date, location, and headliner speakers",
    },
    {
      time: "5-20",
      purpose: "Experience Preview",
      instruction: "High-energy crowd B-roll, keynote highlights, and networking scenes",
    },
    {
      time: "20-30",
      purpose: "Ticket CTA",
      instruction: "Warn about limited seats and provide RSVP link",
    },
  ],
  scriptPattern: "Event Date -> Headliners -> Attendee Experience -> RSVP CTA",
  sceneStructure: [
    "Event logo and date title card",
    "Crowd applause and speaker stage lights",
    "Ticket tier badge with RSVP URL",
  ],
  ctaStyle: "Get Tickets button with early-bird pricing badge",
};

// =================================================================
// INDUSTRY TEMPLATES EXPANSION
// =================================================================

export const propertyShowcaseTemplate: PromotionTemplateConfig = {
  name: "Property Showcase",
  purpose: "Highlight real estate listings, architecture, and prime location benefits",
  duration: "30 seconds",
  structure: [
    { time: "0-5", purpose: "Architectural Hook", instruction: "Aerial drone shot or dramatic entryway reveal of property" },
    { time: "5-20", purpose: "Luxury Interior Walkthrough", instruction: "Showcase living room, gourmet kitchen, master suite, and skyline view" },
    { time: "20-30", purpose: "Broker CTA", instruction: "Display price range, square footage, and broker scheduling link" },
  ],
  scriptPattern: "Skyline Reveal -> Interior Masterpiece -> Key Amenities -> Schedule Tour CTA",
  sceneStructure: ["4K Drone Establishing Shot", "Steadicam Glide through Living Area", "Broker Contact & Tour Calendar Overlay"],
  ctaStyle: "Schedule Private Tour button with broker phone badge",
};

export const luxuryHomeTourTemplate: PromotionTemplateConfig = {
  name: "Luxury Home Tour",
  purpose: "Immersive cinematic walk-through of high-end luxury real estate",
  duration: "30 seconds",
  structure: [
    { time: "0-5", purpose: "Prestige Hook", instruction: "Showcase luxury address and exclusive architectural style" },
    { time: "5-20", purpose: "Designer Finishes", instruction: "Macro shots of marble counters, infinity pool, and custom lighting" },
    { time: "20-30", purpose: "Private Showing CTA", instruction: "Invite high-net-worth buyers to book a confidential VIP showing" },
  ],
  scriptPattern: "Exclusive Address Hook -> Designer Details -> Panoramic Views -> VIP Tour CTA",
  sceneStructure: ["Sunset Infinity Pool Wide Shot", "Custom Marble & Fixture Detail Zoom", "VIP Confidential Showing Button Card"],
  ctaStyle: "Request Confidential Brochure button",
};

export const hotelIntroductionTemplate: PromotionTemplateConfig = {
  name: "Hotel Introduction",
  purpose: "Attract holiday travelers with resort amenities, views, and relaxation",
  duration: "30 seconds",
  structure: [
    { time: "0-5", purpose: "Vacation Hook", instruction: "Show breathtaking beach, mountain, or resort skyline vista" },
    { time: "5-20", purpose: "Resort Experience", instruction: "Showcase luxury suites, infinity pool, cocktails, and spa treatments" },
    { time: "20-30", purpose: "Booking CTA", instruction: "Present seasonal holiday discount with direct booking link" },
  ],
  scriptPattern: "Paradise Escape Hook -> Luxury Room & Spa Tour -> Dining Experience -> Direct Booking CTA",
  sceneStructure: ["Tropical Aerial Vista", "Slow-Motion Cocktail & Poolside Lounge", "Seasonal Package Discount Badge"],
  ctaStyle: "Book Direct & Save 25% button with promo code overlay",
};

export const transformationStoryTemplate: PromotionTemplateConfig = {
  name: "Transformation Story",
  purpose: "Show real fitness or health results to motivate new gym memberships",
  duration: "30 seconds",
  structure: [
    { time: "0-5", purpose: "Challenge Hook", instruction: "Ask viewer if they are ready to transform their physique in 30 days" },
    { time: "5-20", purpose: "Training & Ambiance", instruction: "High-energy training clips, certified coaches, and before/after milestones" },
    { time: "20-30", purpose: "Free Pass CTA", instruction: "Offer 7-Day Free Gym Pass or challenge enrollment" },
  ],
  scriptPattern: "Frustration Hook -> Energy Training Proof -> Member Milestones -> Free Pass CTA",
  sceneStructure: ["Dynamic EDM Workout Hook", "Coach Instruction & Weight Room B-Roll", "7-Day Free Pass Claim Card"],
  ctaStyle: "Claim 7-Day Free Gym Pass button",
};

export const courseIntroductionTemplate: PromotionTemplateConfig = {
  name: "Course Introduction",
  purpose: "Enroll students in high-income digital courses and bootcamps",
  duration: "30 seconds",
  structure: [
    { time: "0-5", purpose: "Career Hook", instruction: "Highlight the top salary or skill outcome students achieve" },
    { time: "5-20", purpose: "Curriculum Showcase", instruction: "Preview hands-on projects, mentorship, and career support" },
    { time: "20-30", purpose: "Enroll CTA", instruction: "Offer early-bird scholarship code and application deadline" },
  ],
  scriptPattern: "High-Income Skill Hook -> Hands-On Projects -> Mentorship Proof -> Apply CTA",
  sceneStructure: ["Bold Career Earnings Typography", "Interactive Code / Screen Lesson Preview", "Scholarship Code Card"],
  ctaStyle: "Apply Now with 40% Scholarship button",
};

export const serviceShowcaseTemplate: PromotionTemplateConfig = {
  name: "Service Showcase",
  purpose: "Showcase beauty, salon, or professional treatments with satisfying before/after visuals",
  duration: "30 seconds",
  structure: [
    { time: "0-5", purpose: "Glamour Hook", instruction: "Dramatic reveal of gorgeous final look or result" },
    { time: "5-20", purpose: "Artisan Process", instruction: "Close-up aesthetic clips of the treatment or service in action" },
    { time: "20-30", purpose: "Booking CTA", instruction: "Present seasonal discount and online booking scheduler link" },
  ],
  scriptPattern: "Satisfying Reveal -> Artisan Technique -> Client Delight -> Book Online CTA",
  sceneStructure: ["Glamour Final Look Zoom", "Satisfying Treatment B-Roll", "Online Appointment Card"],
  ctaStyle: "Book Your Appointment Online button",
};

export const clinicIntroductionTemplate: PromotionTemplateConfig = {
  name: "Clinic Introduction",
  purpose: "Build trust with prospective patients looking for specialized care",
  duration: "30 seconds",
  structure: [
    { time: "0-5", purpose: "Empathy Hook", instruction: "Address the symptom or health goal with clinical authority" },
    { time: "5-20", purpose: "Specialized Care", instruction: "Highlight board-certified doctors, modern equipment, and comfort" },
    { time: "20-30", purpose: "Consultation CTA", instruction: "Offer same-day scheduling or telehealth consultation" },
  ],
  scriptPattern: "Symptom Empathy Hook -> Board-Certified Authority -> Modern Care -> Schedule Consultation CTA",
  sceneStructure: ["Warm Doctor Patient Interaction", "High-Tech Diagnostics Overview", "Insurance Accepted & Consult Button"],
  ctaStyle: "Schedule Consultation Today button",
};

export const portfolioIntroductionTemplate: PromotionTemplateConfig = {
  name: "Portfolio Introduction",
  purpose: "Establish authority for freelancers, designers, consultants, and coaches",
  duration: "30 seconds",
  structure: [
    { time: "0-5", purpose: "Authority Hook", instruction: "State your core discipline and the number 1 result you deliver" },
    { time: "5-20", purpose: "Case Study Reel", instruction: "Fast montage of top designs, client metrics, and testimonials" },
    { time: "20-30", purpose: "Discovery Call CTA", instruction: "Invite prospective clients to book a 1-on-1 discovery call" },
  ],
  scriptPattern: "Authority Hook -> Case Study Metrics -> Client Praise -> Book Call CTA",
  sceneStructure: ["Sleek Personal Studio B-Roll", "Case Study Metric Overlay", "Calendar Scheduling Button Card"],
  ctaStyle: "Book a Discovery Call button",
};

export const PROMOTION_TEMPLATES_CONFIG: Record<string, PromotionTemplateConfig> = {
  "Brand Introduction": brandIntroductionTemplate,
  "Product Launch": productLaunchTemplate,
  "App Launch": appLaunchTemplate,
  "Restaurant Offer": restaurantOfferTemplate,
  "Sale Announcement": saleCampaignTemplate,
  "Recruitment Campaign": recruitmentCampaignTemplate,
  "Influencer Growth": creatorGrowthTemplate,
  "Event Promotion": eventPromotionTemplate,
  "Property Showcase": propertyShowcaseTemplate,
  "Luxury Home Tour": luxuryHomeTourTemplate,
  "Hotel Introduction": hotelIntroductionTemplate,
  "Transformation Story": transformationStoryTemplate,
  "Course Introduction": courseIntroductionTemplate,
  "Service Showcase": serviceShowcaseTemplate,
  "Clinic Introduction": clinicIntroductionTemplate,
  "Portfolio Introduction": portfolioIntroductionTemplate,
};

export * from "./brandIntroduction";
export * from "./productLaunch";
export * from "./appLaunch";
export * from "./restaurantOffer";
