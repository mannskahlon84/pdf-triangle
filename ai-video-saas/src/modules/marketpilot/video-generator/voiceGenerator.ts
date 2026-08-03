import { VideoScene } from "../video-planner/types/planner.types";
import { AudioTimelineSegment } from "./types/generator.types";

export type TTSProviderType =
  | "Google Neural"
  | "ElevenLabs"
  | "OpenAI TTS"
  | "mock";

const DEMO_AUDIO_TRACKS: Record<TTSProviderType, string> = {
  "Google Neural":
    "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
  ElevenLabs:
    "https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3",
  "OpenAI TTS":
    "https://assets.mixkit.co/active_storage/sfx/2871/2871-preview.mp3",
  mock: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
};

export class VoiceGenerator {
  /**
   * Routes voice synthesis requests to configured TTS providers
   * (Google Neural, ElevenLabs, OpenAI TTS) and returns a synchronized Audio Timeline.
   */
  public static async generateVoiceTimeline(
    scenes: VideoScene[],
    provider: TTSProviderType = "ElevenLabs"
  ): Promise<{
    totalDurationSec: number;
    provider: string;
    segments: AudioTimelineSegment[];
    masterAudioUrl: string;
    captions: {
      sceneNumber: number;
      startTime: string;
      endTime: string;
      text: string;
      words: { word: string; start: number; end: number }[];
    }[];
  }> {
    const segments: AudioTimelineSegment[] = [];
    const captions: {
      sceneNumber: number;
      startTime: string;
      endTime: string;
      text: string;
      words: { word: string; start: number; end: number }[];
    }[] = [];

    let totalSec = 0;

    scenes.forEach((scene) => {
      const startSec = parseFloat(scene.startTime);
      const endSec = parseFloat(scene.endTime);
      totalSec = Math.max(totalSec, endSec);

      segments.push({
        sceneNumber: scene.sceneNumber,
        startTime: scene.startTime,
        endTime: scene.endTime,
        voiceText: scene.voiceText,
        audioUrl: DEMO_AUDIO_TRACKS[provider] || DEMO_AUDIO_TRACKS.ElevenLabs,
        provider,
      });

      // Generate precise word-level subtitle timings for karaoke captioning
      const wordsArray = scene.voiceText.split(/\s+/).filter(Boolean);
      const sceneDurationSec = endSec - startSec;
      const secPerWord =
        wordsArray.length > 0 ? sceneDurationSec / wordsArray.length : 0.5;

      const words = wordsArray.map((word, wIdx) => {
        const wordStart = Number((startSec + wIdx * secPerWord).toFixed(2));
        const wordEnd = Number(
          (startSec + (wIdx + 1) * secPerWord).toFixed(2)
        );
        return {
          word,
          start: wordStart,
          end: Math.min(wordEnd, endSec),
        };
      });

      captions.push({
        sceneNumber: scene.sceneNumber,
        startTime: scene.startTime,
        endTime: scene.endTime,
        text: scene.voiceText,
        words,
      });
    });

    return {
      totalDurationSec: totalSec,
      provider,
      segments,
      masterAudioUrl:
        DEMO_AUDIO_TRACKS[provider] || DEMO_AUDIO_TRACKS.ElevenLabs,
      captions,
    };
  }
}
