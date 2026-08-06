import { AvatarProfile, AvatarInstruction } from "./types/avatar.types";

export class AvatarPromptEngine {
  /**
   * Formats the selected AvatarProfile into a standardized AvatarInstruction.
   */
  public static generateInstruction(profile: AvatarProfile): AvatarInstruction {
    return {
      avatarId: profile.id,
      appearance: `${profile.culturalStyle} ${profile.gender.toLowerCase()}, ${profile.ageGroup}, ${profile.skinTone} skin tone`,
      clothing: profile.clothingStyle,
      language: profile.language,
      voiceStyle: profile.voiceProfile,
      presentationStyle: `${profile.professionalStyle} suited for ${profile.presentationRoles.join(", ")}`,
    };
  }
}
