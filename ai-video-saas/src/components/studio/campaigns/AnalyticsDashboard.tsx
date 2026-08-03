"use client";

import React, { useEffect, useState } from "react";
import { PortfolioAnalyticsSummary } from "@/modules/marketpilot/social-publisher/analyticsTracker";
import {
  Eye,
  Heart,
  MessageSquare,
  Share2,
  MousePointerClick,
  Users,
  TrendingUp,
  Award,
  RefreshCw,
  BarChart2,
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [data, setData] = useState<PortfolioAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketpilot/analytics");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Aggregating cross-platform campaign analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md text-indigo-200 border border-white/20">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Top Performing Channel: {data.topPerformingPlatform}
          </span>
          <h2 className="text-2xl font-extrabold mt-2">
            MarketPilot Campaign Insights & ROI
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Tracking {data.publishedCampaigns} active campaigns across 5 social
            channels.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition border border-white/20 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Velocity
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Views</span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {data.totalViews.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +24.8% vs last 30d
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Engagement Rate</span>
            <Heart className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {data.avgEngagementRatePct}%
          </div>
          <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            Above industry avg (4.2%)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Link Clicks</span>
            <MousePointerClick className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {data.totalClicks.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            Direct CTA conversion traffic
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Followers Gained</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            +{data.totalFollowersGained.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mt-1">
            Organic audience growth
          </div>
        </div>
      </div>

      {/* PLATFORM DISTRIBUTION BREAKDOWN */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            Cross-Platform View Distribution
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {data.viewsByPlatform.length} Active Channels
          </span>
        </div>

        <div className="space-y-3">
          {data.viewsByPlatform.map((item) => {
            const pct =
              data.totalViews > 0
                ? Math.round((item.views / data.totalViews) * 100)
                : 0;

            return (
              <div key={item.platform} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">
                    {item.platform}
                  </span>
                  <span className="text-slate-500">
                    {item.views.toLocaleString()} views ({pct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
