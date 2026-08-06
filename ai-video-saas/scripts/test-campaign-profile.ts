import { ScenePlanner } from "../src/modules/marketpilot/video-planner/scenePlanner";
import { Campaign } from "../src/modules/marketpilot/types/promotion.types";
import { CampaignProfile } from "../src/modules/marketpilot/campaign-profile/types/campaign.types";
import { TimelineBuilder } from "../src/modules/marketpilot/video-generator/timelineBuilder";

const dummyCampaign: Campaign = {
  id: "cmp-dummy",
  campaignName: "Dummy Base Campaign",
  brandName: "DummyBrand",
  industry: "electronics",
  goal: "sales",
  status: "DRAFT",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  valueProposition: "Value proposition",
  marketingStrategy: "Strategy",
  cta: "Click here",
};

async function runTest() {
  console.log("=== CAMPAIGN PROFILE ARCHITECTURE PHASE 1 TEST ===\n");

  const productProfile: CampaignProfile = {
    userType: "business",
    promotionType: "product",
    industry: "tech",
    visualMode: "hybrid_ai",
    voiceMode: "business_industry",
    avatarMode: "none"
  };

  const hotelQatarProfile: CampaignProfile = {
    userType: "business",
    promotionType: "service",
    industry: "hospitality",
    region: "Middle East",
    country: "Qatar",
    targetAudience: { location: "Qatar", customerType: "luxury travelers" },
    campaignGoal: "hospitality",
    brandStyle: "luxury",
    visualMode: "cinematic_ai",
    voiceMode: "premium_cinematic",
    avatarMode: "ai_presenter"
  };

  const individualCreatorProfile: CampaignProfile = {
    userType: "individual",
    promotionType: "social_profile",
    industry: "fitness",
    targetAudience: { customerType: "followers" },
    brandStyle: "friendly",
    visualMode: "standard",
    voiceMode: "individual_creator",
    avatarMode: "ai_presenter"
  };

  const missingValuesProfile: Partial<CampaignProfile> = {
    userType: "individual",
    // Leaving everything else undefined to test defaults
  };

  const tests = [
    { name: "Product Promotion Campaign", profile: productProfile },
    { name: "Hotel Luxury Campaign Qatar", profile: hotelQatarProfile },
    { name: "Individual Creator Campaign", profile: individualCreatorProfile as CampaignProfile },
    { name: "Missing Values (Defaults applied)", profile: missingValuesProfile as CampaignProfile },
  ];

  for (const { name, profile } of tests) {
    console.log(`--- ${name} ---`);
    const plan = await ScenePlanner.generateVideoPlanFromCampaign(dummyCampaign, {
      hybridAiMode: true,
      campaignProfile: profile
    });

    console.log(`Visual Mode Handled: Cinematic Engine Applied = ${!!plan.scenes[0].videoPrompt?.includes("Anamorphic") || !!plan.scenes[0].videoPrompt?.includes("cinematic")}`);
    console.log(`Voice Mode Handled: ${plan.voiceInstruction ? plan.voiceInstruction.mode : "None"}`);
    console.log(`Avatar Mode Handled: ${plan.avatarInstruction ? plan.avatarInstruction.avatarId : "None"}`);

    const timeline = await TimelineBuilder.buildTimeline(plan, "mock");
    console.log(`=> Output Render Timeline Valid: ${!!timeline.id}`);
    
    // Isolation Check
    const timelineHasAvatar = (timeline as any).avatarInstruction !== undefined;
    const timelineHasVoice = (timeline as any).voiceInstruction !== undefined;
    const isIsolated = !timelineHasAvatar && !timelineHasVoice;
    console.log(`=> MP4 Rendering Pipeline Unchanged (Strict Isolation): ${isIsolated}`);
    console.log("--------------------------------------------------\n");
  }
}

runTest().catch(console.error);
