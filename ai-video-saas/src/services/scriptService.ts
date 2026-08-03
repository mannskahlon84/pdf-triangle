/**
 * Market Pilot AI — Script Generator Service (Provider Abstraction Layer)
 * Supports Mock Mode and Future LLM Providers (OpenAI / Anthropic / Gemini)
 */

import { ScriptVersion } from "@/types/database";

export interface GenerateScriptRequest {
  businessInfo: string;
  targetAudience: string;
  brandTone: string;
  angle?: string;
  duration?: "15s" | "30s" | "60s";
  mockMode?: boolean;
}

export class ScriptService {
  /**
   * Generates a structured marketing script with Hook, Problem, Solution, Benefits, CTA,
   * and adheres to the Zero-Glitch 3-Segment Pipeline Architecture:
   * 0–5s: AI Presenter Introduction | 5–22s: Real Workplace Footage | 22–30s: AI Presenter CTA
   */
  static async generateMarketingScript(
    request: GenerateScriptRequest
  ): Promise<ScriptVersion> {
    if (request.mockMode ?? true) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const isRecruiting =
        request.targetAudience.toLowerCase().includes("engineer") ||
        request.targetAudience.toLowerCase().includes("talent") ||
        request.targetAudience.toLowerCase().includes("hire");

      const title = request.angle
        ? `${request.angle} (${request.targetAudience})`
        : `Workplace Reel — ${request.targetAudience}`;

      const hook = isRecruiting
        ? "See how our team delivers quality service every day."
        : "See how our team delivers quality service every day.";

      const problem =
        "Traditional workplace recruiting and marketing lacks authentic, verifiable technical proof.";
      const solution =
        "Market Pilot AI showcases real workplace automation and compliance footage directly in social feeds.";
      const benefits = [
        "100% Verified OSHA Safety Compliance",
        "Pre-vetted engineering & technical specialists",
        "48-hour placement velocity with zero onboarding friction",
      ];
      const cta =
        "Partner with Market Pilot AI today and transform your workplace visibility.";

      return {
        id: `script_${Date.now()}`,
        videoProjectId: "default_project",
        title,
        hook,
        problem,
        solution,
        benefits,
        cta,
        tone: request.brandTone,
        targetAudience: request.targetAudience,
        versionNumber: 1,
        createdAt: new Date().toISOString(),
        segments: [
          {
            id: "seg-intro",
            start: 0,
            end: 5,
            speaker: "Avatar",
            text: "See how our team delivers quality service every day.",
            visualCue: "AI Presenter Introduction (Fixed Studio Position)",
          },
          {
            id: "seg-workplace",
            start: 5,
            end: 22,
            speaker: "Voiceover",
            text: "From OSHA-certified safety gear to high-precision robotics, our specialists maintain elite compliance.",
            visualCue: "Real workplace/product footage (Zero AI limb distortion)",
          },
          {
            id: "seg-cta",
            start: 22,
            end: 30,
            speaker: "Avatar",
            text: "Partner with our enterprise team today. Visit our link in bio to get started.",
            visualCue: "AI Presenter CTA (Fixed Studio Position)",
          },
        ],
      };
    }

    throw new Error(
      "External LLM Script Provider is configured in provider-ready mode. Enable mockMode for MVP."
    );
  }
}
