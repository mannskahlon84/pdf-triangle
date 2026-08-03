"use client";

import React, { useState } from "react";
import {
  MarketingCampaign,
  CampaignStatus,
  SocialPlatformType,
} from "@/modules/marketpilot/social-publisher/types/publisher.types";
import {
  Calendar,
  Eye,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Share2,
  Film,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
  TrendingUp,
  Filter,
} from "lucide-react";

interface CampaignListProps {
  campaigns: MarketingCampaign[];
  onSelectCampaign: (campaign: MarketingCampaign) => void;
  onOpenPublish: (campaign: MarketingCampaign) => void;
  onOpenSchedule: (campaign: MarketingCampaign) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

export default function CampaignList({
  campaigns,
  onSelectCampaign,
  onOpenPublish,
  onOpenSchedule,
  filterStatus,
  setFilterStatus,
}: CampaignListProps) {
  const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
      case "PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PUBLISHED
          </span>
        );
      case "SCHEDULED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            SCHEDULED
          </span>
        );
      case "READY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800">
            <Send className="w-3.5 h-3.5" />
            READY
          </span>
        );
      case "GENERATING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-300 dark:border-purple-800">
            GENERATING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            DRAFT
          </span>
        );
    }
  };

  const getPlatformIcon = (platform: SocialPlatformType) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
      case "youtube_shorts":
        return <Youtube className="w-3.5 h-3.5 text-red-500" />;
      case "linkedin":
        return <Linkedin className="w-3.5 h-3.5 text-blue-500" />;
      case "facebook":
        return <Facebook className="w-3.5 h-3.5 text-blue-600" />;
      default:
        return <Share2 className="w-3.5 h-3.5 text-purple-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "PUBLISHED", "SCHEDULED", "READY"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition border ${
                filterStatus === st
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Showing {campaigns.length} campaigns
        </div>
      </div>

      {/* CAMPAIGNS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            {/* Top row: Status & Industry */}
            <div className="flex items-center justify-between">
              {getStatusBadge(camp.status)}
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {camp.industry}
              </span>
            </div>

            {/* Campaign Title & Metrics */}
            <div className="space-y-2">
              <h3
                onClick={() => onSelectCampaign(camp)}
                className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition"
              >
                {camp.campaignName}
              </h3>

              {camp.status === "PUBLISHED" && (
                <div className="flex items-center gap-4 pt-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    {camp.analytics.views.toLocaleString()} Views
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    {camp.analytics.engagementRatePct}% Engagement
                  </span>
                </div>
              )}

              {camp.status === "SCHEDULED" && camp.scheduledTime && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 pt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    Releasing{" "}
                    {new Date(camp.scheduledTime).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Target Platforms */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Platforms:
              </span>
              <div className="flex items-center gap-1.5">
                {camp.platforms.map((plat) => (
                  <span
                    key={plat}
                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    title={plat}
                  >
                    {getPlatformIcon(plat)}
                  </span>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={() => onSelectCampaign(camp)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                View Platform Formats
              </button>

              <div className="flex items-center gap-2">
                {camp.status !== "PUBLISHED" && (
                  <>
                    <button
                      onClick={() => onOpenSchedule(camp)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition border border-amber-300 dark:border-amber-800 flex items-center gap-1"
                    >
                      <Clock className="w-3 h-3" />
                      Schedule
                    </button>
                    <button
                      onClick={() => onOpenPublish(camp)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition shadow-sm flex items-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      Publish Now
                    </button>
                  </>
                )}
                {camp.status === "PUBLISHED" && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Live across {camp.platforms.length} channels ✓
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
