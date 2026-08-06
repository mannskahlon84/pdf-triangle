"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Film,
  Sparkles,
  Volume2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Download,
  Share2,
  ChevronRight,
  ArrowLeft,
  Video,
  Layers,
  FileText,
} from "lucide-react";
import { VideoPlan } from "@/modules/marketpilot/video-planner/types/planner.types";
import {
  RenderProgressState,
  MarketPilotVideoResult,
  RenderTimeline,
} from "@/modules/marketpilot/video-generator/types/generator.types";
import { HybridVideoPlayer } from "./HybridVideoPlayer";
import { VideoExporter } from "@/modules/marketpilot/video-generator/videoExporter";
import { toast } from "sonner";

interface VideoCreationStudioProps {
  videoPlan: VideoPlan;
  onBack?: () => void;
  onSendToCampaignManager?: () => void;
}

const STEP_LABELS: { state: RenderProgressState; label: string; icon: any }[] = [
  { state: "CREATING_PLAN", label: "1. Plan Review", icon: FileText },
  { state: "GENERATING_ASSETS", label: "2. Generate Assets", icon: Layers },
  { state: "GENERATING_VOICE", label: "3. Generate Voice", icon: Volume2 },
  { state: "RENDERING_VIDEO", label: "4. Render Video", icon: Film },
  { state: "COMPLETED", label: "5. Final Reel Preview", icon: Sparkles },
];

