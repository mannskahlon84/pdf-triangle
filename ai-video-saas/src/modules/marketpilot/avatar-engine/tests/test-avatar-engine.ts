import { ScenePlanner } from "../../video-planner/scenePlanner";
import { Campaign } from "../../../marketpilot/types/promotion.types";
import { TimelineBuilder } from "../../video-generator/timelineBuilder";

const qatarHotelCampaign: Campaign = {
  id: "cmp-qatar-hotel",
  campaignName: "Doha Pearl Luxury",
  brandName: "Pearl Hotels",
  industry: "hospitality",
  goal: "sales",
  status: "DRAFT",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  valueProposition: "Experience ultimate luxury at the Pearl.",
  marketingStrategy: "Premium hospitality.",
  cta: "Book your stay.",
  targetAudience: "Qatar luxury travelers", // The region is here
};

const punjabBusinessCampaign: Campaign = {
  id: "cmp-punjab-biz",
  campaignName: "Ludhiana Manufacturing",
  brandName: "Singh Industries",
  industry: "manufacturing",
  goal: "sales",
  status: "DRAFT",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  valueProposition: "Reliable manufacturing partners.",
  marketingStrategy: "B2B Trust.",
  cta: "Contact us.",
  targetAudience: "Punjab businesses", // The region is here
};

const genericCampaign: Campaign = {
  id: "cmp-generic",
  campaignName: "Global SaaS Software",
  brandName: "CloudSync",
  industry: "tech",
  goal: "awareness",
  status: "DRAFT",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  valueProposition: "Sync everything.",
  marketingStrategy: "Global reach.",
  cta: "Try for free.",
  targetAudience: "Startups", 
};

async function runTest() {
  console.log("=== AVATAR PERSONALITY ENGINE PHASE 1 TEST ===\n");

  const plans = [
    { name: "Qatar Hotel", campaign: qatarHotelCampaign, mode: "ai_presenter" as const },
    { name: "Punjab Business", campaign: punjabBusinessCampaign, mode: "ai_presenter" as const },
    { name: "Global Fallback", campaign: genericCampaign, mode: "ai_presenter" as const },
    { name: "No Avatar Mode", campaign: genericCampaign, mode: "none" as const },
  ];

  for (const { name, campaign, mode } of plans) {
    console.log(`--- ${name} ---`);
    const plan = await ScenePlanner.generateVideoPlanFromCampaign(campaign, {
      hybridAiMode: true,
      avatarMode: mode,
    });

    if (plan.avatarInstruction) {
      console.log(`Avatar Selected: ${plan.avatarInstruction.avatarId}`);
      console.log(`Appearance: ${plan.avatarInstruction.appearance}`);
      console.log(`Clothing: ${plan.avatarInstruction.clothing}`);
      console.log(`Presentation Style: ${plan.avatarInstruction.presentationStyle}`);
    } else {
      console.log(`Avatar Mode: NONE (Skipped successfully)`);
    }

    const timeline = await TimelineBuilder.buildTimeline(plan, "mock");
    console.log(`=> Output Render Timeline Valid: ${!!timeline.id}`);
    
    // Check if Avatar Instruction leaked into RenderTimeline
    const hasAvatarInTimeline = (timeline as any).avatarInstruction !== undefined;
    console.log(`=> FFmpegRenderer Contract Preserved (No Leaks): ${!hasAvatarInTimeline}`);
    console.log("--------------------------------------------------\n");
  }
}

runTest().catch(console.error);
