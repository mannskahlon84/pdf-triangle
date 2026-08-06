import { GenerationContext, GenerationStep } from "./types/orchestrator.types";
import { JobRepository } from "../database/repositories/jobRepository";
import { GenerationJob, DBGeneratedVideo } from "../database/types/database.types";
import { ScenePlanner } from "../video-planner/scenePlanner";
import { TimelineBuilder } from "../video-generator/timelineBuilder";
import { FFmpegRenderer } from "../../services/renderers/FFmpegRenderer";
import { VideoRepository } from "../database/repositories/videoRepository";
import { AssetService } from "../storage/assetService";

// Step 1: Asset resolution
export class AssetResolutionStep implements GenerationStep {
  name = "AssetResolution";
  constructor(private assetService: AssetService) {}
  
  async execute(context: GenerationContext): Promise<void> {
    if (!context.assetLocalPaths || context.assetLocalPaths.length === 0) return;
    
    // In Phase 1 we mock uploading one hero asset just to verify wiring
    await this.assetService.uploadCampaignAsset(context.assetLocalPaths[0], "image", {
      userId: context.userId,
      workspaceId: context.workspaceId,
      campaignId: context.campaignId
    });
  }
}

// Step 2: Creative Planning
export class CreativePlanningStep implements GenerationStep {
  name = "CreativePlanning";
  async execute(context: GenerationContext): Promise<void> {
    if (!context.campaign || !context.campaignProfile) throw new Error("Missing campaign data");

    // ScenePlanner encapsulates HybridCreativePlanner, VEE, CinematicEngine, VoiceEngine, AvatarEngine
    context.videoPlan = await ScenePlanner.generateVideoPlanFromCampaign(context.campaign, {
      hybridAiMode: true, // Force Hybrid mode to trigger all AI Directors
      campaignProfile: context.campaignProfile
    });
  }
}

// Step 3: Timeline Assembly
export class TimelineAssemblyStep implements GenerationStep {
  name = "TimelineAssembly";
  async execute(context: GenerationContext): Promise<void> {
    if (!context.videoPlan) throw new Error("Missing video plan");
    context.renderTimeline = await TimelineBuilder.buildTimeline(context.videoPlan, context.campaignId);
  }
}

// Step 4: Render
export class RenderStep implements GenerationStep {
  name = "Render";
  async execute(context: GenerationContext): Promise<void> {
    if (!context.renderTimeline) throw new Error("Missing render timeline");
    // Mock the actual render for orchestrator E2E
    // Real pipeline: const renderer = new FFmpegRenderer(); await renderer.render(context.renderTimeline);
    context.videoUrl = "mock_output_url";
  }
}

export class GenerationOrchestrator {
  private steps: GenerationStep[] = [];

  constructor(assetService: AssetService) {
    this.steps = [
      new AssetResolutionStep(assetService),
      new CreativePlanningStep(),
      new TimelineAssemblyStep(),
      new RenderStep()
    ];
  }

  public async runGeneration(context: GenerationContext): Promise<void> {
    context.metrics.startTime = Date.now();
    
    // 1. Initialize Job
    const job: GenerationJob = {
      jobId: context.jobId,
      campaignId: context.campaignId,
      provider: "marketpilot_internal",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await JobRepository.create(job);
    await JobRepository.update(job.jobId, { status: "RUNNING" });

    try {
      // 2. Execute Steps
      for (const step of this.steps) {
        const stepStart = Date.now();
        await this.executeStepWithRetry(step, context);
        context.metrics.stepDurations[step.name] = Date.now() - stepStart;
      }

      // 3. Complete Job
      await JobRepository.update(job.jobId, { status: "COMPLETED" });
      context.metrics.endTime = Date.now();

      // 4. Save Generated Video
      if (context.videoUrl) {
        const generatedVideo: DBGeneratedVideo = {
          videoId: `vid_${Date.now()}`,
          campaignId: context.campaignId,
          videoUrl: context.videoUrl,
          status: "READY"
        };
        await VideoRepository.create(generatedVideo);
      }

    } catch (error) {
      await JobRepository.update(job.jobId, { status: "FAILED" });
      throw error;
    }
  }

  private async executeStepWithRetry(step: GenerationStep, context: GenerationContext, maxRetries = 2): Promise<void> {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        await step.execute(context);
        return;
      } catch (err) {
        attempt++;
        context.metrics.retryCounts[step.name] = attempt;
        if (attempt > maxRetries) throw err;
      }
    }
  }
}
