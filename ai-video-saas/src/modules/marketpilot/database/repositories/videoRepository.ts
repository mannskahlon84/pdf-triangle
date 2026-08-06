import { DBGeneratedVideo } from "../types/database.types";

export class VideoRepository {
  private static videos: Map<string, DBGeneratedVideo> = new Map();

  public static async create(video: DBGeneratedVideo): Promise<DBGeneratedVideo> {
    this.videos.set(video.videoId, video);
    return video;
  }

  public static async findById(id: string): Promise<DBGeneratedVideo | null> {
    return this.videos.get(id) || null;
  }

  public static async findByCampaignId(campaignId: string): Promise<DBGeneratedVideo[]> {
    return Array.from(this.videos.values()).filter(v => v.campaignId === campaignId);
  }
}
