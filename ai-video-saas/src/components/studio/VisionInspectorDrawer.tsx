"use client";

import React from "react";
import { useAppStore, KeyframeInsight } from "@/store/useAppStore";
import {
  Eye,
  Clock,
  Sparkles,
  CheckCircle,
  Zap,
  Target,
  ArrowRight,
  ShieldCheck,
  Award,
} from "lucide-react";
import { toast } from "sonner";

interface VisionInspectorDrawerProps {
  onApplyToScript?: (keyframe: KeyframeInsight) => void;
}

export const VisionInspectorDrawer: React.FC<VisionInspectorDrawerProps> = ({
  onApplyToScript,
}) => {
  const {
    selectedMedia,
    activeScrubberTime,
    setActiveScrubberTime,
    setPromptText,
    currentScript,
    setCurrentScript,
  } = useAppStore();

  if (!selectedMedia) return null;

  const handleKeyframeClick = (kf: KeyframeInsight) => {
    setActiveScrubberTime(kf.timestamp);
    toast.info(`Scrubber jumped to ${kf.timestamp}s: ${kf.label}`, {
      description: kf.description,
    });
  };

  const handleApplyKeyframe = (kf: KeyframeInsight) => {
    // Update prompt text and script hook around this keyframe
    const updatedPrompt = `Create a high-energy 15s reel focusing specifically on timestamp ${kf.timestamp}s (${kf.label}): ${kf.valueProp}`;
    setPromptText(updatedPrompt);

    if (currentScript) {
      setCurrentScript({
        ...currentScript,
        title: `${kf.label} Reel (15s)`,
        hook: `Did you know our teams are certified in ${kf.label.toLowerCase()} from day one?`,
        targetKeyframes: [kf.timestamp],
      });
    }

    if (onApplyToScript) {
      onApplyToScript(kf);
    }

    toast.success(`Script synchronized with keyframe ${kf.timestamp}s!`, {
      description: `Hook updated: "Did you know our teams are certified in ${kf.label.toLowerCase()}..."`,
    });
  };

  const totalDuration = selectedMedia.duration || 15;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-600 text-white shadow-lg shadow-indigo-500/20">
            <Eye className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900">
                AI Video Scrubber & Action Detector
              </h3>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                MULTIMODAL VISION 2.0
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Analyzing visual actions in{" "}
              <span className="text-slate-900 font-bold">
                {selectedMedia.title}
              </span>{" "}
              for hybrid video compositing.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-400">
            Active Timestamp:
          </span>
          <span className="rounded-xl bg-slate-800 px-3 py-1 text-xs font-bold text-indigo-400 border border-slate-700">
            {activeScrubberTime.toFixed(1)}s
          </span>
        </div>
      </div>

      {/* Interactive Timeline Scrubber Bar */}
      {selectedMedia.type === "video" && (
        <div className="space-y-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center space-x-1 text-indigo-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Timestamp Action Scrubber</span>
            </span>
            <span>0:00 — 0:{totalDuration}</span>
          </div>

          {/* Timeline Track with Keyframe Markers */}
          <div className="relative h-12 w-full rounded-xl bg-slate-950 border border-slate-800 flex items-center px-4 overflow-hidden">
            {/* Background grid markings */}
            <div className="absolute inset-0 flex justify-between px-6 opacity-20">
              <div className="h-full w-[1px] bg-white" />
              <div className="h-full w-[1px] bg-white" />
              <div className="h-full w-[1px] bg-white" />
              <div className="h-full w-[1px] bg-white" />
            </div>

            {/* Keyframe Badges on Timeline */}
            {selectedMedia.keyframes.map((kf) => {
              const leftPercent = (kf.timestamp / totalDuration) * 100;
              const isSelected = activeScrubberTime === kf.timestamp;
              return (
                <button
                  key={kf.id}
                  onClick={() => handleKeyframeClick(kf)}
                  style={{ left: `${Math.min(Math.max(leftPercent, 5), 92)}%` }}
                  className={`absolute -translate-x-1/2 flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all shadow-md z-10 ${
                    isSelected
                      ? "bg-indigo-500 text-white ring-2 ring-white scale-110 shadow-indigo-500/50"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                  }`}
                  title={kf.label}
                >
                  <Target className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[120px]">
                    {kf.timestamp}s: {kf.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500">
            Click any timestamp marker above to jump the video preview and view
            extracted marketing value propositions.
          </p>
        </div>
      )}

      {/* Extracted Keyframe Action Cards */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Extracted Visual Value Propositions ({selectedMedia.keyframes.length})</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedMedia.keyframes.map((kf) => {
            const isSelected = activeScrubberTime === kf.timestamp;
            return (
              <div
                key={kf.id}
                onClick={() => handleKeyframeClick(kf)}
                className={`group relative rounded-2xl border p-4 transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20"
                    : "border-slate-200 bg-slate-50/60 hover:border-slate-300 hover:bg-white shadow-sm"
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                      {kf.timestamp}s
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {kf.label}
                    </h4>
                  </div>
                  <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-700">
                    <ShieldCheck className="h-3 w-3" />
                    <span>{kf.confidence}% Conf.</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-700 mb-2 leading-relaxed">
                  {kf.description}
                </p>

                {/* AI Extracted Value Prop */}
                <div className="rounded-xl bg-indigo-50/80 p-2.5 border border-indigo-100 mb-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 mb-0.5">
                    Suggested Video Hook / Caption
                  </p>
                  <p className="text-xs font-semibold text-indigo-950">
                    "{kf.valueProp}"
                  </p>
                </div>

                {/* Apply Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyKeyframe(kf);
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-slate-800/90 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all border border-slate-700"
                >
                  <Zap className="h-3.5 w-3.5" />
                  <span>Sync Script & Hybrid Hook to {kf.timestamp}s</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
