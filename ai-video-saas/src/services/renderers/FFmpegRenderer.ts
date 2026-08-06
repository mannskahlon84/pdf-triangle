import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { VideoRenderer } from "./VideoRenderer";
import { RenderTimeline } from "@/modules/marketpilot/video-generator/types/generator.types";

/**
 * FFmpeg Video Renderer Provider for MarketPilot AI
 * Uses fluent-ffmpeg and ffmpeg-static to render real MP4 videos from a RenderTimeline.
 */
export class FFmpegRenderer implements VideoRenderer {
  private ffmpeg: any;
  private isAvailable: boolean = false;
  private outputDir: string;
  private cacheDir: string;

  constructor() {
    this.outputDir = path.join(process.cwd(), "public", "renders");
    this.cacheDir = path.join(process.cwd(), "public", "renders", "cache");
    this.checkEnvironment();
  }

  /**
   * Checks whether ffmpeg binary and fluent-ffmpeg library are installed and available.
   */
  public checkEnvironment(): boolean {
    try {
      // Lazy load fluent-ffmpeg and ffmpeg-static to prevent crash if missing in build
      const ffmpegLib = require("fluent-ffmpeg");
      let ffmpegPath: string | null = null;
      try {
        ffmpegPath = require("ffmpeg-static");
      } catch (e) {
        // Fallback to system PATH if ffmpeg-static is not available
      }

      this.ffmpeg = ffmpegLib;
      if (ffmpegPath) {
        let resolvedPath = ffmpegPath;
        if (!fs.existsSync(resolvedPath)) {
          const ext = process.platform === "win32" ? ".exe" : "";
          const candidate = path.join(
            process.cwd(),
            "node_modules",
            "ffmpeg-static",
            `ffmpeg${ext}`
          );
          if (fs.existsSync(candidate)) {
            resolvedPath = candidate;
          }
        }
        this.ffmpeg.setFfmpegPath(resolvedPath);
      }

      // Ensure storage directories exist
      if (!fs.existsSync(this.outputDir)) {
        fs.mkdirSync(this.outputDir, { recursive: true });
      }
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }

      this.isAvailable = true;
      return true;
    } catch (error) {
      console.warn(
        "[FFmpegRenderer] Environment check failed. FFmpeg or fluent-ffmpeg missing:",
        error
      );
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Renders an MP4 video from the provided MarketPilot RenderTimeline.
   */
  public async render(
    timeline: RenderTimeline
  ): Promise<{ outputUrl: string; duration: number }> {
    if (!this.isAvailable) {
      this.checkEnvironment();
      if (!this.isAvailable) {
        throw new Error(
          "[FFmpegRenderer] Cannot render: fluent-ffmpeg or ffmpeg-static is not available."
        );
      }
    }

    const durationSec =
      parseInt(timeline.duration.replace(/[^0-9]/g, ""), 10) || 30;
    const outputFilename = `render_${timeline.id.replace(/[^a-zA-Z0-9_-]/g, "_")}_${Date.now()}.mp4`;
    const outputPath = path.join(this.outputDir, outputFilename);
    const publicUrl = `/renders/${outputFilename}`;

    // Ensure assets are downloaded/accessible locally
    // Ensure assets are downloaded/accessible locally
    const downloadedScenes = await Promise.all(
      timeline.scenes.map(async (scene, idx) => {
        const bgPath = await this.downloadAssetIfNeeded(
          scene.backgroundImageUrl,
          `scene_${idx}_bg.jpg`
        );
        const prodPath = scene.productImageUrl
          ? await this.downloadAssetIfNeeded(
              scene.productImageUrl,
              `scene_${idx}_prod.png`
            )
          : null;
        const supportingPaths =
          scene.supportingVisualUrls && scene.supportingVisualUrls.length > 0
            ? await Promise.all(
                scene.supportingVisualUrls.map((url, sIdx) =>
                  this.downloadAssetIfNeeded(url, `scene_${idx}_sup_${sIdx}.jpg`)
                )
              )
            : [];
        return {
          ...scene,
          localBgPath: bgPath,
          localProdPath: prodPath,
          localSupportingPaths: supportingPaths,
        };
      })
    );

    const localAudioPath = await this.downloadAssetIfNeeded(
      timeline.audioTrack.masterAudioUrl,
      `audio_${timeline.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.mp3`
    );

    // Render using fluent-ffmpeg
    await this.executeFFmpegPipeline(
      downloadedScenes,
      localAudioPath,
      outputPath,
      durationSec,
      timeline
    );

    // In production, an S3 / R2 upload layer would be triggered here:
    // const cloudUrl = await CloudStorage.uploadFile(outputPath, `renders/${outputFilename}`);
    // return { outputUrl: cloudUrl, duration: durationSec };

    return {
      outputUrl: publicUrl,
      duration: durationSec,
    };
  }

  /**
   * Constructs and executes the fluent-ffmpeg command pipeline.
   */
  private async executeFFmpegPipeline(
    scenes: any[],
    audioPath: string | null,
    outputPath: string,
    totalDuration: number,
    timeline: RenderTimeline
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const command = this.ffmpeg();

        const validScenes = scenes.filter(
          (s) => s.localBgPath && fs.existsSync(s.localBgPath)
        );

        if (validScenes.length === 0) {
          command
            .input("color=c=black:s=1080x1920:d=" + totalDuration)
            .inputFormat("lavfi");
          const filters = [
            "drawtext=text='MarketPilot Video Reel':fontsize=64:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2",
          ];
          command.videoFilters(filters);
          command.outputOptions([
            "-c:v libx264",
            "-pix_fmt yuv420p",
            "-movflags +faststart",
            "-t " + totalDuration,
          ]);
          command
            .output(outputPath)
            .on("end", () => resolve())
            .on("error", (err: any) => {
              this.generateFallbackVideo(outputPath, totalDuration)
                .then(resolve)
                .catch(reject);
            });
          command.run();
          return;
        }

        // Calculate duration for each scene so sum equals totalDuration
        const baseDur = Math.floor(totalDuration / validScenes.length);
        const sceneDurations = validScenes.map((_, i) =>
          i === validScenes.length - 1
            ? totalDuration - baseDur * (validScenes.length - 1)
            : baseDur
        );

        let inputIdx = 0;
        const sceneInputMeta: Array<{
          bgIdx: number;
          prodIdx: number | null;
        }> = [];

        // 1. Register all inputs to command with proper looping duration
        validScenes.forEach((scene, idx) => {
          const bgIdx = inputIdx++;
          command.input(scene.localBgPath).loop(sceneDurations[idx]);

          let prodIdx: number | null = null;
          if (scene.localProdPath && fs.existsSync(scene.localProdPath)) {
            prodIdx = inputIdx++;
            command.input(scene.localProdPath).loop(sceneDurations[idx]);
          }
          sceneInputMeta.push({ bgIdx, prodIdx });
        });

        // Add audio track if present (looping short demo audio to cover full video duration)
        let audioInputIdx: number | null = null;
        if (audioPath && fs.existsSync(audioPath)) {
          audioInputIdx = inputIdx++;
          command.input(audioPath).inputOptions(["-stream_loop", "-1"]);
        }

        const isVertical = timeline.aspectRatio === "9:16";
        const width = isVertical ? 1080 : 1920;
        const height = isVertical ? 1920 : 1080;

        const filterChains: string[] = [];
        const concatLabels: string[] = [];

        // 2. Build per-scene filter chains (aspect ratio, product overlay, text, transition, duration trimming)
        validScenes.forEach((scene, idx) => {
          const { bgIdx, prodIdx } = sceneInputMeta[idx];
          const sceneDur = sceneDurations[idx];

          let currLabel = `v_bg_${idx}`;
          // Scale & crop to exact aspect ratio (1080x1920) without black bars
          filterChains.push(
            `[${bgIdx}:v]scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1[${currLabel}]`
          );

          // Overlay product image in center if present
          if (prodIdx !== null) {
            const prodLabel = `v_prod_${idx}`;
            filterChains.push(`[${prodIdx}:v]scale=600:-1[prod_scaled_${idx}]`);
            filterChains.push(
              `[${currLabel}][prod_scaled_${idx}]overlay=(W-w)/2:(H-h)/2-80[${prodLabel}]`
            );
            currLabel = prodLabel;
          }

          // Draw scene Hook / Title text overlay at the top (y=220)
          if (scene.textOverlay) {
            const safeText = scene.textOverlay
              .replace(/['":\\]/g, "")
              .trim()
              .substring(0, 45);
            const txtLabel = `v_txt_${idx}`;
            filterChains.push(
              `[${currLabel}]drawtext=text='${safeText}':fontsize=64:fontcolor=white:box=1:boxcolor=black@0.75:boxborderw=20:x=(w-text_w)/2:y=220[${txtLabel}]`
            );
            currLabel = txtLabel;
          }

          // Draw scene caption / voiceover text at the bottom (y=h-380)
          const captionObj =
            timeline.captions?.find(
              (c) => c.sceneNumber === scene.sceneNumber
            ) || timeline.captions?.[idx];
          const captionText = captionObj?.text || scene.voiceText;
          if (captionText) {
            const safeCaption = captionText
              .replace(/['":\\]/g, "")
              .trim()
              .substring(0, 55);
            const capLabel = `v_cap_${idx}`;
            filterChains.push(
              `[${currLabel}]drawtext=text='${safeCaption}':fontsize=54:fontcolor=yellow:box=1:boxcolor=black@0.85:boxborderw=18:x=(w-text_w)/2:y=h-380[${capLabel}]`
            );
            currLabel = capLabel;
          }

          // Trim stream to exact scene duration and standardize to 25 fps
          const finalSceneLabel = `v_scene_${idx}`;
          let fadeFilter = "";
          if (
            idx > 0 &&
            (scene.transition === "fade" ||
              scene.transition === "crossfade" ||
              scene.transition === "dissolve")
          ) {
            fadeFilter = `,fade=t=in:st=0:d=0.3`;
          }
          if (
            idx < validScenes.length - 1 &&
            (scene.transition === "fade" ||
              scene.transition === "crossfade" ||
              scene.transition === "dissolve")
          ) {
            fadeFilter += `,fade=t=out:st=${sceneDur - 0.3}:d=0.3`;
          }

          filterChains.push(
            `[${currLabel}]fps=25,trim=duration=${sceneDur},setpts=PTS-STARTPTS${fadeFilter}[${finalSceneLabel}]`
          );
          concatLabels.push(`[${finalSceneLabel}]`);
        });

        // 3. Concatenate all processed scenes sequentially
        const outLabel = validScenes.length > 1 ? "outv" : "v_scene_0";
        if (validScenes.length > 1) {
          filterChains.push(
            `${concatLabels.join("")}concat=n=${validScenes.length}:v=1:a=0[${outLabel}]`
          );
        }

        command.complexFilter(filterChains, outLabel);

        // 4. Configure output options, mapping video and audio
        const outputOpts = [
          "-c:v libx264",
          "-pix_fmt yuv420p",
          "-movflags +faststart",
          "-t " + totalDuration,
        ];

        if (audioInputIdx !== null) {
          // Note: fluent-ffmpeg automatically maps [outLabel] from complexFilter,
          // so we only map the audio stream explicitly to avoid duplicate filtergraph pad consumption.
          outputOpts.push(`-map ${audioInputIdx}:a`);
          outputOpts.push("-c:a aac");
          outputOpts.push("-b:a 192k");
        }

        command.outputOptions(outputOpts);

        command
          .output(outputPath)
          .on("end", () => {
            resolve();
          })
          .on("error", (err: any, stdout: any, stderr: any) => {
            console.error("[FFmpegRenderer] FFmpeg execution error:", err);
            if (stderr) {
              console.error("[FFmpegRenderer] FFmpeg stderr details:", stderr);
            }
            this.generateFallbackVideo(outputPath, totalDuration)
              .then(resolve)
              .catch(reject);
          });

        command.run();
      } catch (err) {
        console.error("[FFmpegRenderer] Pipeline setup failed:", err);
        this.generateFallbackVideo(outputPath, totalDuration)
          .then(resolve)
          .catch(reject);
      }
    });
  }

  /**
   * Downloads a remote HTTP/HTTPS asset to the local cache directory for FFmpeg input.
   */
  private async downloadAssetIfNeeded(
    url: string | undefined,
    filename: string
  ): Promise<string | null> {
    if (!url) return null;

    const targetPath = path.join(this.cacheDir, filename);

    if (url.startsWith("data:")) {
      const matches = url.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        try {
          const buffer = Buffer.from(matches[2], "base64");
          fs.writeFileSync(targetPath, buffer);
          return targetPath;
        } catch (err) {
          console.error("[FFmpegRenderer] Failed to write Data URL:", err);
          return null;
        }
      }
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      // Check if it's already a local path
      const localPath = path.join(process.cwd(), "public", url);
      if (fs.existsSync(localPath)) return localPath;
      if (fs.existsSync(url)) return url;
      return null;
    }

    if (fs.existsSync(targetPath)) {
      return targetPath;
    }

    const downloadWithRedirects = (currentUrl: string, depth = 0): Promise<string | null> => {
      if (depth > 5) return Promise.resolve(null);
      return new Promise((resolve) => {
        const proto = currentUrl.startsWith("https") ? https : http;
        proto
          .get(currentUrl, { timeout: 10000 }, (res) => {
            if (
              res.statusCode &&
              [301, 302, 303, 307, 308].includes(res.statusCode) &&
              res.headers.location
            ) {
              resolve(downloadWithRedirects(res.headers.location, depth + 1));
              return;
            }
            if (res.statusCode !== 200) {
              resolve(null);
              return;
            }
            const fileStream = fs.createWriteStream(targetPath);
            res.pipe(fileStream);
            fileStream.on("finish", () => {
              fileStream.close();
              resolve(targetPath);
            });
            fileStream.on("error", () => {
              resolve(null);
            });
          })
          .on("error", () => {
            resolve(null);
          });
      });
    };

    return downloadWithRedirects(url);
  }

  /**
   * Fallback generator ensuring a valid MP4 file is always created if input codecs fail.
   */
  private async generateFallbackVideo(
    outputPath: string,
    durationSec: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const command = this.ffmpeg();
        command
          .input("color=c=black:s=1080x1920:d=" + durationSec)
          .inputFormat("lavfi")
          .outputOptions([
            "-c:v libx264",
            "-pix_fmt yuv420p",
            "-movflags +faststart",
            "-t " + durationSec,
          ])
          .output(outputPath)
          .on("end", () => resolve())
          .on("error", (err: any) => reject(err));
        command.run();
      } catch (err) {
        reject(err);
      }
    });
  }
}
