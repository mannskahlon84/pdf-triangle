"use client";

import React, { useState } from "react";
import { useAppStore, ScheduledPost } from "@/store/useAppStore";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Share2,
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  ExternalLink,
  Plus,
  RefreshCw,
  Video,
  BarChart3,
  Globe,
  Award,
} from "lucide-react";
import { toast } from "sonner";

export const SocialPublisher: React.FC = () => {
  const {
    scheduledPosts,
    connectedPlatforms,
    togglePlatformConnection,
    activeBrandId,
    brands,
  } = useAppStore();

  const [activeView, setActiveView] = useState<"calendar" | "analytics">(
    "calendar"
  );
  const activeBrand =
    brands.find((b) => b.id === activeBrandId) || brands[0];

  // Calculate aggregated stats
  const totalViews = scheduledPosts.reduce((acc, p) => acc + p.views, 0);
  const totalClicks = scheduledPosts.reduce((acc, p) => acc + p.clicks, 0);
  const totalShares = scheduledPosts.reduce((acc, p) => acc + p.shares, 0);
  const avgEngagement =
    scheduledPosts.length > 0
      ? (
          scheduledPosts.reduce((acc, p) => acc + p.engagementRate, 0) /
          scheduledPosts.length
        ).toFixed(1)
      : "7.2";

  const platformsList = [
    {
      id: "instagram" as const,
      name: "Instagram Reels",
      handle: `@${activeBrand.name.toLowerCase().replace(/[^a-z]/g, "")}_official`,
      status: connectedPlatforms.instagram ? "Connected" : "Not Connected",
      views: "24.5k",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "tiktok" as const,
      name: "TikTok Business",
      handle: `@${activeBrand.name.toLowerCase().replace(/[^a-z]/g, "")}.careers`,
      status: connectedPlatforms.tiktok ? "Connected" : "Not Connected",
      views: "18.2k",
      color: "from-cyan-500 to-emerald-500",
    },
    {
      id: "youtube" as const,
      name: "YouTube Shorts",
      handle: `${activeBrand.name} TV`,
      status: connectedPlatforms.youtube ? "Connected" : "Not Connected",
      views: "10.4k",
      color: "from-red-500 to-rose-600",
    },
    {
      id: "metaAds" as const,
      name: "Meta Ads Manager",
      handle: `${activeBrand.name} Ad Account`,
      status: connectedPlatforms.metaAds ? "Connected" : "Ready to Connect",
      views: "Ad Ready",
      color: "from-blue-600 to-indigo-600",
    },
  ];

  const handleSimulatePublish = (post: ScheduledPost) => {
    toast.success(`Published "${post.title}" to connected channels!`, {
      description: `Live on ${post.platforms.map((p) => p.toUpperCase()).join(", ")} with tracking pixels enabled.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Top Navigation Bar: Calendar vs Analytics */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">
              Multi-Channel Social Publisher & Scheduler
            </h2>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              4 CHANNELS CONNECTED
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Automated publishing and engagement tracking for{" "}
            <span className="text-white font-bold">{activeBrand.name}</span>.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveView("calendar")}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeView === "calendar"
                ? "bg-indigo-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Content Calendar</span>
          </button>
          <button
            onClick={() => setActiveView("analytics")}
            className={`flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeView === "analytics"
                ? "bg-indigo-500 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Engagement Analytics</span>
          </button>
        </div>
      </div>

      {/* Platform Connectors UI Bar */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Connected Social Networks</span>
          <span className="text-[10px] text-indigo-400">
            Oauth Tokens Verified
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformsList.map((platform) => {
            const isConnected =
              connectedPlatforms[platform.id as keyof typeof connectedPlatforms];
            return (
              <div
                key={platform.id}
                className={`rounded-2xl border p-4 transition-all ${
                  isConnected
                    ? "border-slate-700 bg-slate-900/80 shadow-md"
                    : "border-slate-800/80 bg-slate-950/60 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`h-9 w-9 rounded-xl bg-gradient-to-tr ${platform.color} flex items-center justify-center text-white shadow-md`}
                  >
                    <Globe className="h-4 w-4" />
                  </div>
                  <button
                    onClick={() => {
                      togglePlatformConnection(platform.id);
                      toast.info(
                        `${platform.name} ${
                          !isConnected ? "Connected" : "Disconnected"
                        }`,
                        {
                          description: !isConnected
                            ? `Oauth token refreshed for ${platform.handle}`
                            : `Disabled auto-syndication for ${platform.handle}`,
                        }
                      );
                    }}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                      isConnected
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/40"
                        : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 hover:bg-indigo-500 hover:text-white"
                    }`}
                  >
                    {isConnected ? "Connected" : "Connect Now"}
                  </button>
                </div>

                <h4 className="text-xs font-bold text-white">
                  {platform.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium truncate">
                  {platform.handle}
                </p>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">Avg Monthly Reach</span>
                  <span className="font-bold text-slate-300">
                    {platform.views}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeView === "calendar" ? (
        /* Interactive Content Calendar & Scheduler Grid */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              July / August 2026 Scheduled Reels ({scheduledPosts.length})
            </h3>
            <span className="text-xs text-slate-400">
              Click any item to publish immediately or preview analytics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledPosts.map((post) => {
              const dateObj = new Date(post.scheduledTime);
              const formattedDate = dateObj.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const formattedTime = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const isPublished = post.status === "published";

              return (
                <div
                  key={post.id}
                  className="rounded-3xl border border-slate-700/80 bg-obsidian-900/90 p-5 shadow-xl flex flex-col justify-between hover:border-slate-600 transition-all"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-2xl bg-slate-800 border border-slate-700">
                      <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                      <span
                        className={`absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                          isPublished
                            ? "bg-emerald-500 text-white"
                            : "bg-indigo-500 text-white"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400">
                          {formattedDate} · {formattedTime}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate mt-0.5">
                        {post.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic">
                        "{post.caption}"
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        {post.platforms.map((plat) => (
                          <span
                            key={plat}
                            className="rounded-full bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-300 border border-slate-700 uppercase"
                          >
                            {plat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer Metrics or Publish Action */}
                  <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                    {isPublished ? (
                      <div className="flex items-center space-x-4 text-xs">
                        <span className="flex items-center space-x-1 text-slate-300">
                          <Eye className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="font-bold">
                            {post.views.toLocaleString()}
                          </span>
                        </span>
                        <span className="flex items-center space-x-1 text-slate-300">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="font-bold">
                            {post.engagementRate}% Eng
                          </span>
                        </span>
                        <span className="flex items-center space-x-1 text-slate-300">
                          <MousePointerClick className="h-3.5 w-3.5 text-cyan-400" />
                          <span className="font-bold">{post.clicks} Clicks</span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        Scheduled for Auto-Publish
                      </span>
                    )}

                    <button
                      onClick={() => handleSimulatePublish(post)}
                      className="flex items-center space-x-1.5 rounded-xl bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-indigo-300 hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>{isPublished ? "Re-syndicate" : "Publish Now"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Engagement Analytics View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-slate-700/80 bg-obsidian-900/90 p-5 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">
                  Total Video Views
                </span>
                <Eye className="h-4 w-4 text-indigo-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">
                {totalViews.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                +14.2% vs last 30 days
              </p>
            </div>

            <div className="rounded-3xl border border-slate-700/80 bg-obsidian-900/90 p-5 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">
                  Avg Engagement Rate
                </span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">
                {avgEngagement}%
              </p>
              <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                2x higher than industry average
              </p>
            </div>

            <div className="rounded-3xl border border-slate-700/80 bg-obsidian-900/90 p-5 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">
                  CTA Click-Throughs
                </span>
                <MousePointerClick className="h-4 w-4 text-cyan-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">
                {totalClicks.toLocaleString()}
              </p>
              <p className="text-[11px] text-indigo-400 font-semibold mt-1">
                Conversion funnel tracking active
              </p>
            </div>

            <div className="rounded-3xl border border-slate-700/80 bg-obsidian-900/90 p-5 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase">
                  Total Social Shares
                </span>
                <Share2 className="h-4 w-4 text-rose-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">
                {totalShares.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                High viral coefficient on Reels
              </p>
            </div>
          </div>

          {/* Visual Engagement Chart Box */}
          <div className="rounded-3xl border border-slate-700/80 bg-obsidian-900/90 p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">
                  30-Day Multi-Channel View Velocity (Simulated)
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Instagram Reels + TikTok + YouTube
              </span>
            </div>

            <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 px-4">
              {[35, 52, 48, 70, 85, 64, 92, 100, 78, 95, 88, 110].map(
                (val, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center group"
                  >
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-indigo-600 to-emerald-400 group-hover:from-indigo-500 group-hover:to-emerald-300 transition-all shadow-lg"
                      style={{ height: `${(val / 110) * 100}%` }}
                    />
                    <span className="text-[9px] font-bold text-slate-500 mt-2">
                      W{i + 1}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
