import { VideoPlan } from "../video-planner/types/planner.types";
import { TimelineBuilder } from "./timelineBuilder";
import {
  RenderTimeline,
  RenderProgressState,
  MarketPilotVideoResult,
} from "./types/generator.types";
import { VideoRenderService } from "@/services/videoRenderService";
import { TTSProviderType } from "./voiceGenerator";

export interface CreateRenderJobRequest {
  videoProjectId: string;
  scriptVersionId: string;
  outputUrl?: string;
  mediaAssetId: string;
  duration: "15s" | "30s" | "60s";
  renderTimeline: RenderTimeline;
  mockMode?: boolean;
}

/**
 * MarketPilot Render Adapter
 * Connects MarketPilot AI output directly to the existing Hybrid Video Engine
 * (/api/render-hybrid-video / VideoRenderService) without replacing any existing rendering logic.
 */
export class MarketPilotRenderAdapter {
  /**
   * Submits a compiled RenderTimeline to the existing VideoRenderService
   */
  public static async submitToExistingVideoEngine(
    timeline: RenderTimeline,
    mockMode: boolean = false
  ): Promise<{ jobId: string; status: string; outputUrl?: string }> {
    const validDurations = ["60s", "30s", "15s"];
    const duration = validDurations.includes(timeline.duration)
      ? (timeline.duration as "60s" | "30s" | "15s")
      : ("30s" as const);

    const job = await VideoRenderService.createRenderJob({
      videoProjectId: timeline.id,
      scriptVersionId: timeline.videoPlanId,
      mediaAssetId:
        timeline.scenes[0]?.backgroundImageUrl || "default_asset_id",
      duration,
      renderTimeline: timeline,
      mockMode,
    });
    return {
      jobId: job.id,
      status: job.status,
      outputUrl: job.outputUrl,
    };
  }

  /**
   * Queries existing video engine for render progress
   */
  public static async getExistingEngineProgress(
    jobId: string
  ): Promise<{
    jobId: string;
    status: string;
    outputUrl?: string;
  } | null> {
    const job = await VideoRenderService.getRenderJobProgress(jobId);
    if (!job) return null;
    return {
      jobId: job.id,
      status: job.status,
      outputUrl: job.outputUrl,
    };
  }
}

/**
 * Render Coordinator
 * Orchestrates:
 * VideoPlan -> Asset Generator -> Voice Generator -> Timeline Builder -> Render Adapter -> Final Video
 * Manages states: CREATING_PLAN -> GENERATING_ASSETS -> GENERATING_VOICE -> RENDERING_VIDEO -> COMPLETED
 */
export class RenderCoordinator {
  private static activeJobs: Map<string, MarketPilotVideoResult> = new Map();

  /**
   * Initiates the MarketPilot Hybrid Video Generation pipeline.
   */
  public static async startVideoGeneration(
    videoPlan: VideoPlan,
    ttsProvider: TTSProviderType = "ElevenLabs",
    simulateAsync: boolean = true
  ): Promise<MarketPilotVideoResult> {
    const videoId = `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // 1. Initial State: CREATING_PLAN
    const initialResult: MarketPilotVideoResult = {
      videoId,
      videoPlanId: videoPlan.id,
      status: "CREATING_PLAN",
      previewUrl: "",
      timeline: null as any,
    };

    this.activeJobs.set(videoId, initialResult);

    if (simulateAsync) {
      this.runAsyncGenerationPipeline(videoId, videoPlan, ttsProvider);
    } else {
      await this.runSyncGenerationPipeline(videoId, videoPlan, ttsProvider);
    }

    return this.activeJobs.get(videoId)!;
  }

  /**
   * Retrieves the current generation state of a video job.
   */
  public static getJobStatus(videoId: string): MarketPilotVideoResult | null {
    return this.activeJobs.get(videoId) || null;
  }

  /**
   * Synchronous execution for tests or immediate completion.
   */
  private static async runSyncGenerationPipeline(
    videoId: string,
    videoPlan: VideoPlan,
    ttsProvider: TTSProviderType
  ): Promise<void> {
    const job = this.activeJobs.get(videoId);
    if (!job) return;

    try {
      job.status = "GENERATING_ASSETS";
      this.activeJobs.set(videoId, { ...job });

      job.status = "GENERATING_VOICE";
      this.activeJobs.set(videoId, { ...job });

      const timeline = await TimelineBuilder.buildTimeline(
        videoPlan,
        ttsProvider
      );
      job.timeline = timeline;

      job.status = "RENDERING_VIDEO";
      this.activeJobs.set(videoId, { ...job });

      // Connect via MarketPilot Render Adapter to existing VideoRenderService
      const renderResult =
        await MarketPilotRenderAdapter.submitToExistingVideoEngine(
          timeline,
          false
        );

      job.status = "COMPLETED";
      job.previewUrl = renderResult.outputUrl;
      this.activeJobs.set(videoId, { ...job });
    } catch (e: any) {
      job.status = "FAILED";
      job.error = e.message || "Video generation failed.";
      this.activeJobs.set(videoId, { ...job });
    }
  }

  /**
   * Asynchronous simulated execution with realistic milestones for the frontend studio.
   */
  private static async runAsyncGenerationPipeline(
    videoId: string,
    videoPlan: VideoPlan,
    ttsProvider: TTSProviderType
  ): Promise<void> {
    const job = this.activeJobs.get(videoId);
    if (!job) return;

    try {
      // Step 1: GENERATING_ASSETS (600ms)
      setTimeout(() => {
        const j = this.activeJobs.get(videoId);
        if (j) {
          j.status = "GENERATING_ASSETS";
          this.activeJobs.set(videoId, { ...j });
        }
      }, 600);

      // Step 2: GENERATING_VOICE (1300ms)
      setTimeout(async () => {
        const j = this.activeJobs.get(videoId);
        if (j) {
          j.status = "GENERATING_VOICE";
          this.activeJobs.set(videoId, { ...j });
        }
      }, 1300);

      // Step 3: BUILD TIMELINE & RENDERING_VIDEO (2200ms)
      setTimeout(async () => {
        const j = this.activeJobs.get(videoId);
        if (j) {
          const timeline = await TimelineBuilder.buildTimeline(
            videoPlan,
            ttsProvider
          );
          j.timeline = timeline;
          j.status = "RENDERING_VIDEO";
          this.activeJobs.set(videoId, { ...j });

          // Submit to existing engine via adapter
          const renderResult =
            await MarketPilotRenderAdapter.submitToExistingVideoEngine(
              timeline,
              false
            );

          // Step 4: COMPLETED (after render submission resolves)
          setTimeout(() => {
            const jCompleted = this.activeJobs.get(videoId);
            if (jCompleted) {
              jCompleted.status = "COMPLETED";
              jCompleted.previewUrl = renderResult.outputUrl;
              this.activeJobs.set(videoId, { ...jCompleted });
            }
          }, 1200);
        }
      }, 2200);
    } catch (e: any) {
      job.status = "FAILED";
      job.error = e.message || "Async pipeline failed.";
      this.activeJobs.set(videoId, { ...job });
    }
  }
}
