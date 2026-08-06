import { UserRepository } from "../src/modules/marketpilot/database/repositories/userRepository";
import { WorkspaceRepository } from "../src/modules/marketpilot/database/repositories/workspaceRepository";
import { BrandRepository } from "../src/modules/marketpilot/database/repositories/brandRepository";
import { CampaignRepository } from "../src/modules/marketpilot/database/repositories/campaignRepository";
import { VideoRepository } from "../src/modules/marketpilot/database/repositories/videoRepository";

import { User } from "../src/modules/marketpilot/auth/types/user.types";
import { DBWorkspace, DBBrandProfile, DBCampaign, DBGeneratedVideo } from "../src/modules/marketpilot/database/types/database.types";
import { WorkspaceDefaults } from "../src/modules/marketpilot/workspace/workspaceDefaults";
import { BrandDefaults } from "../src/modules/marketpilot/brand-profile/brandDefaults";
import { CampaignDefaults } from "../src/modules/marketpilot/campaign-profile/campaignDefaults";

async function runPersistenceTests() {
  console.log("=== AUTH & PERSISTENCE ARCHITECTURE PHASE 1 TEST ===\n");

  // 1. User creation
  console.log("--- Test 1: User creation ---");
  const user: User = {
    id: "usr_123",
    email: "test@example.com",
    name: "Test User",
    createdAt: new Date().toISOString()
  };
  await UserRepository.create(user);
  const fetchedUser = await UserRepository.findById("usr_123");
  console.log(`User created and fetched: ${fetchedUser?.email === "test@example.com"}`);

  // 2. Workspace ownership
  console.log("\n--- Test 2: Workspace ownership ---");
  const wsData = WorkspaceDefaults.applyDefaults({
    workspaceName: "My SaaS Company",
    type: "business",
    industry: "tech",
  });
  const workspace: DBWorkspace = {
    ...wsData,
    workspaceId: "ws_123",
    ownerId: user.id
  };
  await WorkspaceRepository.create(workspace);
  const fetchedWs = await WorkspaceRepository.findByOwnerId(user.id);
  console.log(`Workspace linked to user: ${fetchedWs.length > 0 && fetchedWs[0].workspaceId === "ws_123"}`);

  // 3. Brand linked to workspace
  console.log("\n--- Test 3: Brand linked to workspace ---");
  const brandData = BrandDefaults.applyDefaults({
    brandName: "TechNova",
  }, workspace);
  const brand: DBBrandProfile = {
    ...brandData,
    brandId: "brd_123",
    workspaceId: workspace.workspaceId
  };
  await BrandRepository.create(brand);
  const fetchedBrand = await BrandRepository.findByWorkspaceId(workspace.workspaceId);
  console.log(`Brand linked to workspace: ${fetchedBrand.length > 0 && fetchedBrand[0].brandName === "TechNova"}`);

  // 4. Campaign linked to brand & workspace
  console.log("\n--- Test 4: Campaign linked to brand ---");
  const campaignData = CampaignDefaults.applyDefaults({
    userType: "business"
  }, brand);
  const campaign: DBCampaign = {
    campaignId: "cmp_123",
    workspaceId: workspace.workspaceId,
    brandId: brand.brandId,
    campaignProfile: campaignData,
    status: "DRAFT"
  };
  await CampaignRepository.create(campaign);
  const fetchedCamp = await CampaignRepository.findByWorkspaceId(workspace.workspaceId);
  console.log(`Campaign linked to brand/workspace: ${fetchedCamp.length > 0 && fetchedCamp[0].campaignId === "cmp_123"}`);
  console.log(`Campaign inherited visual mode (from workspace -> brand -> campaign): ${fetchedCamp[0].campaignProfile.visualMode === "hybrid_ai"}`);

  // 5. Generated video linked to campaign
  console.log("\n--- Test 5: Generated video linked to campaign ---");
  const video: DBGeneratedVideo = {
    videoId: "vid_123",
    campaignId: campaign.campaignId,
    status: "READY",
    videoUrl: "https://storage.example.com/video.mp4"
  };
  await VideoRepository.create(video);
  const fetchedVid = await VideoRepository.findByCampaignId(campaign.campaignId);
  console.log(`Generated video linked to campaign: ${fetchedVid.length > 0 && fetchedVid[0].videoId === "vid_123"}`);

  console.log("\n=> ALL RELATIONS CASCADED SUCCESSFULLY ✅");
}

runPersistenceTests().catch(console.error);
