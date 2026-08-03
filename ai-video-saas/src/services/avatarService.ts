/**
 * Market Pilot AI — Avatar & Lip-Sync Service (Provider Abstraction Layer)
 * Implements Zero-Glitch Video Pipeline Architecture Rules
 */

export interface AvatarProfile {
  id: string;
  name: string;
  role: string;
  previewImageUrl: string;
  isFixedPosition: boolean; // Must always remain true (Rule 5)
  zeroGlitchCompliance: {
    noFakeBodyMovements: boolean; // Rule 1
    noAIHandsOrFingers: boolean; // Rule 2
    usesUploadedFootageForHumans: boolean; // Rule 3
    cameraMovementForImagesOnly: boolean; // Rule 4
    providerReadyLipSync: boolean; // Rule 6
  };
}

export interface PrepareAvatarRequest {
  avatarId: string;
  scriptText: string;
  segmentDuration: number; // 0-5s Intro or 22-30s CTA
  mockMode?: boolean;
}

export interface PrepareAvatarResponse {
  avatarStreamUrl: string;
  lipSyncConfidence: number;
  isFixedFrame: boolean;
  provider: "mock" | "heygen-ready" | "synthesia-ready";
}

export class AvatarService {
  /**
   * Returns approved Zero-Glitch AI Human Host Personas
   */
  static getAvatarList(): AvatarProfile[] {
    return [
      {
        id: "alex",
        name: "Alex - Corporate Host",
        role: "Professional Recruiter & Spokesperson",
        previewImageUrl:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80",
        isFixedPosition: true,
        zeroGlitchCompliance: {
          noFakeBodyMovements: true,
          noAIHandsOrFingers: true,
          usesUploadedFootageForHumans: true,
          cameraMovementForImagesOnly: true,
          providerReadyLipSync: true,
        },
      },
      {
        id: "sarah",
        name: "Sarah - Healthcare & Tech Host",
        role: "Empathetic Patient Host & Guide",
        previewImageUrl:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&q=80",
        isFixedPosition: true,
        zeroGlitchCompliance: {
          noFakeBodyMovements: true,
          noAIHandsOrFingers: true,
          usesUploadedFootageForHumans: true,
          cameraMovementForImagesOnly: true,
          providerReadyLipSync: true,
        },
      },
      {
        id: "marcus",
        name: "Marcus - Fitness Host",
        role: "High-Energy Wellness Presenter",
        previewImageUrl:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
        isFixedPosition: true,
        zeroGlitchCompliance: {
          noFakeBodyMovements: true,
          noAIHandsOrFingers: true,
          usesUploadedFootageForHumans: true,
          cameraMovementForImagesOnly: true,
          providerReadyLipSync: true,
        },
      },
    ];
  }

  /**
   * Prepares synchronized lip-sync audio/video stream for an Avatar segment
   */
  static async prepareAvatarSegment(
    request: PrepareAvatarRequest
  ): Promise<PrepareAvatarResponse> {
    if (request.mockMode ?? true) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        avatarStreamUrl: "mock://avatar-fixed-stream.mp4",
        lipSyncConfidence: 0.99,
        isFixedFrame: true,
        provider: "mock",
      };
    }

    throw new Error(
      "External Avatar Lip-Sync Provider configured in provider-ready mode. Enable mockMode for MVP."
    );
  }
}
