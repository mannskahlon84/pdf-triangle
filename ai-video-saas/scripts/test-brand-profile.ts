import { ScenePlanner } from "../src/modules/marketpilot/video-planner/scenePlanner";
import { Campaign } from "../src/modules/marketpilot/types/promotion.types";
import { CampaignProfile } from "../src/modules/marketpilot/campaign-profile/types/campaign.types";
import { BrandProfile } from "../src/modules/marketpilot/brand-profile/types/brand.types";
import { TimelineBuilder } from "../src/modules/marketpilot/video-generator/timelineBuilder";

const dummyCampaign: Campaign = {
  id: "cmp-brand-test",
  campaignName: "Dummy Campaign",
  brandName: "",
  industry: "",
  goal: "sales",
  status: "DRAFT",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  valueProposition: "Value proposition",
  marketingStrategy: "Strategy",
  cta: "Click here",
};

async function runBrandTests() {
  console.log("=== BRAND PROFILE ARCHITECTURE PHASE 1 TEST ===\n");

  const hotelBrand: BrandProfile = {
    brandName: "Royal Qatari Hotels",
    industry: "hospitality",
    country: "Qatar",
    brandStyle: "luxury",
    preferredVisualMode: "cinematic_ai",
    preferredVoiceMode: "premium_cinematic",
    preferredAvatarMode: "ai_presenter",
    brandColors: ["gold", "black"],
    visualKeywords: ["luxurious", "premium"]
  };

  const restaurantBrand: BrandProfile = {
    brandName: "Burger Bros",
    industry: "food",
    country: "USA",
    brandStyle: "friendly",
    preferredVisualMode: "standard",
    preferredVoiceMode: "individual_creator",
    preferredAvatarMode: "none",
  };

  const creatorBrand: BrandProfile = {
    brandName: "Fitness Coach Sarah",
    industry: "fitness",
    country: "UK",
    brandStyle: "modern",
    preferredVisualMode: "hybrid_ai",
    preferredVoiceMode: "individual_creator",
    preferredAvatarMode: "ai_presenter",
  };

  // 1. Hotel Brand -> Campaign Profile missing values
  console.log("--- Test 1: Hotel Brand Profile (Defaults applied to Campaign) ---");
  const hotelCampaignProfile: Partial<CampaignProfile> = {
    userType: "business",
    promotionType: "service"
    // Relying on Brand for everything else
  };

  let plan = await ScenePlanner.generateVideoPlanFromCampaign(dummyCampaign, {
    hybridAiMode: true,
    campaignProfile: hotelCampaignProfile,
    brandProfile: hotelBrand
  });

  let hasCinematic = !!plan.scenes[0].videoPrompt?.includes("cinematic") || !!plan.scenes[0].videoPrompt?.includes("Anamorphic");
  console.log(`Brand Name injected: ${plan.title.includes(hotelBrand.brandName)}`);
  console.log(`Visual Mode Handled (Cinematic): ${hasCinematic}`);
  console.log(`Voice Mode Handled: ${plan.voiceInstruction?.mode}`);
  console.log(`Avatar Mode Handled: ${plan.avatarInstruction?.avatarId}`);

  // 2. Restaurant Brand -> Campaign Profile missing values
  console.log("\n--- Test 2: Restaurant Brand Profile ---");
  const restaurantCampaignProfile: Partial<CampaignProfile> = {
    userType: "business",
    promotionType: "product"
  };

  plan = await ScenePlanner.generateVideoPlanFromCampaign(dummyCampaign, {
    hybridAiMode: true,
    campaignProfile: restaurantCampaignProfile,
    brandProfile: restaurantBrand
  });

  hasCinematic = !!plan.scenes[0].videoPrompt?.includes("cinematic") || !!plan.scenes[0].videoPrompt?.includes("Anamorphic");
  console.log(`Visual Mode Handled (Cinematic): ${hasCinematic}`);
  console.log(`Voice Mode Handled: ${plan.voiceInstruction?.mode}`);
  console.log(`Avatar Mode Handled: ${plan.avatarInstruction ? "Yes" : "None"}`);


  // 3. Individual Creator Brand -> Campaign Profile missing values
  console.log("\n--- Test 3: Individual Creator Brand Profile ---");
  const creatorCampaignProfile: Partial<CampaignProfile> = {
    userType: "individual",
    promotionType: "social_profile"
  };

  plan = await ScenePlanner.generateVideoPlanFromCampaign(dummyCampaign, {
    hybridAiMode: true,
    campaignProfile: creatorCampaignProfile,
    brandProfile: creatorBrand
  });

  console.log(`Visual Mode Handled (Cinematic): ${!!plan.scenes[0].videoPrompt?.includes("Anamorphic")}`);
  console.log(`Voice Mode Handled: ${plan.voiceInstruction?.mode}`);
  console.log(`Avatar Mode Handled: ${plan.avatarInstruction ? "Yes" : "None"}`);


  // 4. Campaign overrides brand defaults
  console.log("\n--- Test 4: Campaign Overrides Brand Defaults ---");
  const overrideCampaignProfile: Partial<CampaignProfile> = {
    userType: "business",
    promotionType: "service",
    voiceMode: "business_industry", // Override
    visualMode: "standard", // Override
  };

  plan = await ScenePlanner.generateVideoPlanFromCampaign(dummyCampaign, {
    hybridAiMode: true,
    campaignProfile: overrideCampaignProfile,
    brandProfile: hotelBrand
  });

  console.log(`Voice Mode Handled (Should be business_industry): ${plan.voiceInstruction?.mode}`);
  console.log(`Visual Mode Handled (Should be standard, no cinematic): ${!plan.scenes[0].videoPrompt?.includes("Anamorphic")}`);


  // 5. Existing rendering pipeline unchanged
  console.log("\n--- Test 5: Existing rendering pipeline unchanged ---");
  const timeline = await TimelineBuilder.buildTimeline(plan, "mock");
  const hasAvatarLeaked = (timeline as any).avatarInstruction !== undefined;
  const hasVoiceLeaked = (timeline as any).voiceInstruction !== undefined;
  const hasCinematicLeaked = (timeline as any).cinematicInstruction !== undefined;

  const isIsolated = !hasAvatarLeaked && !hasVoiceLeaked && !hasCinematicLeaked;
  console.log(`=> AI Metadata Leaks into RenderTimeline: ${!isIsolated ? "YES (FAILED)" : "NO (PASSED) ✅"}`);

}

runBrandTests().catch(console.error);
