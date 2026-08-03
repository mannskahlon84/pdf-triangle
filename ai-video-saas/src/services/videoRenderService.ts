/**
 * Market Pilot AI — Video Render Simulation Service (Provider Abstraction Layer)
 * Implements Asynchronous Rendering Simulation with 5 Milestone Steps
 */

import { RenderJob, RenderJobStatus } from "@/types/database";

export interface CreateRenderJobRequest {
  videoProjectId: string;
  scriptVersionId: string;
  mediaAssetId: string;
  duration: "15s" | "30s" | "60s";
  mockMode?: boolean;
}

export class VideoRenderService {
  private static mockJobs: Map<string, RenderJob> = new Map();

  /**
   * Initializes a new asynchronous render job in QUEUED / ANALYZING state
   */
  static async createRenderJob(
    request: CreateRenderJobRequest
  ): Promise<RenderJob> {
    const jobId = `job_${Date.now()}`;
    const newJob: RenderJob = {
      id: jobId,
      videoProjectId: request.videoProjectId,
      scriptVersionId: request.scriptVersionId,
      mediaAssetId: request.mediaAssetId,
      status: "ANALYZING",
      progress: 10,
      stepText: "Analyzing footage (0–5s Intro, 5–22s Workplace, 22–30s CTA)",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.mockJobs.set(jobId, newJob);

    // Simulate async background rendering steps in mock mode
    if (request.mockMode ?? true) {
      this.simulateAsyncRenderSteps(jobId);
    }

    return newJob;
  }

  /**
   * Retrieves the current progress of an asynchronous render job
   */
  static async getRenderJobProgress(jobId: string): Promise<RenderJob | null> {
    return this.mockJobs.get(jobId) || null;
  }

  /**
   * Background step simulation matching the spec:
   * 10% Analyzing footage
   * 30% Generating marketing script
   * 50% Preparing avatar
   * 75% Combining footage
   * 100% Export MP4
   */
  private static simulateAsyncRenderSteps(jobId: string): void {
    const steps: { progress: number; status: RenderJobStatus; text: string; delay: number }[] = [
      {
        progress: 10,
        status: "ANALYZING",
        text: "Analyzing footage...",
        delay: 0,
      },
      {
        progress: 30,
        status: "SCRIPTING",
        text: "Generating marketing script...",
        delay: 800,
      },
      {
        progress: 50,
        status: "AVATAR_PREP",
        text: "Preparing avatar (Zero-Glitch Fixed Position)...",
        delay: 1600,
      },
      {
        progress: 75,
        status: "COMPOSITING",
        text: "Combining footage (Real workplace B-Roll synchronization)...",
        delay: 2400,
      },
      {
        progress: 100,
        status: "COMPLETED",
        text: "Export MP4 (Production ready)",
        delay: 3200,
      },
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        const job = this.mockJobs.get(jobId);
        if (job) {
          job.progress = step.progress;
          job.status = step.status;
          job.stepText = step.text;
          job.updatedAt = new Date().toISOString();
          if (step.progress === 100) {
            job.outputUrl =
              "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-a-motherboard-41618-large.mp4";
          }
          this.mockJobs.set(jobId, job);
        }
      }, step.delay);
    });
  }
}
