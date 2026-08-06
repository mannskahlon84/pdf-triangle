import { AvatarProfile, PresentationRole } from "./types/avatar.types";
import { AVATAR_REGISTRY } from "./avatarRegistry";

export class AvatarSelector {
  /**
   * Scores and selects the optimal AvatarProfile based on campaign context.
   */
  public static selectAvatar(
    userRegion: string,
    industry: string,
    campaignGoal: string,
    targetAudience: string,
    brandStyle: string = "modern"
  ): AvatarProfile {
    let bestMatch = AVATAR_REGISTRY.find(a => a.id === "avatar_global_fallback")!;
    let highestScore = -1;

    for (const avatar of AVATAR_REGISTRY) {
      if (avatar.id === "avatar_global_fallback") continue;
      
      let score = 0;

      // 1. Region / Country match (highest weight)
      if (userRegion && (
          userRegion.toLowerCase().includes(avatar.region.split(",")[0].trim().toLowerCase()) || 
          (avatar.country && userRegion.toLowerCase().includes(avatar.country.toLowerCase()))
      )) {
        score += 100;
      }

      // 2. Industry match
      if (avatar.industries.includes("all") || avatar.industries.some(ind => ind.toLowerCase() === industry.toLowerCase())) {
        score += 30;
      }

      // 3. Brand Style / Audience match
      if (avatar.brandStyles.some(style => targetAudience.toLowerCase().includes(style) || brandStyle.toLowerCase().includes(style))) {
        score += 20;
      }

      // 4. Campaign Goal / Presentation Role match
      const mappedRole = this.mapGoalToRole(campaignGoal);
      if (avatar.presentationRoles.includes(mappedRole)) {
        score += 20;
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = avatar;
      }
    }

    // If score is less than 100 (meaning no region match was found), fallback to global
    if (highestScore < 100) {
      return AVATAR_REGISTRY.find(a => a.id === "avatar_global_fallback")!;
    }

    return bestMatch;
  }

  private static mapGoalToRole(goal: string): PresentationRole {
    const g = goal.toLowerCase();
    if (g.includes("sale") || g.includes("conversion")) return "sales";
    if (g.includes("educat") || g.includes("aware")) return "education";
    if (g.includes("hospitality") || g.includes("welcome")) return "hospitality";
    if (g.includes("recruit") || g.includes("hire")) return "recruitment";
    return "brand_ambassador";
  }
}
