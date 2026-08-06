import { CampaignProfile } from "./types/campaign.types";

export class CampaignValidator {
  public static validate(profile: CampaignProfile): boolean {
    if (!profile.userType) {
      throw new Error("CampaignProfile must specify userType (individual or business).");
    }
    if (!profile.visualMode) {
      throw new Error("CampaignProfile must specify visualMode.");
    }
    if (!profile.voiceMode) {
      throw new Error("CampaignProfile must specify voiceMode.");
    }
    if (!profile.avatarMode) {
      throw new Error("CampaignProfile must specify avatarMode.");
    }

    return true;
  }
}
