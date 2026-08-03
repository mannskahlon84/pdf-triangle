export type RenderProgressState =
  | "CREATING_PLAN"
  | "GENERATING_ASSETS"
  | "GENERATING_VOICE"
  | "RENDERING_VIDEO"
  | "COMPLETED"
  | "FAILED";

export interface SceneAssetSpecification {
  sceneNumber: number;
  backgroundImageUrl: string;
  productImageUrl?: string;
  supportingVisualUrls: string[];
  textOverlay: string;
  animationStyle: string;
  transition: string;
}

export interface AudioTimelineSegment {
  sceneNumber: number;
  startTime: string;
  endTime: string;
  voiceText: string;
  audioUrl: string;
  provider: "Google Neural" | "ElevenLabs" | "OpenAI TTS" | "mock";
}

export interface RenderTimeline {
  id: string;
  videoPlanId: string;
  duration: string;
  aspectRatio: string;
  scenes: SceneAssetSpecification[];
  audioTrack: {
    totalDurationSec: number;
    provider: string;
    segments: AudioTimelineSegment[];
    masterAudioUrl: string;
  };
  captions: {
    sceneNumber: number;
    startTime: string;
    endTime: string;
    text: string;
    words: { word: string; start: number; end: number }[];
  }[];
  createdAt: string;
}

export interface MarketPilotVideoResult {
  videoId: string;
  videoPlanId: string;
  status: RenderProgressState;
  previewUrl: string;
  timeline: RenderTimeline;
  error?: string;
}
