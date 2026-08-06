import { BrandStyle, VisualMode, VoiceMode, AvatarMode, TargetAudience } from "../../campaign-profile/types/campaign.types";

export interface BrandProfile {
  id?: string;
  version?: number;
  
  brandName: string;
  industry: string;
  country?: string;
  languagePreference?: string;
  
  brandStyle?: BrandStyle;
  preferredVisualMode?: VisualMode;
  preferredVoiceMode?: VoiceMode;
  preferredAvatarMode?: AvatarMode;
  
  brandColors?: string[];
  logoUrl?: string;
  fontStyle?: string;
  visualKeywords?: string[];
  
  targetAudience?: TargetAudience;
}
