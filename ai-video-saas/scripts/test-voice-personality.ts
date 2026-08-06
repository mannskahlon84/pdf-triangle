import { ScenePlanner } from "../src/modules/marketpilot/video-planner/scenePlanner";
import { Campaign } from "../src/modules/marketpilot/types/promotion.types";
import { TimelineBuilder } from "../src/modules/marketpilot/video-generator/timelineBuilder";

const mockCampaign: Campaign = {
  id: "cmp-voice-test",
  campaignName: "AcousticPro Earbuds",
  brandName: "AcousticPro",
  industry: "electronics",
  goal: "sales",
  status: "DRAFT",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  valueProposition: "Discover AcousticPro with premium quality and deep bass sound.",
  marketingStrategy: "Engineered with studio-grade acoustic drivers.",
  cta: "Order your AcousticPro earphones today.",
};

async function runTest() {
  console.log("=== VOICE PERSONALITY ENGINE PHASE 1 TEST ===\n");

  const standardPlan = await ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    hybridAiMode: false,
  });

  const creatorPlan = await ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    hybridAiMode: true,
    voicePersonalityMode: "individual_creator",
  });

  const businessPlan = await ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    hybridAiMode: true,
    voicePersonalityMode: "business_industry",
  });

  const cinematicPlan = await ScenePlanner.generateVideoPlanFromCampaign(mockCampaign, {
    hybridAiMode: true,
    voicePersonalityMode: "premium_cinematic",
  });

  const plans = [
    { name: "STANDARD (Default)", plan: standardPlan },
    { name: "INDIVIDUAL CREATOR", plan: creatorPlan },
    { name: "BUSINESS INDUSTRY", plan: businessPlan },
    { name: "PREMIUM CINEMATIC", plan: cinematicPlan },
  ];

  for (const { name, plan } of plans) {
    console.log(`--- ${name} ---`);
    if (plan.voiceInstruction) {
      console.log(`Voice Mode: ${plan.voiceInstruction.mode}`);
      console.log(`Settings: ${JSON.stringify(plan.voiceInstruction.voiceSettings)}`);
      console.log(`Target TTS Routing: ${plan.voiceInstruction.ttsRouting}`);
    } else {
      console.log(`Voice Mode: DEFAULT (No instruction)`);
    }

    console.log(`\nSample Script (Scene 1):`);
    console.log(`"${plan.scenes[0].voiceText}"`);
    console.log("\n");

    const timeline = await TimelineBuilder.buildTimeline(plan, "mock");
    console.log(`=> Output Audio Provider Selected: ${timeline.audioTrack.provider}`);
    console.log(`=> Output Render Timeline Valid: ${!!timeline.id && !!timeline.audioTrack.masterAudioUrl}`);
    console.log("--------------------------------------------------\n");
  }
}

runTest().catch(console.error);
