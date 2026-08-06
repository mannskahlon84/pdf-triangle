import { AssetRecord } from "../types/database.types";

export class AssetRepository {
  private static assets: Map<string, AssetRecord> = new Map();

  public static async create(asset: AssetRecord): Promise<AssetRecord> {
    this.assets.set(asset.assetId, asset);
    return asset;
  }

  public static async update(assetId: string, updates: Partial<AssetRecord>): Promise<AssetRecord | null> {
    const existing = this.assets.get(assetId);
    if (!existing) return null;
    
    const updated = { ...existing, ...updates };
    this.assets.set(assetId, updated);
    return updated;
  }

  public static async findById(id: string): Promise<AssetRecord | null> {
    return this.assets.get(id) || null;
  }

  public static async findByCampaignId(campaignId: string): Promise<AssetRecord[]> {
    return Array.from(this.assets.values()).filter(a => a.campaignId === campaignId);
  }
}
