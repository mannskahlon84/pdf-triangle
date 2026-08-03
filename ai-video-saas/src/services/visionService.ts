/**
 * Market Pilot AI — Vision Service (Provider Abstraction Layer)
 * Supports Mock Mode and Future External AI Vision Providers (Gemini / GPT-4o)
 */

import { KeyframeTag } from "@/types/database";

export interface AnalyzeMediaRequest {
  mediaUrl: string;
  mediaType: "video" | "image";
  brandId: string;
  mockMode?: boolean;
}

export interface AnalyzeMediaResponse {
  assetId: string;
  duration: number;
  resolution: string;
  keyframes: KeyframeTag[];
  provider: "mock" | "gemini-vision" | "gpt4o-vision";
  analyzedAt: string;
}

export class VisionService {
  /**
   * Analyzes workplace video or images for visual actions, compliance, and marketing hooks.
   */
  static async analyzeWorkplaceMedia(
    request: AnalyzeMediaRequest
  ): Promise<AnalyzeMediaResponse> {
    if (request.mockMode ?? true) {
      // Simulate realistic network latency for vision analysis
      await new Promise((resolve) => setTimeout(resolve, 800));

      return {
        assetId: `asset_${Date.now()}`,
        duration: request.mediaType === "video" ? 15 : 5,
        resolution: "1080p · 60fps",
        provider: "mock",
        analyzedAt: new Date().toISOString(),
        keyframes: [
          {
            id: "kf-01",
            timestamp: 2,
            label: "Safety equipment detected",
            confidence: 98,
            tags: ["OSHA Compliance", "Safety Gear", "Workplace Compliance"],
          },
          {
            id: "kf-02",
            timestamp: 8,
            label: "Team collaboration detected",
            confidence: 96,
            tags: ["Teamwork", "Engineering Collaboration", "Mentorship"],
          },
          {
            id: "kf-03",
            timestamp: 15,
            label: "Machine operation detected",
            confidence: 99,
            tags: ["Automation", "Precision Robotics", "High Efficiency"],
          },
        ],
      };
    }

    // Future External AI Provider Integration (e.g. Google Gemini Pro Vision API)
    throw new Error(
      "External AI Vision Provider integration is configured in provider-ready mode. Enable mockMode for MVP."
    );
  }
}
