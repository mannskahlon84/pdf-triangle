import { CampaignManager } from "./campaignManager";
import {
  ScheduleRequest,
  ScheduleResult,
  MarketingCampaign,
} from "./types/publisher.types";

export class SocialScheduler {
  /**
   * Schedules a campaign for automatic future social publication.
   */
  public static async scheduleCampaign(
    req: ScheduleRequest
  ): Promise<ScheduleResult> {
    const campaign = CampaignManager.getCampaignById(req.campaignId);
    if (!campaign) {
      return {
        success: false,
        campaignId: req.campaignId,
        status: "FAILED",
        scheduledTime: req.scheduledTime,
        platforms: req.platforms,
        error: `Campaign not found: ${req.campaignId}`,
      };
    }

    const scheduledDate = new Date(req.scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      return {
        success: false,
        campaignId: req.campaignId,
        status: campaign.status,
        scheduledTime: req.scheduledTime,
        platforms: req.platforms,
        error: "Invalid scheduledTime date format.",
      };
    }

    // Update campaign status in the manager
    const updated = CampaignManager.updateStatus(req.campaignId, "SCHEDULED", {
      scheduledTime: scheduledDate.toISOString(),
      platforms:
        req.platforms && req.platforms.length > 0
          ? req.platforms
          : campaign.platforms,
    });

    return {
      success: true,
      campaignId: updated.id,
      status: "SCHEDULED",
      scheduledTime: scheduledDate.toISOString(),
      platforms: updated.platforms,
    };
  }

  /**
   * Returns all campaigns currently scheduled for future release.
   */
  public static listScheduledCampaigns(): MarketingCampaign[] {
    return CampaignManager.listCampaigns({ status: "SCHEDULED" });
  }
}
