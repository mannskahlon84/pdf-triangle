"use client";

import React, { useEffect, useState } from "react";
import { MarketingCampaign } from "@/modules/marketpilot/social-publisher/types/publisher.types";
import CampaignList from "./CampaignList";
import CampaignPreviewModal from "./CampaignPreviewModal";
import PublishScheduleModal from "./PublishScheduleModal";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ScheduleCalendar from "./ScheduleCalendar";
import {
  FolderKanban,
  Calendar,
  BarChart3,
  PlusCircle,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";

interface MarketPilotCampaignDashboardProps {
  onNewCampaignClick?: () => void;
}

export default function MarketPilotCampaignDashboard({
  onNewCampaignClick,
}: MarketPilotCampaignDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "campaigns" | "calendar" | "analytics"
  >("campaigns");
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Modal states
  const [selectedCampaignForPreview, setSelectedCampaignForPreview] =
    useState<MarketingCampaign | null>(null);
  const [actionCampaign, setActionCampaign] =
    useState<MarketingCampaign | null>(null);
  const [actionMode, setActionMode] = useState<"publish" | "schedule" | null>(
    null
  );

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const url =
        filterStatus === "ALL"
          ? "/api/marketpilot/campaigns"
          : `/api/marketpilot/campaigns?status=${filterStatus}`;
      const res = await fetch(url);
      const json = await res.json();
      setCampaigns(json.campaigns || []);
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [filterStatus]);

  const handleSuccessAction = (updated: MarketingCampaign) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    setActionMode(null);
    setActionCampaign(null);
  };

  return (
    <div className="space-y-6">
      {/* TOP HEADER & TABS BAR */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <FolderKanban className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              MarketPilot Campaign Manager
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage, schedule, publish, and track your AI-generated marketing
            campaigns across 5 social channels.
          </p>
        </div>

        {/* TABS & NEW CAMPAIGN CTA */}
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "campaigns"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              Campaigns ({campaigns.length})
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "calendar"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Schedule Calendar
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === "analytics"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              ROI & Insights
            </button>
          </div>

          {onNewCampaignClick && (
            <button
              onClick={onNewCampaignClick}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-sm flex items-center gap-1.5 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New AI Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === "campaigns" && (
        <CampaignList
          campaigns={campaigns}
          onSelectCampaign={(c) => setSelectedCampaignForPreview(c)}
          onOpenPublish={(c) => {
            setActionCampaign(c);
            setActionMode("publish");
          }}
          onOpenSchedule={(c) => {
            setActionCampaign(c);
            setActionMode("schedule");
          }}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      )}

      {activeTab === "calendar" && (
        <ScheduleCalendar
          campaigns={campaigns}
          onSelectCampaign={(c) => setSelectedCampaignForPreview(c)}
        />
      )}

      {activeTab === "analytics" && <AnalyticsDashboard />}

      {/* FORMATTER PREVIEW MODAL */}
      <CampaignPreviewModal
        campaign={selectedCampaignForPreview}
        onClose={() => setSelectedCampaignForPreview(null)}
      />

      {/* PUBLISH / SCHEDULE MODAL */}
      {actionMode && actionCampaign && (
        <PublishScheduleModal
          campaign={actionCampaign}
          mode={actionMode}
          onClose={() => {
            setActionMode(null);
            setActionCampaign(null);
          }}
          onSuccess={handleSuccessAction}
        />
      )}
    </div>
  );
}
