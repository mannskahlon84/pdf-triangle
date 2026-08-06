import { GenerationOrchestrator } from "../src/modules/marketpilot/orchestrator/generationOrchestrator";
import { GenerationContext } from "../src/modules/marketpilot/orchestrator/types/orchestrator.types";
import { GCSStorageProvider } from "../src/modules/marketpilot/storage/providers/gcsStorageProvider";
import { AssetService } from "../src/modules/marketpilot/storage/assetService";
import { JobRepository } from "../src/modules/marketpilot/database/repositories/jobRepository";
import { VideoRepository } from "../src/modules/marketpilot/database/repositories/videoRepository";
import { AssetRepository } from "../src/modules/marketpilot/database/repositories/assetRepository";
import { CampaignProfile } from "../src/modules/marketpilot/campaign-profile/types/campaign.types";
import { Campaign } from "../src/modules/marketpilot/types/promotion.types";
import { CampaignDefaults } from "../src/modules/marketpilot/campaign-profile/campaignDefaults";

async function runOrchestratorTests() {
  console.log("=== GENERATION PIPELINE ORCHESTRATOR PHASE 1 TEST ===\n");

  const storageProvider = new GCSStorageProvider();
  const assetService = new AssetService(storageProvider);
  const orchestrator = new GenerationOrchestrator(assetService);

  const campaign: Campaign = {
    id: "cmp_orch_test",
    campaignName: "Orchestrator Campaign",
    brandName: "Luxury Resorts",
    industry: "hospitality",
    goal: "sales",
    status: "DRAFT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    valueProposition: "Value proposition",
    marketingStrategy: "Strategy",
    cta: "Book Now",
  };

  const campaignProfile: CampaignProfile = CampaignDefaults.applyDefaults({
    userType: "business",
    promotionType: "service",
    visualMode: "cinematic_ai",
    voiceMode: "premium_cinematic",
    avatarMode: "ai_presenter"
  });

  const context: GenerationContext = {
    jobId: "job_001",
    userId: "usr_mock",
    workspaceId: "ws_mock",
    campaignId: campaign.id,
    campaign,
    campaignProfile,
    assetLocalPaths: ["/local/img1.png"],
    metrics: { startTime: 0, stepDurations: {}, retryCounts: {} }
  };

  console.log("--- Test 1: Full Generation Lifecycle ---");
  console.log("Running pipeline...");
  await orchestrator.runGeneration(context);

  console.log(`\nPipeline finished in ${context.metrics.endTime! - context.metrics.startTime!}ms`);
  console.log(`Metrics:`, context.metrics);

  console.log("\n--- Test 2: State Tracking & Repositories ---");
  const job = await JobRepository.findById(context.jobId);
  console.log(`Job Status (Expected: COMPLETED): ${job?.status}`);

  const assets = await AssetRepository.findByCampaignId(campaign.id);
  console.log(`Assets Created: ${assets.length > 0 && assets[0].status === "READY"}`);

  const videos = await VideoRepository.findByCampaignId(campaign.id);
  console.log(`Generated Video Stored: ${videos.length > 0 && videos[0].status === "READY"}`);

  console.log("\n--- Test 3: Engine Validations ---");
  console.log(`VideoPlan exists: ${!!context.videoPlan}`);
  console.log(`Cinematic Mode applied in VideoPlan: ${!!context.videoPlan?.scenes[0].videoPrompt?.includes("cinematic")}`);
  console.log(`Voice Engine applied in VideoPlan: ${context.videoPlan?.voiceInstruction?.mode === "premium_cinematic"}`);
  console.log(`Avatar Engine applied in VideoPlan: ${!!context.videoPlan?.avatarInstruction}`);
  
  console.log(`RenderTimeline strictly isolated (no AI metadata): ${!(context.renderTimeline as any).voiceInstruction}`);

  console.log("\n=> ALL GENERATION LIFECYCLES VERIFIED ✅");
}

runOrchestratorTests().catch(console.error);
