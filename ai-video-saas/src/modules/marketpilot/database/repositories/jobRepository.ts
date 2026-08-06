import { GenerationJob } from "../types/database.types";

export class JobRepository {
  private static jobs: Map<string, GenerationJob> = new Map();

  public static async create(job: GenerationJob): Promise<GenerationJob> {
    this.jobs.set(job.jobId, job);
    return job;
  }

  public static async update(jobId: string, updates: Partial<GenerationJob>): Promise<GenerationJob | null> {
    const existing = this.jobs.get(jobId);
    if (!existing) return null;
    
    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    this.jobs.set(jobId, updated);
    return updated;
  }

  public static async findById(id: string): Promise<GenerationJob | null> {
    return this.jobs.get(id) || null;
  }
}
