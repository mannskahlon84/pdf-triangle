import { VideoPlan } from "../video-planner/types/planner.types";
import { AssetGenerator } from "./assetGenerator";
import { VoiceGenerator, TTSProviderType } from "./voiceGenerator";
import { RenderTimeline } from "./types/generator.types";

export class TimelineBuilder {
  /**
   * Combines Video Scenes, AI Visual Assets, Synthetic Voice, Transitions,
   * and Text Overlays into a unified RenderTimeline.
   */
  public static async buildTimeline(
    videoPlan: VideoPlan,
    ttsProvider: TTSProviderType = "ElevenLabs"
  ): Promise<RenderTimeline> {
    // 1. Generate / Map visual asset specifications for each scene
    const scenesAssets = await AssetGenerator.generateSceneAssets(
      videoPlan.scenes,
      videoPlan.aspectRatio
    );

    // 2. Generate synchronized audio track and subtitle words
    const audioTrackData = await VoiceGenerator.generateVoiceTimeline(
      videoPlan.scenes,
      ttsProvider
    );

    // 3. Construct the RenderTimeline
    const timeline: RenderTimeline = {
      id: `timeline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      videoPlanId: videoPlan.id,
      duration: videoPlan.duration,
      aspectRatio: videoPlan.aspectRatio,
      scenes: scenesAssets,
      audioTrack: {
        totalDurationSec: audioTrackData.totalDurationSec,
        provider: audioTrackData.provider,
        segments: audioTrackData.segments,
        masterAudioUrl: audioTrackData.masterAudioUrl,
      },
      captions: audioTrackData.captions,
      createdAt: new Date().toISOString(),
    };

    return timeline;
  }
}
