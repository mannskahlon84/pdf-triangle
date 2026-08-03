"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  Layers,
  Film,
  Sparkles,
  PlaySquare,
  SplitSquareVertical,
  Clock,
  Maximize2,
  Wand2,
} from "lucide-react";

interface CompositorModeSelectorProps {
  onTriggerRender: () => void;
}

const QUICK_PROMPTS = [
  "Emphasize OSHA safety standards & zero-accident certification shown in video",
  "High-energy recruiting hook for senior robotics engineers with 48h placement",
  "Spotlight elite automated warehouse precision and inventory tracking accuracy",
  "Boutique fitness membership flash sale: functional cardio conditioning CTA",
];

export const CompositorModeSelector: React.FC<CompositorModeSelectorProps> = ({
  onTriggerRender,
}) => {
  const {
    compositorMode,
    setCompositorMode,
    videoLength,
    setVideoLength,
    aspectRatio,
    setAspectRatio,
    promptText,
    setPromptText,
    selectedMedia,
    activeBrandId,
    brands,
  } = useAppStore();

  const activeBrand =
    brands.find((b) => b.id === activeBrandId) || brands[0];

  return (
    <div className="space-y-6">
      {/* Smart Hybrid Video Compositor Mode Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>Smart Hybrid Video Compositor Engine</span>
          </span>
          <span className="text-[10px] font-semibold text-indigo-400">
            2 Layout Modes
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Picture-in-Picture (PiP) Mode */}
          <div
            onClick={() => setCompositorMode("pip")}
            className={`flex items-start space-x-3 rounded-2xl border p-4 cursor-pointer transition-all ${
              compositorMode === "pip"
                ? "border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-sm"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                compositorMode === "pip"
                  ? "border-indigo-200 bg-indigo-100 text-indigo-700"
                  : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
            >
              <PlaySquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-xs font-bold text-slate-900">
                  Picture-in-Picture (PiP)
                </p>
                {compositorMode === "pip" && (
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 border border-indigo-200">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                AI Human Avatar talks continuously in corner while raw workplace
                video plays as main background.
              </p>
            </div>
          </div>

          {/* Alternating Cuts Mode */}
          <div
            onClick={() => setCompositorMode("alternating")}
            className={`flex items-start space-x-3 rounded-2xl border p-4 cursor-pointer transition-all ${
              compositorMode === "alternating"
                ? "border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-sm"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                compositorMode === "alternating"
                  ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                  : "border-slate-200 bg-slate-100 text-slate-500"
              }`}
            >
              <SplitSquareVertical className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-xs font-bold text-slate-900">
                  Alternating Cuts (Full-Screen B-Roll)
                </p>
                {compositorMode === "alternating" && (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                0-5s Intro Avatar → 5-22s Full Workplace Video Showcase → 22-30s
                CTA End Screen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zero-Glitch Video Pipeline Architecture Safeguard Badge */}
      <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-emerald-950/60 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-white">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            <span>Zero-Glitch Video Pipeline Architecture</span>
          </span>
          <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
            ANTI-ARTIFACT ENGINE ACTIVE
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-2.5">
            <p className="text-[10px] font-bold text-indigo-300">1. Fixed-Anchor Avatars</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Locked eye contact & audio-driven lip-sync without drift or facial warping.
            </p>
          </div>
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-2.5">
            <p className="text-[10px] font-bold text-emerald-300">2. Zero AI Body Parts</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              No text-to-video hands/limbs. Uses real uploaded workplace B-roll footage.
            </p>
          </div>
          <div className="rounded-xl bg-slate-950/70 border border-slate-800 p-2.5">
            <p className="text-[10px] font-bold text-cyan-300">3. Hybrid 3-Clip Layout</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              0–5s Avatar Intro ➔ 5–22s Raw Workplace B-Roll ➔ 22–30s Avatar CTA.
            </p>
          </div>
        </div>
      </div>

      {/* Video Length & Aspect Ratio Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Video Length */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5 mb-2">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Target Video Length</span>
          </label>
          <div className="flex items-center space-x-2">
            {(["15s", "30s", "60s"] as const).map((len) => {
              const isSelected = videoLength === len;
              return (
                <button
                  key={len}
                  onClick={() => setVideoLength(len)}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20"
                      : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                  }`}
                >
                  {len} {len === "15s" && "(Shorts/Reels)"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5 mb-2">
            <Maximize2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Aspect Ratio & Platform Target</span>
          </label>
          <div className="flex items-center space-x-2">
            {(
              [
                { ratio: "9:16", label: "Vertical" },
                { ratio: "16:9", label: "Landscape" },
                { ratio: "1:1", label: "Square" },
              ] as const
            ).map((item) => {
              const isSelected = aspectRatio === item.ratio;
              return (
                <button
                  key={item.ratio}
                  onClick={() => setAspectRatio(item.ratio)}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20"
                      : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                  }`}
                >
                  {item.ratio} ({item.label})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multimodal Prompt & Quick Suggestions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Wand2 className="h-3.5 w-3.5 text-indigo-400" />
            <span>AI Script & Marketing Hook Prompt</span>
          </label>
          <span className="text-[10px] font-semibold text-emerald-400">
            Persona: {activeBrand.defaultAvatarName}
          </span>
        </div>

        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={3}
          placeholder="Describe your desired marketing angle, call to action, or workplace highlights to include..."
          className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 p-4 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed shadow-inner"
        />

        {/* Quick Prompts */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Quick Hooks:
          </span>
          {QUICK_PROMPTS.map((qp, i) => (
            <button
              key={i}
              onClick={() => setPromptText(qp)}
              className="rounded-lg border border-slate-800 bg-slate-900/70 px-2.5 py-1 text-[11px] text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-white transition-all truncate max-w-[280px]"
            >
              {qp}
            </button>
          ))}
        </div>
      </div>

      {/* Main Generate CTA Button */}
      <div className="pt-2">
        <button
          onClick={onTriggerRender}
          className="w-full flex items-center justify-center space-x-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-600 to-emerald-500 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-500/25 hover:from-indigo-600 hover:via-violet-700 hover:to-emerald-600 transition-all active:scale-95 border border-white/20"
        >
          <Sparkles className="h-5 w-5 animate-spin-slow" />
          <span>
            Generate Hybrid Reel ({compositorMode === "pip" ? "PiP" : "Alternating"} Mode)
          </span>
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          Simulates OCR/Action analysis, script voiceover synthesis, and avatar
          lip-sync compositing without paid API keys.
        </p>
      </div>
    </div>
  );
};
