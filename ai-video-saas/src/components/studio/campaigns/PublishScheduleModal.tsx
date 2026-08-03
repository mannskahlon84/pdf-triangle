"use client";

import React, { useState } from "react";
import {
  MarketingCampaign,
  SocialPlatformType,
} from "@/modules/marketpilot/social-publisher/types/publisher.types";
import {
  X,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
} from "lucide-react";

interface PublishScheduleModalProps {
  campaign: MarketingCampaign | null;
  mode: "publish" | "schedule";
  onClose: () => void;
  onSuccess: (updatedCampaign: MarketingCampaign) => void;
}

export default function PublishScheduleModal({
  campaign,
  mode,
  onClose,
  onSuccess,
}: PublishScheduleModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<
    SocialPlatformType[]
  >(
    campaign?.platforms || ["instagram", "youtube_shorts", "tiktok", "linkedin"]
  );
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!campaign) return null;

  const togglePlatform = (p: SocialPlatformType) => {
    if (selectedPlatforms.includes(p)) {
      setSelectedPlatforms(selectedPlatforms.filter((item) => item !== p));
    } else {
      setSelectedPlatforms([...selectedPlatforms, p]);
    }
  };

  const handleAction = async () => {
    if (selectedPlatforms.length === 0) {
      setError("Please select at least one target social platform.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const endpoint =
        mode === "publish"
          ? "/api/marketpilot/publish"
          : "/api/marketpilot/schedule";

      const payload =
        mode === "publish"
          ? {
              campaignId: campaign.id,
              platforms: selectedPlatforms,
              immediate: true,
            }
          : {
              campaignId: campaign.id,
              platforms: selectedPlatforms,
              scheduledTime: new Date(scheduledDate).toISOString(),
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to execute publication.");
      }

      // Update local campaign object
      const updated: MarketingCampaign = {
        ...campaign,
        status: mode === "publish" ? "PUBLISHED" : "SCHEDULED",
        platforms: selectedPlatforms,
        scheduledTime:
          mode === "schedule" ? new Date(scheduledDate).toISOString() : undefined,
      };

      onSuccess(updated);
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === "publish" ? (
              <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {mode === "publish" ? "Publish Campaign Now" : "Schedule Campaign"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Campaign
            </span>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
              {campaign.campaignName}
            </div>
          </div>

          {/* TARGET PLATFORMS */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Target Social Platforms
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: "instagram", label: "Instagram Reels" },
                { id: "youtube_shorts", label: "YouTube Shorts" },
                { id: "tiktok", label: "TikTok Business" },
                { id: "linkedin", label: "LinkedIn Feed" },
                { id: "facebook", label: "Facebook Reels" },
              ].map((plat) => {
                const isSelected = selectedPlatforms.includes(
                  plat.id as SocialPlatformType
                );
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() =>
                      togglePlatform(plat.id as SocialPlatformType)
                    }
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{plat.label}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SCHEDULE TIME PICKER (if mode == schedule) */}
          {mode === "schedule" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Release Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleAction}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition ${
              mode === "publish"
                ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
                : "bg-amber-600 hover:bg-amber-500"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : mode === "publish" ? (
              <>
                <Send className="w-4 h-4" />
                <span>Confirm & Publish</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span>Schedule Release</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
