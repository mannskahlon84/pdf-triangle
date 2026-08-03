"use client";

import React, { useState } from "react";
import {
  MarketingCampaign,
  SocialPlatformType,
} from "@/modules/marketpilot/social-publisher/types/publisher.types";
import {
  X,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
  Share2,
  Copy,
  Check,
  Video,
  ExternalLink,
} from "lucide-react";

interface CampaignPreviewModalProps {
  campaign: MarketingCampaign | null;
  onClose: () => void;
}

export default function CampaignPreviewModal({
  campaign,
  onClose,
}: CampaignPreviewModalProps) {
  const [selectedPlatform, setSelectedPlatform] =
    useState<SocialPlatformType>("instagram");
  const [copied, setCopied] = useState(false);

  if (!campaign) return null;

  const content =
    campaign.platformContents.find(
      (c) => c.platform === selectedPlatform
    ) || {
      platform: selectedPlatform,
      caption: `${campaign.campaignName} — #MarketPilot`,
      hashtags: ["#MarketPilotAI", `#${campaign.industry}`],
    };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformName = (p: SocialPlatformType) => {
    switch (p) {
      case "instagram":
        return "Instagram Reels";
      case "youtube_shorts":
        return "YouTube Shorts";
      case "tiktok":
        return "TikTok Business";
      case "linkedin":
        return "LinkedIn Feed";
      case "facebook":
        return "Facebook Reels";
      default:
        return p;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Platform Content Formatter
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {campaign.campaignName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PLATFORM SWITCHER TABS */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center gap-2 overflow-x-auto">
          {["instagram", "youtube_shorts", "tiktok", "linkedin", "facebook"].map(
            (p) => {
              const isActive = selectedPlatform === p;
              return (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p as SocialPlatformType)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  }`}
                >
                  {getPlatformName(p as SocialPlatformType)}
                </button>
              );
            }
          )}
        </div>

        {/* CONTENT BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TITLE (if YouTube / LinkedIn) */}
          {content.title && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Optimized Title
              </label>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white">
                {content.title}
              </div>
            </div>
          )}

          {/* CAPTION / POST BODY */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Tailored Caption & Body
              </label>
              <button
                onClick={() =>
                  handleCopy(
                    `${content.title ? content.title + "\n\n" : ""}${
                      content.caption
                    }\n\n${content.hashtags.join(" ")}`
                  )
                }
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Package
                  </>
                )}
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {content.caption}
            </div>
          </div>

          {/* HASHTAGS */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Platform Hashtags ({content.hashtags.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {content.hashtags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* PROFESSIONAL NOTE OR COVER URL */}
          {content.professionalNote && (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-medium text-blue-700 dark:text-blue-300">
              ℹ️ {content.professionalNote}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            Close Formatter
          </button>
        </div>
      </div>
    </div>
  );
}