export default function VideoCreationStudio({
  videoPlan,
  onBack,
  onSendToCampaignManager,
}: VideoCreationStudioProps) {
  const [currentStatus, setCurrentStatus] =
    useState<RenderProgressState>("CREATING_PLAN");
  const [ttsProvider, setTtsProvider] = useState<string>("ElevenLabs");
  const [result, setResult] = useState<MarketPilotVideoResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trigger Phase 3 API generation pipeline
  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setCurrentStatus("GENERATING_ASSETS");

    try {
      const res = await fetch("/api/marketpilot/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoPlan,
          ttsProvider,
          simulateAsync: true,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.error || "Failed to start video generation pipeline"
        );
      }

      const data: MarketPilotVideoResult = await res.json();
      setResult(data);

      // Simulate status progression visually over 3.5s to match backend async delays
      setTimeout(() => setCurrentStatus("GENERATING_VOICE"), 700);
      setTimeout(() => setCurrentStatus("RENDERING_VIDEO"), 1600);
      setTimeout(() => {
        setCurrentStatus("COMPLETED");
        setIsGenerating(false);
        toast.success("MarketPilot Social Reel Rendered Successfully!");
      }, 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Video generation failed.");
      setCurrentStatus("FAILED");
      setIsGenerating(false);
      toast.error("Video Generation Failed");
    }
  };

  const getStepIndex = (state: RenderProgressState): number => {
    switch (state) {
      case "CREATING_PLAN":
        return 0;
      case "GENERATING_ASSETS":
        return 1;
      case "GENERATING_VOICE":
        return 2;
      case "RENDERING_VIDEO":
        return 3;
      case "COMPLETED":
        return 4;
      case "FAILED":
        return -1;
    }
  };

  const activeStepIdx = getStepIndex(currentStatus);

  const downloadSRT = () => {
    if (!result?.timeline) return;
    const srtText = VideoExporter.exportSRT(result.timeline);
    const blob = new Blob([srtText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${videoPlan.title.replace(/\s+/g, "_")}_subtitles.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("SRT Subtitles Downloaded!");
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Bar with Back button & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Back to Scene Plan"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Phase 3 Engine
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {videoPlan.aspectRatio} Vertical Reel • {videoPlan.duration}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
              {videoPlan.title} — Hybrid Production Studio
            </h1>
          </div>
        </div>

        {currentStatus === "CREATING_PLAN" && (
          <div className="flex items-center gap-3">
            <select
              value={ttsProvider}
              onChange={(e) => setTtsProvider(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              <option value="ElevenLabs">ElevenLabs Synthetic Voice</option>
              <option value="Google Neural">Google Neural TTS</option>
              <option value="OpenAI TTS">OpenAI TTS Engine</option>
            </select>
            <button
              onClick={handleStartGeneration}
              disabled={isGenerating}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Start Hybrid Production
            </button>
          </div>
        )}
      </div>

      {/* STEP PROGRESS BAR */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {STEP_LABELS.map((step, idx) => {
            const IconComponent = step.icon;
            const isDone = activeStepIdx > idx || currentStatus === "COMPLETED";
            const isCurrent = activeStepIdx === idx;

            return (
              <div
                key={step.state}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                    : isDone
                    ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? "bg-indigo-600 text-white shadow-sm"
                      : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {isDone && !isCurrent ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent && isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <IconComponent className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{step.label}</p>
                  <p className="text-[10px] opacity-75">
                    {isCurrent && isGenerating
                      ? "In Progress..."
                      : isDone
                      ? "Completed"
                      : "Waiting..."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ERROR DISPLAY */}
      {currentStatus === "FAILED" && (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center gap-4">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <h3 className="font-bold text-base">Production Pipeline Error</h3>
            <p className="text-sm mt-1">{errorMsg || "An error occurred."}</p>
          </div>
          <button
            onClick={handleStartGeneration}
            className="ml-auto px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-500 transition"
          >
            Retry Production
          </button>
        </div>
      )}

      {/* STEP 1: CREATING_PLAN — REVIEW VIEW */}
      {currentStatus === "CREATING_PLAN" && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20 border border-indigo-100 dark:border-slate-800 shadow-md">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 mb-2">
              <Film className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Ready to Produce: {videoPlan.title}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-xl mx-auto">
              MarketPilot AI will now orchestrate the Image Generation Router,
              TTS Voice Engine ({ttsProvider}), and our Hybrid Video Compositor
              to synthesize your {videoPlan.duration} reel.
            </p>

            {/* Quick Scenes summary table */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
              {videoPlan.scenes.slice(0, 3).map((scene, idx) => (
                <div
                  key={scene.sceneNumber}
                  className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    <span>Scene {scene.sceneNumber}</span>
                    <span>{scene.purpose.toUpperCase()}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                    &ldquo;{scene.voiceText}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <button
                onClick={handleStartGeneration}
                className="px-8 py-3.5 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 transition-all shadow-lg hover:shadow-indigo-500/25 inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Start AI Video Synthesis Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEPS 2, 3, 4: GENERATION IN PROGRESS */}
      {(currentStatus === "GENERATING_ASSETS" ||
        currentStatus === "GENERATING_VOICE" ||
        currentStatus === "RENDERING_VIDEO") && (
        <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md text-center space-y-8">
          <div className="relative inline-flex items-center justify-center w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {currentStatus === "GENERATING_ASSETS" &&
                "Synthesizing High-Fidelity Scene Assets..."}
              {currentStatus === "GENERATING_VOICE" &&
                `Synthesizing Voice Track (${ttsProvider})...`}
              {currentStatus === "RENDERING_VIDEO" &&
                "Compositing Hybrid Avatar & Workplace Footage..."}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Orchestrating MarketPilot Render Adapter with Zero-Glitch Avatar
              Lock & Word-Level Karaoke Subtitles.
            </p>
          </div>

          {/* Live pipeline cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
            {videoPlan.scenes.slice(0, 3).map((scene) => (
              <div
                key={scene.sceneNumber}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2 animate-pulse"
              >
                <div className="flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Scene {scene.sceneNumber}</span>
                  <span>{scene.duration}</span>
                </div>
                <div className="w-full h-24 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-500 dark:text-slate-400">
                  {currentStatus === "GENERATING_ASSETS"
                    ? "Generating Visual Asset..."
                    : "Asset Ready ✓"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: COMPLETED — EMBED EXISTING HYBRID VIDEO PLAYER */}
      {currentStatus === "COMPLETED" && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-emerald-900 dark:text-emerald-200">
                  MarketPilot Hybrid Reel Ready for Social Publishing!
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Rendered via MarketPilot Render Adapter with {ttsProvider} TTS
                  & Word-Level Captions.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={downloadSRT}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                Download SRT
              </button>
              {onSendToCampaignManager && (
                <button
                  onClick={onSendToCampaignManager}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Send to Campaign Manager</span>
                </button>
              )}
            </div>
          </div>

          {/* Embed Existing HybridVideoPlayer */}
          <HybridVideoPlayer onBackToStudio={() => {}} />
        </div>
      )}
    </div>
  );
}
