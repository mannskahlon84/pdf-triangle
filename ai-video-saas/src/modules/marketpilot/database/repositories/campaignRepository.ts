import { DBCampaign } from "../types/database.types";

export class CampaignRepository {
  private static campaigns: Map<string, DBCampaign> = new Map();

  public static async create(campaign: DBCampaign): Promise<DBCampaign> {
    this.campaigns.set(campaign.campaignId, campaign);
    return campaign;
  }

  public static async findById(id: string): Promise<DBCampaign | null> {
    return this.campaigns.get(id) || null;
  }

  public static async findByWorkspaceId(workspaceId: string): Promise<DBCampaign[]> {
    return Array.from(this.campaigns.values()).filter(c => c.workspaceId === workspaceId);
  }
}
