import { RenderTimeline, MarketPilotVideoResult } from "./types/generator.types";

export class VideoExporter {
  /**
   * Formats SRT Subtitle file from word-level or scene-level caption timestamps
   */
  public static exportSRT(timeline: RenderTimeline): string {
    return timeline.captions
      .map((cap, idx) => {
        const index = idx + 1;
        const start = this.formatSRTTime(cap.startTime);
        const end = this.formatSRTTime(cap.endTime);
        return `${index}\n${start} --> ${end}\n${cap.text}\n`;
      })
      .join("\n");
  }

  /**
   * Helper to format MM:SS or S seconds to SRT HH:MM:SS,mmm
   */
  private static formatSRTTime(timeStr: string): string {
    const parts = timeStr.split(":");
    let sec = 0;
    if (parts.length === 2) {
      sec = parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
    } else {
      sec = parseFloat(timeStr) || 0;
    }

    const hh = Math.floor(sec / 3600);
    const mm = Math.floor((sec % 3600) / 60);
    const ss = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 1000);

    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
  }

  /**
   * Generates a sharable preview bundle for social media
   */
  public static createExportBundle(result: MarketPilotVideoResult): {
    videoId: string;
    videoUrl: string;
    srtContent: string;
    duration: string;
    aspectRatio: string;
  } {
    return {
      videoId: result.videoId,
      videoUrl: result.previewUrl,
      srtContent: result.timeline ? this.exportSRT(result.timeline) : "",
      duration: result.timeline?.duration || "30s",
      aspectRatio: result.timeline?.aspectRatio || "9:16",
    };
  }
}
