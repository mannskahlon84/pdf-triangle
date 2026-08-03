"use client";

import React from "react";
import { MarketingCampaign } from "@/modules/marketpilot/social-publisher/types/publisher.types";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Share2,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
} from "lucide-react";

interface ScheduleCalendarProps {
  campaigns: MarketingCampaign[];
  onSelectCampaign: (campaign: MarketingCampaign) => void;
}

export default function ScheduleCalendar({
  campaigns,
  onSelectCampaign,
}: ScheduleCalendarProps) {
  const sorted = [...campaigns].sort((a, b) => {
    const timeA = a.scheduledTime || a.publishedAt || a.createdAt;
    const timeB = b.scheduledTime || b.publishedAt || b.createdAt;
    return new Date(timeA).getTime() - new Date(timeB).getTime();
  });

  const getPlatformIcon = (platform: string) => {
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
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            MarketPilot Release Calendar
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {sorted.length} Total Campaigns
        </span>
      </div>

      <div className="space-y-3">
        {sorted.map((camp) => {
          const isPublished = camp.status === "PUBLISHED";
          const displayDate =
            camp.scheduledTime || camp.publishedAt || camp.createdAt;

          return (
            <div
              key={camp.id}
              onClick={() => onSelectCampaign(camp)}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    isPublished
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                  }`}
                >
                  {isPublished ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {camp.campaignName}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="font-semibold uppercase text-indigo-600 dark:text-indigo-400">
                      {camp.industry}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(displayDate).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {camp.platforms.map((p) => (
                  <span
                    key={p}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                    title={p}
                  >
                    {getPlatformIcon(p)}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
