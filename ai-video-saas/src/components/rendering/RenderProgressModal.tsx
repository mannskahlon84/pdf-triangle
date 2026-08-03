"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  Sparkles,
  CheckCircle2,
  Video,
  ShieldCheck,
  Cpu,
  Layers,
  Wand2,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";

interface RenderProgressModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "Multimodal Vision Analysis & Timestamp Extraction",
    subtitle: "Detecting workplace actions, safety gear & OCR text tags...",
    progressEnd: 25,
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: "Script Synthesis & Session Context Memory",
    subtitle: "Generating hook & voiceover cadence without repetition...",
    progressEnd: 60,
    icon: Wand2,
  },
  {
    id: 3,
    title: "Hybrid Compositing (PiP & Alternating Cuts Engine)",
    subtitle: "Rendering AI persona lip-sync over raw work footage...",
    progressEnd: 90,
    icon: Layers,
  },
  {
    id: 4,
    title: "Finalizing MP4 Reel & Subtitle Watermarking",
    subtitle: "Applying brand logo overlay and karaoke subtitle tracks...",
    progressEnd: 100,
    icon: CheckCircle2,
  },
];

export const RenderProgressModal: React.FC<RenderProgressModalProps> = ({
  isOpen,
  onComplete,
  onClose,
}) => {
  const {
    renderProgress,
    setRenderProgress,
    renderStepText,
    setRenderStepText,
    selectedMedia,
    activeBrandId,
    brands,
    compositorMode,
  } = useAppStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const activeBrand =
    brands.find((b) => b.id === activeBrandId) || brands[0];

  useEffect(() => {
    if (!isOpen) {
      setRenderProgress(0);
      setCurrentStepIndex(0);
      return;
    }

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setRenderProgress(progress);

      if (progress <= 25) {
        setCurrentStepIndex(0);
        setRenderStepText(
          "Analyzing workplace video timestamps (0:02 Safety Gear, 0:08 Precision Assembly)..."
        );
      } else if (progress <= 60) {
        setCurrentStepIndex(1);
        setRenderStepText(
          "Synthesizing corporate persona audio & synchronizing subtitle timing..."
        );
      } else if (progress <= 90) {
        setCurrentStepIndex(2);
        setRenderStepText(
          `Compositing ${
            compositorMode === "pip"
              ? "Picture-in-Picture Avatar"
              : "Alternating Cuts Hook ➔ Footage ➔ CTA"
          } layout...`
        );
      } else {
        setCurrentStepIndex(3);
        setRenderStepText(
          `Adding ${activeBrand.name} logo watermark & 1080p MP4 final encoding...`
        );
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
          onComplete();
        }, 600);
      }
    }, 70);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-900/85 backdrop-blur-lg">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-700/80 bg-obsidian-900/95 p-8 shadow-2xl ring-1 ring-white/10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Cpu className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Market Pilot AI Hybrid Rendering Engine
              </h3>
              <p className="text-xs text-slate-400">
                Mode:{" "}
                <span className="text-indigo-400 font-bold uppercase">
                  {compositorMode === "pip"
                    ? "Picture-in-Picture (PiP)"
                    : "Alternating Cuts"}
                </span>{" "}
                · Target: 1080p 60fps MP4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar & Current Percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-indigo-400">{renderStepText}</span>
            <span className="text-white">{Math.min(renderProgress, 100)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-950 p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-100 ease-out"
              style={{ width: `${Math.min(renderProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* 4 Asynchronous Progress Steps */}
        <div className="space-y-3 pt-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.id}
                className={`flex items-center space-x-3 rounded-2xl border p-3.5 transition-all ${
                  isCurrent
                    ? "border-indigo-500/80 bg-indigo-500/10 shadow-md ring-1 ring-indigo-500/30"
                    : isCompleted
                    ? "border-slate-800 bg-slate-900/40 opacity-75"
                    : "border-slate-800/50 bg-slate-900/20 opacity-40"
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-indigo-500 text-white animate-bounce"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white truncate">
                      {step.title}
                    </p>
                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-400">
                        100% DONE
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-indigo-400 animate-pulse">
                        PROCESSING...
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {step.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info banner */}
        <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-3 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Simulated Backend Engine: Zero latency demo pipeline</span>
          </span>
          <span className="text-white font-semibold">
            Persona: {activeBrand.defaultAvatarName.split(" - ")[0]}
          </span>
        </div>
      </div>
    </div>
  );
};
