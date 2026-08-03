"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore, GeneratedScript, ScheduledPost } from "@/store/useAppStore";
import {
  Play,
  Pause,
  Download,
  Edit3,
  Calendar,
  Share2,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Layers,
  Sparkles,
  UserCheck,
  Tv,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface HybridVideoPlayerProps {
  onSchedulePost?: () => void;
  onBackToStudio: () => void;
}

export const HybridVideoPlayer: React.FC<HybridVideoPlayerProps> = ({
  onSchedulePost,
  onBackToStudio,
}) => {
  const {
    currentScript,
    setCurrentScript,
    selectedMedia,
    activeBrandId,
    brands,
    compositorMode,
    videoLength,
    addScheduledPost,
  } = useAppStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isEditingScript, setIsEditingScript] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Schedule modal state
  const [scheduleCaption, setScheduleCaption] = useState(
    currentScript?.hook ||
      "Check out our latest workplace engineering reel! #Recruiting #TechTalent"
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    "instagram",
    "tiktok",
  ]);
  const [scheduleDate, setScheduleDate] = useState("2026-08-01");
  const [scheduleTime, setScheduleTime] = useState("14:00");

  const videoRef = useRef<HTMLVideoElement>(null);
  const activeBrand =
    brands.find((b) => b.id === activeBrandId) || brands[0];

  const duration = 15; // 15 seconds

  // Handle Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const handleTimeUpdate = () => {
      setCurrentTime(v.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    v.addEventListener("timeupdate", handleTimeUpdate);
    v.addEventListener("ended", handleEnded);
    return () => {
      v.removeEventListener("timeupdate", handleTimeUpdate);
      v.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Determine current active subtitle word
  const activeSegment =
    currentScript?.segments.find(
      (s) => currentTime >= s.start && currentTime <= s.end
    ) || currentScript?.segments[0];

  const words = activeSegment?.text.split(" ") || [];
  const segmentDuration =
    (activeSegment?.end || 5) - (activeSegment?.start || 0);
  const relativeTime = currentTime - (activeSegment?.start || 0);
  const wordIndex = Math.floor(
    (relativeTime / Math.max(segmentDuration, 1)) * words.length
  );

  // Download MP4 Handler
  const handleDownloadMp4 = () => {
    const sampleUrl =
      selectedMedia?.url ||
      "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-a-motherboard-41618-large.mp4";
    const a = document.createElement("a");
    a.href = sampleUrl;
    a.download = `${currentScript?.title || "MarketPilotAI_Hybrid_Reel"}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success("MP4 download started!", {
      description: `Downloading 1080p 60fps video with ${
        compositorMode === "pip" ? "Picture-in-Picture" : "Alternating Cuts"
      } compositing.`,
    });
  };

  // Save Script Inline Edit
  const handleSaveScript = (updatedHook: string, updatedCta: string) => {
    if (currentScript) {
      setCurrentScript({
        ...currentScript,
        hook: updatedHook,
        cta: updatedCta,
        segments: currentScript.segments.map((seg, idx) => {
          if (idx === 0) return { ...seg, text: updatedHook };
          if (idx === currentScript.segments.length - 1)
            return { ...seg, text: updatedCta };
          return seg;
        }),
      });
      toast.success("Script updated inline!", {
        description: "Karaoke subtitles and TTS captions updated in real time.",
      });
    }
    setIsEditingScript(false);
  };

  // Schedule Post Submit
  const handleConfirmSchedule = () => {
    const newPost: ScheduledPost = {
      id: `post-${Date.now()}`,
      title: currentScript?.title || "Multimodal Engineering Reel",
      videoId: `vid-${Date.now()}`,
      thumbnailUrl:
        selectedMedia?.thumbnailUrl ||
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&h=250&fit=crop&q=80",
      caption: scheduleCaption,
      platforms: selectedPlatforms,
      scheduledTime: new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString(),
      status: "scheduled",
      views: 0,
      engagementRate: 0,
      clicks: 0,
      shares: 0,
    };

    addScheduledPost(newPost);
    setIsScheduleModalOpen(false);
    toast.success("Video Scheduled to Social Media Calendar!", {
      description: `Scheduled to post on ${selectedPlatforms
        .map((p) => p.toUpperCase())
        .join(", ")} for ${scheduleDate} at ${scheduleTime}.`,
    });
    if (onSchedulePost) onSchedulePost();
  };

  const togglePlatform = (p: string) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-700/80 bg-obsidian-900/90 p-5 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Tv className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">
                {currentScript?.title || "Hybrid Multimodal Reel"}
              </h3>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
                {compositorMode === "pip" ? "PiP MODE" : "ALTERNATING CUTS"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Brand:{" "}
              <span className="text-white font-bold">{activeBrand.name}</span> ·
              Persona:{" "}
              <span className="text-emerald-400 font-bold">
                {activeBrand.defaultAvatarName}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditingScript(true)}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
            <span>Edit Script & Subtitles</span>
          </button>

          <button
            onClick={handleDownloadMp4}
            className="flex items-center space-x-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Download MP4</span>
          </button>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700 transition-all active:scale-95"
          >
            <Calendar className="h-4 w-4" />
            <span>Schedule to Socials</span>
          </button>
        </div>
      </div>

      {/* Main Hybrid Video Player Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Video Container */}
        <div className="lg:col-span-2 relative aspect-video w-full overflow-hidden rounded-3xl border border-slate-700/80 bg-obsidian-950 shadow-2xl flex flex-col items-center justify-center">
          {selectedMedia?.type === "image" ? (
            <>
              <img
                src={
                  selectedMedia.angles && selectedMedia.angles.length > 0
                    ? selectedMedia.angles[
                        Math.min(
                          selectedMedia.angles.length - 1,
                          Math.floor(
                            (currentTime / (videoLength === "30s" ? 30 : 15)) *
                              selectedMedia.angles.length
                          )
                        )
                      ].url
                    : selectedMedia.url
                }
                alt="Product Angle Showcase"
                className="h-full w-full object-contain bg-obsidian-950 transition-all duration-500"
              />
              {/* Multi-Angle Live Status & Switcher Overlay in Video Session */}
              {selectedMedia.angles && selectedMedia.angles.length > 0 && (
                <div className="absolute top-4 right-4 z-20 flex flex-col items-end space-y-1.5">
                  <span className="flex items-center space-x-1.5 rounded-full bg-indigo-950/90 px-3.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-indigo-500/40 shadow-xl">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      LIVE ANGLE{" "}
                      {Math.min(
                        selectedMedia.angles.length,
                        Math.floor(
                          (currentTime / (videoLength === "30s" ? 30 : 15)) *
                            selectedMedia.angles.length
                        ) + 1
                      )}
                      /{selectedMedia.angles.length}:{" "}
                      {
                        selectedMedia.angles[
                          Math.min(
                            selectedMedia.angles.length - 1,
                            Math.floor(
                              (currentTime / (videoLength === "30s" ? 30 : 15)) *
                                selectedMedia.angles.length
                            )
                          )
                        ].label.split(":")[0]
                      }
                    </span>
                  </span>
                  <div className="flex items-center space-x-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10">
                    {selectedMedia.angles.map((ang, i) => {
                      const activeIdx = Math.min(
                        selectedMedia.angles!.length - 1,
                        Math.floor(
                          (currentTime / (videoLength === "30s" ? 30 : 15)) *
                            selectedMedia.angles!.length
                        )
                      );
                      return (
                        <button
                          key={ang.id}
                          onClick={() => {
                            const segLen =
                              (videoLength === "30s" ? 30 : 15) /
                              selectedMedia.angles!.length;
                            if (videoRef.current) {
                              videoRef.current.currentTime = i * segLen + 0.5;
                            }
                          }}
                          className={`rounded-lg px-2 py-0.5 text-[9px] font-bold transition-all ${
                            activeIdx === i
                              ? "bg-emerald-500 text-black shadow-md"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          }`}
                        >
                          Angle {i + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <video
              ref={videoRef}
              src={
                selectedMedia?.url ||
                "https://assets.mixkit.co/videos/preview/mixkit-technician-working-on-a-motherboard-41618-large.mp4"
              }
              className="h-full w-full object-cover"
              onClick={togglePlay}
              crossOrigin="anonymous"
              playsInline
              muted={isMuted}
            />
          )}

          {/* Picture-in-Picture (PiP) Avatar Speaking Corner */}
          {compositorMode === "pip" && (
            <div className="absolute bottom-14 left-4 z-20 flex items-center space-x-2.5 rounded-2xl border border-white/20 bg-obsidian-900/90 p-2.5 backdrop-blur-xl shadow-2xl max-w-[220px]">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-indigo-500/50">
                <img
                  src={
                    activeBrand.defaultAvatarId === "alex"
                      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80"
                      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80"
                  }
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-black animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] font-bold text-white truncate">
                    {activeBrand.defaultAvatarName.split(" - ")[0]}
                  </span>
                  <span className="rounded bg-indigo-500/20 px-1 py-0.2 text-[8px] font-bold text-indigo-300">
                    AI HOST
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {isPlaying ? "Talking · Lip Syncing" : "Paused"}
                </p>
              </div>
            </div>
          )}

          {/* Alternating Cuts Mode Status Overlay */}
          {compositorMode === "alternating" && (
            <div className="absolute top-4 left-4 z-20 flex flex-col space-y-1">
              <span className="flex items-center space-x-1.5 rounded-full bg-obsidian-900/90 px-3.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/15 shadow-lg">
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                <span>
                  {currentTime < 5
                    ? "ZERO-GLITCH CUT 1: AVATAR INTRO (0–5s)"
                    : currentTime < 22
                    ? "ZERO-GLITCH CUT 2: RAW WORK B-ROLL (5–22s)"
                    : "ZERO-GLITCH CUT 3: AVATAR CTA (22–30s)"}
                </span>
              </span>
              <span className="rounded-full bg-indigo-500/80 px-2.5 py-0.5 text-[9px] font-bold text-white w-fit border border-white/20">
                100% REAL FOOTAGE B-ROLL · NO AI HUMAN BODY ARTIFACTS
              </span>
            </div>
          )}

          {/* Brand Watermark Overlay Top-Right */}
          <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 rounded-xl bg-obsidian-900/80 px-3 py-1.5 backdrop-blur-md border border-white/10 shadow-lg">
            <img
              src={activeBrand.logoUrl}
              alt="Logo"
              className="h-5 w-5 rounded object-cover"
            />
            <span className="text-xs font-bold text-white">
              {activeBrand.name}
            </span>
          </div>

          {/* Synchronized Karaoke-Style Subtitles Overlay */}
          <div className="absolute bottom-20 inset-x-8 z-20 flex justify-center pointer-events-none">
            <div className="rounded-2xl bg-black/85 px-6 py-3 backdrop-blur-md border border-white/15 max-w-lg text-center shadow-2xl">
              <p className="text-sm sm:text-base font-extrabold leading-relaxed text-white tracking-wide">
                {words.map((word, idx) => {
                  const isHighlighted = idx <= wordIndex;
                  return (
                    <span
                      key={idx}
                      className={`inline-block mx-0.5 transition-colors duration-150 ${
                        isHighlighted
                          ? "text-yellow-400 scale-105 underline decoration-yellow-400/50"
                          : "text-slate-300"
                      }`}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>

          {/* Bottom Player Controls Bar */}
          <div className="absolute bottom-0 inset-x-0 z-30 flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent px-6 py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black hover:scale-105 transition-transform shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                    setIsPlaying(true);
                  }
                }}
                className="rounded-lg p-2 text-slate-300 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }
                }}
                className="rounded-lg p-2 text-slate-300 hover:text-white"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-red-400" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Time Indicator */}
            <div className="text-xs font-bold text-white">
              <span>{currentTime.toFixed(1)}s</span>
              <span className="text-slate-400"> / 15.0s</span>
            </div>
          </div>
        </div>

        {/* Right col: Script breakdown & Interactive Metadata */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-700/80 bg-obsidian-900/90 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>Script Segments & Karaoke Timing</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                AUTO-SYNCED
              </span>
            </div>

            <div className="space-y-3">
              {currentScript?.segments.map((seg, i) => {
                const isCurrentSeg =
                  currentTime >= seg.start && currentTime <= seg.end;
                return (
                  <div
                    key={seg.id}
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = seg.start;
                      }
                    }}
                    className={`rounded-2xl border p-3.5 cursor-pointer transition-all ${
                      isCurrentSeg
                        ? "border-indigo-600 bg-indigo-50/80 ring-1 ring-indigo-500/20 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                        {seg.start}s – {seg.end}s · {seg.speaker}
                      </span>
                      {isCurrentSeg && (
                        <span className="text-[10px] font-bold text-indigo-600 animate-pulse">
                          PLAYING
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-relaxed">
                      "{seg.text}"
                    </p>
                    <p className="text-[10px] text-slate-500 italic mt-1">
                      Visual: {seg.visualCue}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={onBackToStudio}
                className="w-full flex items-center justify-center space-x-2 rounded-xl border border-slate-200 bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-all shadow-sm"
              >
                <span>← Return to Studio to Generate Another Angle</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Script Editor Modal */}
      {isEditingScript && (
        <InlineScriptEditorModal
          currentHook={currentScript?.hook || ""}
          currentCta={currentScript?.cta || ""}
          onClose={() => setIsEditingScript(false)}
          onSave={handleSaveScript}
        />
      )}

      {/* Social Media Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-900/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-700 bg-obsidian-900 p-6 shadow-2xl ring-1 ring-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                Schedule Video to Social Calendar
              </h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                  Social Post Caption & Hashtags
                </label>
                <textarea
                  value={scheduleCaption}
                  onChange={(e) => setScheduleCaption(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Select Platforms
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "instagram", label: "Instagram Reels" },
                    { id: "tiktok", label: "TikTok Business" },
                    { id: "youtube", label: "YouTube Shorts" },
                  ].map((p) => {
                    const isSelected = selectedPlatforms.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => togglePlatform(p.id)}
                        className={`flex items-center space-x-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500/20 text-white"
                            : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-3">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25"
              >
                <Check className="h-4 w-4" />
                <span>Confirm & Add to Calendar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline Script Editor Modal Subcomponent
interface InlineEditorProps {
  currentHook: string;
  currentCta: string;
  onClose: () => void;
  onSave: (hook: string, cta: string) => void;
}

const InlineScriptEditorModal: React.FC<InlineEditorProps> = ({
  currentHook,
  currentCta,
  onClose,
  onSave,
}) => {
  const [hook, setHook] = useState(currentHook);
  const [cta, setCta] = useState(currentCta);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-900/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-700 bg-obsidian-900 p-6 shadow-2xl ring-1 ring-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">
            Inline Script & Karaoke Subtitle Editor
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
              Opening Hook (0–3s Subtitles)
            </label>
            <input
              type="text"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1">
              Closing CTA (11–15s Subtitles)
            </label>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 border-t border-slate-800 pt-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(hook, cta)}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25"
          >
            <Check className="h-4 w-4" />
            <span>Save & Re-sync Subtitles</span>
          </button>
        </div>
      </div>
    </div>
  );
};
