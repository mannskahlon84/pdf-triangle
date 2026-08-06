export type AvatarMode = "none" | "ai_presenter";

export type AvatarType = "human_presenter" | "host" | "expert" | "creator";

export type PresentationRole = "sales" | "education" | "hospitality" | "recruitment" | "brand_ambassador";

export interface AvatarProfile {
  id: string;
  region: string;
  country?: string;
  language: string;
  gender: string;
  ageGroup: string;
  skinTone: string;
  clothingStyle: string;
  culturalStyle: string;
  professionalStyle: string;
  industries: string[];
  voiceProfile: string;
  avatarType: AvatarType;
  presentationRoles: PresentationRole[];
  brandStyles: string[]; // e.g. "luxury", "casual", "modern", "traditional"
}

export interface AvatarInstruction {
  avatarId: string;
  appearance: string; 
  clothing: string;   
  language: string;
  voiceStyle: string;
  presentationStyle: string; 
}
