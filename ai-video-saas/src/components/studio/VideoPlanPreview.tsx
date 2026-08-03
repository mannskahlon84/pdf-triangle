"use client";

import React, { useState } from "react";
import { VideoPlan, VideoScene } from "@/modules/marketpilot/video-planner/types/planner.types";
import {
  Film,
  Clock,
  Sparkles,
  Play,
  Volume2,
  Copy,
  Check,
  Layers,
  ArrowRight,
  Eye,
  Camera,
  Wand2,
  Share2,
} from "lucide-react";

interface VideoPlanPreviewProps {
  plan: VideoPlan;
  onGenerateVideo?: (plan: VideoPlan) => void;
  onBack?: () => void;
}

export default function VideoPlanPreview({
  plan,
  onGenerateVideo,
  onBack,
}: VideoPlanPreviewProps) {
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(plan.voiceScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const getPurposeColor = (purpose: string) => {
    switch (purpose.toLowerCase()) {
      case "hook":
        return "bg-indigo-600/10 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800";
      case "problem":
        return "bg-rose-600/10 text-rose-700 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800";
      case "solution":
      case "showcase":
        return "bg-blue-600/10 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800";
      case "benefit":
      case "social_proof":
        return "bg-emerald-600/10 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800";
      case "cta":
        return "bg-amber-600/10 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800";
      default:
        return "bg-slate-600/10 text-slate-700 border-slate-200 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800";
    }
  };

  const getPurposeBarColor = (purpose: string) => {
    switch (purpose.toLowerCase()) {
      case "hook":
        return "from-indigo-500 to-violet-500";
      case "problem":
        return "from-rose-500 to-red-500";
      case "solution":
      case "showcase":
        return "from-blue-500 to-cyan-500";
      case "benefit":
      case "social_proof":
        return "from-emerald-500 to-teal-500";
      case "cta":
        return "from-amber-500 to-orange-500";
      default:
        return "from-slate-500 to-gray-500";
    }
  };

  return (
    <div className="w-full space-y-8 animate-fadeIn">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white shadow-xl border border-indigo-500/30">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Phase 2: AI Video Scene Planner
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-300">
              <Clock className="w-3 h-3" />
              {plan.duration}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-slate-300">
              {plan.aspectRatio} Aspect Ratio
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{plan.title}</h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Complete scene-by-scene production blueprint bridging campaign strategy to hybrid video rendering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition border border-white/10"
            >
              Back to Campaign
            </button>
          )}
          {onGenerateVideo && (
            <button
              onClick={() => onGenerateVideo(plan)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition shadow-lg shadow-indigo-500/25"
            >
              <Play className="w-4 h-4 fill-current" />
              Render Hybrid Video (Phase 3)
            </button>
          )}
        </div>
      </div>

      {/* 1. VISUAL TIMELINE BAR */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Production Timeline ({plan.scenes.length} Scenes)
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Total Duration: {plan.duration}
          </span>
        </div>

        {/* Proportional Timeline Bar */}
        <div className="relative flex h-11 w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 p-1 gap-1 border border-slate-200 dark:border-slate-700">
          {plan.scenes.map((scene, idx) => {
            const startSec = parseFloat(scene.startTime);
            const endSec = parseFloat(scene.endTime);
            const durationSec = endSec - startSec;
            const totalSec = plan.duration === "15s" ? 15 : plan.duration === "60s" ? 60 : 30;
            const widthPct = Math.max((durationSec / totalSec) * 100, 10);
            const isActive = activeSceneIndex === idx;

            return (
              <button
                key={scene.sceneNumber}
                onClick={() => setActiveSceneIndex(idx)}
                style={{ width: `${widthPct}%` }}
                className={`group relative flex flex-col justify-center items-center rounded-lg px-2 text-xs font-semibold text-white transition-all overflow-hidden bg-gradient-to-r ${getPurposeBarColor(
                  scene.purpose
                )} ${
                  isActive
                    ? "ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-md scale-[1.01] z-10"
                    : "opacity-80 hover:opacity-100"
                }`}
                title={`Scene ${scene.sceneNumber}: ${scene.purpose.toUpperCase()} (${scene.duration})`}
              >
                <span className="truncate w-full text-center">
                  S{scene.sceneNumber}: {scene.purpose.toUpperCase()}
                </span>
                <span className="text-[10px] opacity-90 font-normal">
                  {scene.startTime} - {scene.endTime}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scene Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {plan.scenes.map((scene, idx) => (
            <button
              key={scene.sceneNumber}
              onClick={() => setActiveSceneIndex(idx)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                activeSceneIndex === idx
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Scene {scene.sceneNumber}: {scene.purpose.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SCENE CARDS (Detailed View of Active Scene) */}
      {plan.scenes[activeSceneIndex] && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500 text-white font-bold text-base shadow">
                {plan.scenes[activeSceneIndex].sceneNumber}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                    Scene {plan.scenes[activeSceneIndex].sceneNumber} Breakdown
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border uppercase ${getPurposeColor(
                      plan.scenes[activeSceneIndex].purpose
                    )}`}
                  >
                    {plan.scenes[activeSceneIndex].purpose}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Timestamps: {plan.scenes[activeSceneIndex].startTime} →{" "}
                  {plan.scenes[activeSceneIndex].endTime} ({plan.scenes[activeSceneIndex].duration})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Transition: <strong className="text-indigo-600 dark:text-indigo-400">{plan.scenes[activeSceneIndex].transition}</strong>
              </span>
              <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Animation: <strong className="text-indigo-600 dark:text-indigo-400">{plan.scenes[activeSceneIndex].animationStyle}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Voiceover & Text Overlay */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    Voiceover Script
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 italic">
                  &ldquo;{plan.scenes[activeSceneIndex].voiceText}&rdquo;
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  On-Screen Text Overlay (Title Card)
                </span>
                <p className="text-sm font-bold text-slate-900 dark:text-white px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  {plan.scenes[activeSceneIndex].textOverlay}
                </p>
              </div>

              {plan.scenes[activeSceneIndex].cta && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Call To Action (End Badge)
                  </span>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    {plan.scenes[activeSceneIndex].cta}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Visual Prompts & Camera Direction */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5" />
                  Visual Direction & Camera Guidance
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {plan.scenes[activeSceneIndex].visualDescription}
                </p>
              </div>

              {/* Image Prompt */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                    AI Image Generation Prompt
                  </span>
                  <button
                    onClick={() =>
                      handleCopyPrompt(
                        `img-${plan.scenes[activeSceneIndex].sceneNumber}`,
                        plan.scenes[activeSceneIndex].imagePrompt
                      )
                    }
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {copiedPromptId === `img-${plan.scenes[activeSceneIndex].sceneNumber}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Prompt
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
                  {plan.scenes[activeSceneIndex].imagePrompt}
                </p>
              </div>

              {/* Video Prompt */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-3.5 h-3.5 text-purple-500" />
                    AI Video Motion Prompt
                  </span>
                  <button
                    onClick={() =>
                      handleCopyPrompt(
                        `vid-${plan.scenes[activeSceneIndex].sceneNumber}`,
                        plan.scenes[activeSceneIndex].videoPrompt
                      )
                    }
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    {copiedPromptId === `vid-${plan.scenes[activeSceneIndex].sceneNumber}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Prompt
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 leading-relaxed">
                  {plan.scenes[activeSceneIndex].videoPrompt}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. VOICE SCRIPT & ASSET OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Voiceover Script Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-500" />
              Full Integrated Voiceover Script (TTS Ready)
            </h3>
            <button
              onClick={handleCopyScript}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
            >
              {copiedScript ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied Script
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Full Script
                </>
              )}
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">
              &ldquo;{plan.voiceScript}&rdquo;
            </p>
          </div>
        </div>

        {/* Social Caption & Metadata */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-500" />
            Social Reel Caption & Hashtags
          </h3>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {plan.caption}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {plan.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
