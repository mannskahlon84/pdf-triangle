import { CampaignProfile } from "../../campaign-profile/types/campaign.types";
import { BrandProfile } from "../../brand-profile/types/brand.types";
import { Workspace } from "../../workspace/types/workspace.types";

export interface DBWorkspace extends Workspace {
  workspaceId: string;
  ownerId: string;
}

export interface DBBrandProfile extends BrandProfile {
  brandId: string;
  workspaceId: string;
}

export interface DBCampaign {
  campaignId: string;
  workspaceId: string;
  brandId?: string;
  campaignProfile: CampaignProfile;
  status: "DRAFT" | "GENERATING" | "COMPLETED" | "FAILED";
}

export interface DBGeneratedVideo {
  videoId: string;
  campaignId: string;
  videoUrl?: string;
  status: "PROCESSING" | "READY" | "FAILED";
}

export interface GenerationJob {
  jobId: string;
  campaignId: string;
  provider: "replicate" | "flux" | "runway" | "google_cloud_run" | string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  externalId?: string; // ID from Replicate or Cloud Run
  createdAt: string;
  updatedAt: string;
}

export interface AssetRecord {
  assetId: string;
  userId: string;
  workspaceId: string;
  campaignId?: string;
  storageUrl: string; // e.g. gs://bucket-name/asset.mp4
  assetType: "image" | "video" | "audio";
  status: "UPLOADING" | "READY" | "FAILED";
  uploadedAt: string;
}
