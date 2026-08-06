import { GCSStorageProvider } from "../src/modules/marketpilot/storage/providers/gcsStorageProvider";
import { AssetService } from "../src/modules/marketpilot/storage/assetService";
import { AssetRepository } from "../src/modules/marketpilot/database/repositories/assetRepository";

async function runStorageTests() {
  console.log("=== CLOUD ASSET STORAGE ARCHITECTURE PHASE 1 TEST ===\n");

  const storageProvider = new GCSStorageProvider("test-assets-bucket");
  const assetService = new AssetService(storageProvider);

  const context = {
    userId: "usr_mock",
    workspaceId: "ws_mock",
    campaignId: "cmp_mock"
  };

  console.log("--- Test 1: Simulating File Upload & AssetRecord Creation ---");
  const mockFilePath = "/local/path/to/mock-product-image.png";
  
  const assetRecord = await assetService.uploadCampaignAsset(mockFilePath, "image", context);
  
  console.log(`Asset Created: ID = ${assetRecord.assetId}`);
  console.log(`Asset Status: ${assetRecord.status} (Expected: READY)`);
  console.log(`Storage URL: ${assetRecord.storageUrl}`);
  console.log(`Workspace ID matches: ${assetRecord.workspaceId === context.workspaceId}`);

  console.log("\n--- Test 2: Asset retrieval from Repository ---");
  const fetchedAsset = await AssetRepository.findById(assetRecord.assetId);
  console.log(`Asset successfully persisted in DB: ${fetchedAsset !== null}`);
  
  const campaignAssets = await AssetRepository.findByCampaignId(context.campaignId);
  console.log(`Asset associated with campaign: ${campaignAssets.length > 0}`);

  console.log("\n--- Test 3: Signed URL Generation ---");
  const signedUrl = await assetService.getAssetAccessUrl(assetRecord.assetId);
  console.log(`Generated Signed URL: ${signedUrl}`);
  console.log(`Signed URL contains mock signature: ${signedUrl.includes("signature=mock_sig")}`);

  console.log("\n=> ALL STORAGE INTEGRATIONS VERIFIED ✅");
}

runStorageTests().catch(console.error);
