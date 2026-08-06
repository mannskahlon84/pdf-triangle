import { StorageProvider } from "./types/storage.types";
import { AssetRecord } from "../database/types/database.types";
import { AssetRepository } from "../database/repositories/assetRepository";

export interface UploadAssetContext {
  userId: string;
  workspaceId: string;
  campaignId?: string;
}

export class AssetService {
  private storageProvider: StorageProvider;

  constructor(storageProvider: StorageProvider) {
    this.storageProvider = storageProvider;
  }

  /**
   * Uploads a physical file, handles metadata, and creates an AssetRecord.
   */
  public async uploadCampaignAsset(
    localFilePath: string,
    assetType: "image" | "video" | "audio",
    context: UploadAssetContext
  ): Promise<AssetRecord> {
    const assetId = `asset_${Date.now()}`;
    const destinationPath = `workspaces/${context.workspaceId}/campaigns/${context.campaignId || "global"}/${assetId}_${this.extractFilename(localFilePath)}`;

    // 1. Create a pending AssetRecord
    const assetRecord: AssetRecord = {
      assetId,
      userId: context.userId,
      workspaceId: context.workspaceId,
      campaignId: context.campaignId,
      storageUrl: "", // Will be populated after upload
      assetType,
      status: "UPLOADING",
      uploadedAt: new Date().toISOString()
    };
    await AssetRepository.create(assetRecord);

    try {
      // 2. Upload to Cloud
      const storageUrl = await this.storageProvider.uploadFile(localFilePath, destinationPath, {
        metadata: {
          assetId,
          userId: context.userId,
          workspaceId: context.workspaceId
        }
      });

      // 3. Mark as READY
      const updatedAsset = await AssetRepository.update(assetId, {
        storageUrl,
        status: "READY"
      });

      return updatedAsset!;
    } catch (error) {
      // 4. Mark as FAILED on error
      await AssetRepository.update(assetId, {
        status: "FAILED"
      });
      throw error;
    }
  }

  /**
   * Generates a pre-signed URL for an asset
   */
  public async getAssetAccessUrl(assetId: string): Promise<string> {
    const asset = await AssetRepository.findById(assetId);
    if (!asset) throw new Error(`Asset ${assetId} not found`);
    if (asset.status !== "READY") throw new Error(`Asset ${assetId} is not ready`);

    // Parse destination path from storage URL assuming gs://bucketName/path/to/file
    const urlParts = asset.storageUrl.replace("gs://", "").split("/");
    urlParts.shift(); // Remove bucket name
    const destinationPath = urlParts.join("/");

    return this.storageProvider.getSignedUrl(destinationPath);
  }

  private extractFilename(path: string): string {
    return path.split('/').pop() || path;
  }
}
