import { RenderTimeline } from "@/modules/marketpilot/video-generator/types/generator.types";

export interface VideoRenderer {
  render(
    timeline: RenderTimeline
  ): Promise<{
    outputUrl: string;
    duration: number;
  }>;
}
