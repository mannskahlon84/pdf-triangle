import { CampaignProfile } from "../../campaign-profile/types/campaign.types";
import { Campaign } from "../../types/promotion.types";
import { VideoPlan } from "../../video-planner/types/videoPlan.types";
import { RenderTimeline } from "../../video-generator/types/timeline.types";

export interface GenerationMetrics {
  startTime: number;
  endTime?: number;
  stepDurations: Record<string, number>;
  retryCounts: Record<string, number>;
}

export interface GenerationContext {
  jobId: string;
  userId: string;
  workspaceId: string;
  campaignId: string;
  
  // Data populated across steps
  campaign?: Campaign;
  campaignProfile?: CampaignProfile;
  assetLocalPaths?: string[]; // E.g., from an upload request
  videoPlan?: VideoPlan;
  renderTimeline?: RenderTimeline;
  videoUrl?: string;
  
  metrics: GenerationMetrics;
}

export interface GenerationStep {
  name: string;
  execute(context: GenerationContext): Promise<void>;
}
