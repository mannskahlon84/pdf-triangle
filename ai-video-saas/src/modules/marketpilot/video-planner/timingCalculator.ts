import { VideoDuration } from "./types/planner.types";

export interface SceneTiming {
  startTimeSec: number;
  endTimeSec: number;
  durationSec: number;
  startTimeFormatted: string; // e.g., "00:00"
  endTimeFormatted: string;   // e.g., "00:05"
  durationFormatted: string;  // e.g., "5 seconds"
}

export class TimingCalculator {
  public static getTotalSeconds(duration: VideoDuration): number {
    switch (duration) {
      case "15s":
        return 15;
      case "60s":
        return 60;
      case "30s":
      default:
        return 30;
    }
  }

  public static formatTimestamp(sec: number): string {
    const mins = Math.floor(sec / 60);
    const secs = Math.round(sec % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * Given an array of duration ratios that sum to approx 1.0, compute exact non-overlapping timings.
   */
  public static calculateSceneTimings(
    durationRatios: number[],
    totalDuration: VideoDuration
  ): SceneTiming[] {
    const totalSec = this.getTotalSeconds(totalDuration);
    const sumRatios = durationRatios.reduce((acc, r) => acc + r, 0);
    const normalized = durationRatios.map((r) => r / sumRatios);

    let currentStart = 0;
    return normalized.map((ratio, idx) => {
      // For the last scene, take remaining seconds to avoid rounding drift
      const isLast = idx === normalized.length - 1;
      const durationSec = isLast
        ? Math.round((totalSec - currentStart) * 10) / 10
        : Math.round(totalSec * ratio * 10) / 10;
      const startTimeSec = Math.round(currentStart * 10) / 10;
      const endTimeSec = Math.round((startTimeSec + durationSec) * 10) / 10;

      const timing: SceneTiming = {
        startTimeSec,
        endTimeSec,
        durationSec,
        startTimeFormatted: `${startTimeSec}s`,
        endTimeFormatted: `${endTimeSec}s`,
        durationFormatted: `${durationSec} seconds`,
      };

      currentStart = endTimeSec;
      return timing;
    });
  }
}
