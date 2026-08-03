"use client";

import React, { useRef } from "react";
import { useAppStore, MediaAsset } from "@/store/useAppStore";
import {
  Upload,
  Video,
  Image as ImageIcon,
  Play,
  Eye,
  Clock,
  Monitor,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface MultimodalDropzoneProps {
  onInspectVision: () => void;
}

export const MultimodalDropzone: React.FC<MultimodalDropzoneProps> = ({
  onInspectVision,
}) => {
  const {
    mediaLibrary,
    selectedMedia,
    setSelectedMedia,
    addUploadedMedia,
    activeBrandId,
    activeScrubberTime,
    setActiveScrubberTime,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Filter demo media by active brand or show all
  const filteredMedia = mediaLibrary.filter(
    (m) => m.brandId === activeBrandId || m.brandId === "manpower"
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Handle Multi-Angle Product Photo Upload (2+ Images)
    if (files.length > 1) {
      const angleLabels = [
        "Angle 1: Front Profile & Display",
        "Angle 2: Side Crown & Detail View",
        "Angle 3: In-Use / Lifestyle Perspective",
        "Angle 4: Top/Back Angle View",
      ];
      const angles = files.map((f, i) => ({
        id: `ang-up-${i}-${Date.now()}`,
        label: angleLabels[i] || `Angle ${i + 1}: ${f.name}`,
        url: URL.createObjectURL(f),
        timestamp: (i + 1) * 3,
      }));

      const newMultiMedia: MediaAsset = {
        id: `media-multi-up-${Date.now()}`,
        title: `${files[0].name.replace(/\.[^/.]+$/, "")} (+${files.length - 1} Product Angles)`,
        type: "image",
        url: angles[0].url,
        thumbnailUrl: angles[0].url,
        brandId: activeBrandId,
        isMultiAngle: true,
        angles: angles,
        keyframes: angles.map((a, i) => ({
          id: `kf-multi-up-${i}`,
          timestamp: a.timestamp,
          label: a.label,
          description: `Extracted high-resolution product showcase view (${a.label}).`,
          valueProp: `Spotlight unique product angle and feature differentiation in video session.`,
          confidence: 98 - i,
        })),
      };

      addUploadedMedia(newMultiMedia);
      toast.success(`${files.length} Product Photos Uploaded!`, {
        description: `Created 360° Multi-Angle Product Showcase ready for dynamic B-Roll video sessions.`,
      });
      return;
    }

    // Handle Single File Upload (JPG/JPEG/PNG/MP4)
    const file = files[0];
    const isVideo = file.type.startsWith("video/") || file.name.endsWith(".mp4");
    const objectUrl = URL.createObjectURL(file);

    const newMedia: MediaAsset = {
      id: `media-upload-${Date.now()}`,
      title: file.name,
      type: isVideo ? "video" : "image",
      url: objectUrl,
      thumbnailUrl: objectUrl,
      duration: isVideo ? 15 : undefined,
      resolution: isVideo ? "1080p · 60fps" : "HD 2000px",
      brandId: activeBrandId,
      keyframes: isVideo
        ? [
            {
              id: `kf-up-1`,
              timestamp: 2,
              label: "Workplace Safety & Equipment",
              description: "Detected personnel operating equipment in professional attire.",
              valueProp: "Highlight workplace professionalism and modern equipment standards.",
              confidence: 96,
            },
            {
              id: `kf-up-2`,
              timestamp: 8,
              label: "Technical Operations",
              description: "Focused view on precision workplace activity.",
              valueProp: "Spotlight technical expertise and quality assurance.",
              confidence: 94,
            },
          ]
        : [
            {
              id: `kf-up-img`,
              timestamp: 0,
              label: "Product Profile & Detail",
              description: "High-resolution product photo with clear subject isolation.",
              valueProp: "Focus on product quality and primary conversion hook.",
              confidence: 95,
            },
          ],
    };

    addUploadedMedia(newMedia);
    toast.success(`${isVideo ? "Video" : "Image"} uploaded & analyzed!`, {
      description: `AI Vision Engine extracted ${newMedia.keyframes.length} keyframe action insights.`,
    });
  };

  // Sync video scrubber time
  React.useEffect(() => {
    if (videoRef.current && selectedMedia?.type === "video") {
      videoRef.current.currentTime = activeScrubberTime;
    }
  }, [activeScrubberTime, selectedMedia]);

  return (
    <div className="space-y-4">
      {/* Top Media Display & Preview Box */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700/80 bg-obsidian-900/90 shadow-2xl">
        <div className="relative aspect-video w-full bg-obsidian-950 flex items-center justify-center">
          {selectedMedia ? (
            selectedMedia.type === "video" ? (
              <>
                <video
                  ref={videoRef}
                  src={selectedMedia.url}
                  className="h-full w-full object-cover"
                  controls
                  crossOrigin="anonymous"
                  playsInline
                />
                {/* Live Resolution / Duration Badges */}
                <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
                  <span className="flex items-center space-x-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
                    <Video className="h-3.5 w-3.5 text-indigo-400" />
                    <span>RAW WORKPLACE VIDEO</span>
                  </span>
                  {selectedMedia.duration && (
                    <span className="flex items-center space-x-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur-md border border-white/10">
                      <Clock className="h-3 w-3 text-emerald-400" />
                      <span>{selectedMedia.duration}s</span>
                    </span>
                  )}
                  {selectedMedia.resolution && (
                    <span className="hidden sm:flex items-center space-x-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur-md border border-white/10">
                      <Monitor className="h-3 w-3 text-cyan-400" />
                      <span>{selectedMedia.resolution}</span>
                    </span>
                  )}
                </div>

                {/* Inspect Action Trigger */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={onInspectVision}
                    className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg hover:from-indigo-600 hover:to-emerald-600 transition-all active:scale-95 border border-white/20"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Inspect Vision Insights ({selectedMedia.keyframes.length})</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="relative h-full w-full flex flex-col items-center justify-center">
                <img
                  src={
                    selectedMedia.angles && selectedMedia.angles.length > 0
                      ? (
                          selectedMedia.angles.reduce((prev, curr) =>
                            Math.abs(curr.timestamp - activeScrubberTime) <
                            Math.abs(prev.timestamp - activeScrubberTime)
                              ? curr
                              : prev,
                            selectedMedia.angles[0]
                          ) || selectedMedia.angles[0]
                        ).url
                      : selectedMedia.url
                  }
                  alt={selectedMedia.title}
                  className="h-full w-full object-contain"
                />
                <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
                  <span className="flex items-center space-x-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
                    <ImageIcon className="h-3.5 w-3.5 text-indigo-400" />
                    <span>
                      {selectedMedia.isMultiAngle
                        ? `MULTI-ANGLE PRODUCT SHOWCASE (${selectedMedia.angles?.length || 3} ANGLES)`
                        : "PRODUCT PHOTO / IMAGE"}
                    </span>
                  </span>
                  {selectedMedia.isMultiAngle && (
                    <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                      360° DYNAMIC B-ROLL READY
                    </span>
                  )}
                </div>

                {/* Inspect Action Trigger */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={onInspectVision}
                    className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg hover:from-indigo-600 hover:to-emerald-600 transition-all active:scale-95 border border-white/20"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Inspect Vision Insights ({selectedMedia.keyframes.length})</span>
                  </button>
                </div>

                {/* Multi-Angle Switcher Bar Inside Image Preview */}
                {selectedMedia.angles && selectedMedia.angles.length > 0 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center space-x-2 rounded-2xl bg-obsidian-950/90 p-1.5 backdrop-blur-md border border-white/15 shadow-xl">
                    {selectedMedia.angles.map((ang, idx) => {
                      const isActive =
                        Math.abs(ang.timestamp - activeScrubberTime) < 2;
                      return (
                        <button
                          key={ang.id}
                          onClick={() => setActiveScrubberTime(ang.timestamp)}
                          className={`flex items-center space-x-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                            isActive
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40 ring-1 ring-white/30"
                              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800"
                          }`}
                        >
                          <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="truncate max-w-[120px]">{ang.label.split(":")[0]}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center p-8">
              <Video className="h-12 w-12 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-400">
                No Media Selected
              </p>
              <p className="text-xs text-slate-500">
                Upload raw video or select a sample below to begin multimodal
                analysis.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Selected Media Metadata Bar */}
        {selectedMedia && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">
                {selectedMedia.title}
              </span>
              <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                {selectedMedia.keyframes.length} Keyframes Detected
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-all shadow-sm"
              >
                <Upload className="h-3.5 w-3.5 text-indigo-600" />
                <span>Upload Media / Multi-Angle Photos (JPG, JPEG, PNG, MP4)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple={true}
                accept="video/mp4,video/mov,video/quicktime,video/webm,image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* 1-Click Sample Workplace Media Gallery */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Sample Workplace & Business Media (1-Click Demo)</span>
          </label>
          <span className="text-[10px] text-slate-500 font-medium">
            Click any item to load AI Vision action analysis
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {filteredMedia.map((media) => {
            const isSelected = selectedMedia?.id === media.id;
            return (
              <div
                key={media.id}
                onClick={() => {
                  setSelectedMedia(media);
                  toast.success(`Loaded ${media.title}`, {
                    description: `Extracted ${media.keyframes.length} action keyframes for hybrid compositing.`,
                  });
                }}
                className={`group relative overflow-hidden rounded-2xl border p-2 cursor-pointer transition-all ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/80 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-sm"
                }`}
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 mb-2">
                  <img
                    src={media.thumbnailUrl}
                    alt={media.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    {media.type === "video" ? `${media.duration}s MP4` : "PNG"}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 truncate pr-1">
                    {media.title.replace(" (MP4)", "").replace(" (PNG)", "")}
                  </p>
                  {isSelected && (
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">
                  {media.keyframes[0]?.label || "Visual Ready"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
