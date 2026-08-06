import { BrandProfile } from "./types/brand.types";
import { Workspace } from "../workspace/types/workspace.types";

export class BrandDefaults {
  public static applyDefaults(profile: Partial<BrandProfile>, workspace?: Workspace): BrandProfile {
    return {
      id: profile.id || `brand_${Date.now()}`,
      version: profile.version || 1,
      brandName: profile.brandName || "Unknown Brand",
      industry: profile.industry || workspace?.industry || "general",
      country: profile.country || workspace?.country || "Global",
      languagePreference: profile.languagePreference || workspace?.language || "English",
      
      brandStyle: profile.brandStyle || "modern",
      
      // Inheritance Priority: Brand > Workspace > System
      preferredVisualMode: profile.preferredVisualMode || workspace?.workspaceSettings?.defaultVisualMode || "standard",
      preferredVoiceMode: profile.preferredVoiceMode || workspace?.workspaceSettings?.defaultVoiceMode || "business_industry",
      preferredAvatarMode: profile.preferredAvatarMode || workspace?.workspaceSettings?.defaultAvatarMode || "none",
      
      brandColors: profile.brandColors || [],
      logoUrl: profile.logoUrl,
      fontStyle: profile.fontStyle,
      visualKeywords: profile.visualKeywords || [],
      
      targetAudience: profile.targetAudience || {
        customerType: "general",
        location: profile.country || workspace?.country || "Global"
      }
    };
  }
}
