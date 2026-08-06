import { ScenePlanner } from "../src/modules/marketpilot/video-planner/scenePlanner";
import { Campaign } from "../src/modules/marketpilot/types/promotion.types";
import { CampaignProfile } from "../src/modules/marketpilot/campaign-profile/types/campaign.types";
import { BrandProfile } from "../src/modules/marketpilot/brand-profile/types/brand.types";
import { Workspace } from "../src/modules/marketpilot/workspace/types/workspace.types";
import { WorkspaceDefaults } from "../src/modules/marketpilot/workspace/workspaceDefaults";
import { BrandDefaults } from "../src/modules/marketpilot/brand-profile/brandDefaults";
import { CampaignDefaults } from "../src/modules/marketpilot/campaign-profile/campaignDefaults";
import { TimelineBuilder } from "../src/modules/marketpilot/video-generator/timelineBuilder";

const dummyCampaign: Campaign = {
  id: "cmp-ws-test",
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

async function runWorkspaceTests() {
  console.log("=== WORKSPACE ARCHITECTURE PHASE 1 TEST ===\n");

  // 1. Individual creator workspace
  console.log("--- Test 1: Individual creator workspace (Default Fallbacks) ---");
  const rawIndieWs: Partial<Workspace> = {
    workspaceName: "My Creator Workspace",
    type: "individual",
  };
  const indieWs = WorkspaceDefaults.applyDefaults(rawIndieWs);
  console.log(`Industry Default applied: ${indieWs.industry === "creator"}`);
  console.log(`Visual Mode Default applied: ${indieWs.workspaceSettings?.defaultVisualMode === "standard"}`);

  // 2. Business workspace & Hotel workspace with brand profile
  console.log("\n--- Test 2 & 3: Business workspace with multiple Brand Profiles ---");
  const rawBusinessWs: Partial<Workspace> = {
    workspaceName: "Global Hospitality Group",
    type: "business",
    industry: "hospitality",
    country: "UAE",
    workspaceSettings: {
      defaultVisualMode: "hybrid_ai",
      defaultVoiceMode: "business_industry"
    }
  };
  const businessWs = WorkspaceDefaults.applyDefaults(rawBusinessWs);
  console.log(`Workspace Country applied: ${businessWs.country}`);

  const rawHotelBrand: Partial<BrandProfile> = {
    brandName: "Qatar Luxury Hotel",
    country: "Qatar", // Overrides Workspace country
    brandStyle: "luxury",
    preferredVisualMode: "cinematic_ai", // Overrides Workspace visualMode
  };
  
  const rawRestaurantBrand: Partial<BrandProfile> = {
    brandName: "Group Restaurant",
    // Inherits country from Workspace
    // Inherits visualMode from Workspace
  };

  const hotelBrand = BrandDefaults.applyDefaults(rawHotelBrand, businessWs);
  const restaurantBrand = BrandDefaults.applyDefaults(rawRestaurantBrand, businessWs);

  console.log(`Hotel Brand Country (Qatar): ${hotelBrand.country}`);
  console.log(`Restaurant Brand Country (UAE inherited): ${restaurantBrand.country}`);
  console.log(`Hotel Brand Visual (cinematic_ai): ${hotelBrand.preferredVisualMode}`);
  console.log(`Restaurant Brand Visual (hybrid_ai inherited): ${restaurantBrand.preferredVisualMode}`);

  // 4. Campaign override priority & inheritance
  console.log("\n--- Test 4: Campaign inheritance & Override priority ---");
  
  // A campaign under the Hotel Brand
  const rawHotelCampaign: Partial<CampaignProfile> = {
    userType: "business",
    promotionType: "service",
    // Overrides brand visual mode
    visualMode: "standard"
  };

  const hotelCampaign = CampaignDefaults.applyDefaults(rawHotelCampaign, hotelBrand);

  console.log(`Campaign Country (Qatar inherited): ${hotelCampaign.country}`);
  console.log(`Campaign Visual Mode (standard overridden): ${hotelCampaign.visualMode}`);

  // 5. Multiple campaigns under one workspace
  // Let's pass the hotelCampaign into ScenePlanner
  console.log("\n--- Test 5 & 6: ScenePlanner Context Flow & Isolation ---");
  const plan = await ScenePlanner.generateVideoPlanFromCampaign(dummyCampaign, {
    hybridAiMode: true,
    campaignProfile: hotelCampaign, // Passes the explicitly resolved campaign profile
  });

  console.log(`Visual Mode Handled correctly in ScenePlanner (No Cinematic): ${!plan.scenes[0].videoPrompt?.includes("Anamorphic")}`);

  const timeline = await TimelineBuilder.buildTimeline(plan, "mock");
  const hasAvatarLeaked = (timeline as any).avatarInstruction !== undefined;
  const hasVoiceLeaked = (timeline as any).voiceInstruction !== undefined;
  const hasCinematicLeaked = (timeline as any).cinematicInstruction !== undefined;

  const isIsolated = !hasAvatarLeaked && !hasVoiceLeaked && !hasCinematicLeaked;
  console.log(`=> AI Metadata Leaks into RenderTimeline: ${!isIsolated ? "YES (FAILED)" : "NO (PASSED) ✅"}`);

}

runWorkspaceTests().catch(console.error);
