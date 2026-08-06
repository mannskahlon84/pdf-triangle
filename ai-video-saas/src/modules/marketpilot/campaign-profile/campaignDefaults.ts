import { CampaignProfile, VisualMode, VoiceMode, AvatarMode, BrandStyle } from "./types/campaign.types";
import { BrandProfile } from "../brand-profile/types/brand.types";

export class CampaignDefaults {
  public static applyDefaults(profile: Partial<CampaignProfile>, brandProfile?: BrandProfile): CampaignProfile {
    const userType = profile.userType || "individual";
    
    // System defaults based on userType
    let sysVisual: VisualMode = userType === "business" ? "hybrid_ai" : "standard";
    let sysVoice: VoiceMode = userType === "business" ? "business_industry" : "individual_creator";
    let sysAvatar: AvatarMode = "none";
    let sysBrandStyle: BrandStyle = userType === "business" ? "corporate" : "friendly";

    return {
      id: profile.id || `profile_${Date.now()}`,
      profileVersion: profile.profileVersion || 1,
      userType,
      region: profile.region || brandProfile?.country || "Global",
      country: profile.country || brandProfile?.country || "Unknown",
      language: profile.language || brandProfile?.languagePreference || "English",
      industry: profile.industry || brandProfile?.industry || "general",
      promotionType: profile.promotionType || (userType === "business" ? "brand" : "social_profile"),
      
      targetAudience: {
        ageGroup: profile.targetAudience?.ageGroup || brandProfile?.targetAudience?.ageGroup || "all",
        location: profile.targetAudience?.location || brandProfile?.targetAudience?.location || profile.region || brandProfile?.country || "Global",
        language: profile.targetAudience?.language || brandProfile?.targetAudience?.language || profile.language || brandProfile?.languagePreference || "English",
        customerType: profile.targetAudience?.customerType || brandProfile?.targetAudience?.customerType || (userType === "business" ? "B2B/B2C" : "followers")
      },
      
      campaignGoal: profile.campaignGoal || "awareness",
      
      // Inheritance Priority: Campaign > Brand > System
      brandStyle: profile.brandStyle || brandProfile?.brandStyle || sysBrandStyle,
      visualMode: profile.visualMode || brandProfile?.preferredVisualMode || sysVisual,
      voiceMode: profile.voiceMode || brandProfile?.preferredVoiceMode || sysVoice,
      avatarMode: profile.avatarMode || brandProfile?.preferredAvatarMode || sysAvatar
    };
  }
}
