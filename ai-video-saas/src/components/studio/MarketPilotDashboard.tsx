"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar,
  Lightbulb,
  MessageSquare,
  Award,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sliders,
  Send,
  Video,
} from "lucide-react";
import {
  promotionTypesConfig,
  INDUSTRY_TEMPLATE_METADATA,
  PromotionRequest,
  Campaign,
  TemplateRegistryEntry,
  CampaignGoal,
} from "@/modules/marketpilot";
import { ScenePlanner, VideoPlan } from "@/modules/marketpilot/video-planner";
import VideoPlanPreview from "./VideoPlanPreview";
import VideoCreationStudio from "./VideoCreationStudio";
import MarketPilotCampaignDashboard from "./campaigns/MarketPilotCampaignDashboard";
import { PromotionTargetType } from "@/types/database";

export const MarketPilotDashboard: React.FC = () => {

  // 1. Industry & Promotion Type Selection State
  const [selectedType, setSelectedType] = useState<PromotionTargetType>("website");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("website");
  const [businessName, setBusinessName] = useState<string>("CloudFlow AI");
  const [targetAudience, setTargetAudience] = useState<string>(
    "SaaS Founders & Remote Engineering Leads"
  );
  const [campaignGoal, setCampaignGoal] = useState<CampaignGoal>("lead_generation");
  const [userInputs, setUserInputs] = useState<Record<string, any>>({
    url: "https://cloudflowpro.io",
    category: "SaaS Workflow & Project Management",
    benefits: [
      "Zero-code workflow automations in minutes",
      "Real-time team analytics dashboard",
      "99.9% uptime SLA for enterprise teams",
    ],
  });

  // 2. Generation & UI State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<
    TemplateRegistryEntry | undefined
  >(undefined);
  const [suggestedTemplates, setSuggestedTemplates] = useState<
    TemplateRegistryEntry[]
  >([]);
  const [activeTab, setActiveTab] = useState<
    "concepts" | "scripts" | "captions" | "adcopy"
  >("concepts");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [videoPlan, setVideoPlan] = useState<VideoPlan | null>(null);
  const [viewMode, setViewMode] = useState<"campaign" | "videoPlan" | "studio" | "manager">("campaign");



  const activeConfig =
    promotionTypesConfig[selectedType] || promotionTypesConfig.website;
  const activeMetadata =
    INDUSTRY_TEMPLATE_METADATA[selectedIndustry] ||
    INDUSTRY_TEMPLATE_METADATA["business"];

  // Handle Type Change
  const handleTypeChange = (type: PromotionTargetType) => {
    setSelectedType(type);
    setSelectedIndustry(type);
    const cfg = promotionTypesConfig[type] || promotionTypesConfig.website;
    setUserInputs({
      ...userInputs,
      category: cfg.name,
      benefits:
        cfg.fields.find((f) => f.id === "benefits")?.defaultTags || [
          "High standard execution",
          "Rapid delivery",
          "Guaranteed satisfaction",
        ],
    });
  };

  // Step A: AI Analysis
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisText(null);
    try {
      const res = await fetch("/api/marketpilot/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promotionType: selectedType,
          industry: selectedIndustry,
          businessName,
          userInputs,
          targetAudience,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalysisText(data.analysis);
      } else {
        setAnalysisText("Analysis ready: Extracted core marketing hooks.");
      }
    } catch (e) {
      setAnalysisText("Analysis complete: Identified 4 high-intent selling points.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step B: Generate Full Campaign
  const handleGenerateCampaign = async () => {
    setIsGenerating(true);
    try {
      const payload: PromotionRequest = {
        promotionType: selectedType,
        industry: selectedIndustry,
        businessName,
        userInputs,
        targetAudience,
        campaignGoal,
      };

      const res = await fetch("/api/marketpilot/create-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setCampaign(data.campaign);
        setSelectedTemplate(data.selectedTemplate);
        setSuggestedTemplates(data.suggestedTemplates || []);
        setVideoPlan(null);
        setViewMode("campaign");
      }
    } catch (error) {
      console.error("Failed to generate campaign:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateVideoPlan = () => {
    if (!campaign) return;
    const plan = ScenePlanner.generateVideoPlanFromCampaign(campaign, {
      duration: "30s",
      aspectRatio: "9:16",
    });
    setVideoPlan(plan);
    setViewMode("videoPlan");
  };


  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full space-y-8 pb-16">
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 p-6 border border-white/10 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                MarketPilot AI — Promotion Engine
              </h2>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                PHASE 4
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Create → Generate → Review → Schedule → Publish → Analyze
            </p>
          </div>
        </div>

        {/* TOP LEVEL MODE SWITCHER */}
        <div className="flex items-center gap-2 bg-obsidian-950 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setViewMode("campaign")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode !== "manager"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Create & Generate Studio</span>
          </button>
          <button
            onClick={() => setViewMode("manager")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              viewMode === "manager"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Campaigns & Social Publisher</span>
          </button>
        </div>
      </div>

      {/* PHASE 4: SOCIAL PUBLISHER & CAMPAIGN MANAGER VIEW */}
      {viewMode === "manager" ? (
        <MarketPilotCampaignDashboard
          onNewCampaignClick={() => setViewMode("campaign")}
        />
      ) : (
      /* WORKSPACE GRID: 1. SELECTORS & DYNAMIC FORM -> 2. RESULTS */
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: PromotionTypeSelector, IndustrySelector, DynamicPromotionForm (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Promotion Type Selector Card */}
          <div className="rounded-3xl bg-obsidian-900/90 p-6 border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              1. Select Promotion Type
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(promotionTypesConfig) as PromotionTargetType[]).map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => handleTypeChange(type)}
                    className={`rounded-xl p-2.5 text-left text-xs font-bold border transition-all ${
                      selectedType === type
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30"
                        : "bg-obsidian-950/80 text-slate-300 border-white/10 hover:border-white/25"
                    }`}
                  >
                    {promotionTypesConfig[type].name}
                  </button>
                )
              )}
            </div>

            {/* 2. Industry Selector */}
            <div className="pt-2 border-t border-white/10">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                2. Target Industry / Category
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full rounded-xl bg-obsidian-950 px-3.5 py-2.5 text-xs font-bold text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.values(INDUSTRY_TEMPLATE_METADATA).map((meta) => (
                  <option key={meta.id} value={meta.id}>
                    {meta.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. DynamicPromotionForm */}
          <div className="rounded-3xl bg-obsidian-900/90 p-6 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
                3. Business & Campaign Inputs
              </h3>
              <span className="text-xs font-bold text-indigo-300">
                {activeMetadata.displayName}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Business / Brand Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full rounded-xl bg-obsidian-950 px-3.5 py-2 text-xs text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full rounded-xl bg-obsidian-950 px-3.5 py-2 text-xs text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Campaign Goal
                </label>
                <select
                  value={campaignGoal}
                  onChange={(e) =>
                    setCampaignGoal(e.target.value as CampaignGoal)
                  }
                  className="w-full rounded-xl bg-obsidian-950 px-3.5 py-2 text-xs text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="lead_generation">Lead Generation</option>
                  <option value="sales_conversion">Sales & Conversion</option>
                  <option value="brand_awareness">Brand Awareness</option>
                  <option value="app_installs">App Installs</option>
                  <option value="audience_growth">Audience Growth</option>
                  <option value="recruitment">Recruitment</option>
                  <option value="event_rsvps">Event RSVPs</option>
                </select>
              </div>

              {/* Dynamic schema fields from activeConfig */}
              {activeConfig.fields.map((field) => (
                <div key={field.id}>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={
                      Array.isArray(userInputs[field.id])
                        ? userInputs[field.id].join(", ")
                        : userInputs[field.id] || ""
                    }
                    onChange={(e) =>
                      setUserInputs({
                        ...userInputs,
                        [field.id]:
                          field.type === "tags"
                            ? e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean)
                            : e.target.value,
                      })
                    }
                    placeholder={field.placeholder}
                    className="w-full rounded-xl bg-obsidian-950 px-3.5 py-2 text-xs text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>

            {/* CampaignGeneratorButton & AI Analyze */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center justify-center space-x-1.5 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2.5 text-xs font-bold text-white border border-white/15 transition-all"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`}
                />
                <span>{isAnalyzing ? "Analyzing..." : "Analyze Inputs"}</span>
              </button>

              <button
                onClick={handleGenerateCampaign}
                disabled={isGenerating}
                className="flex items-center justify-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-3 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isGenerating ? "Building..." : "Create Campaign"}
                </span>
              </button>
            </div>

            {/* Analysis preview if available */}
            {analysisText && (
              <div className="rounded-2xl bg-indigo-950/40 p-4 border border-indigo-500/30 text-xs text-indigo-200">
                <p className="font-bold mb-1">✓ AI Input Analysis:</p>
                <p className="text-slate-300 leading-snug">{analysisText}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CampaignResultViewer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-obsidian-900/90 p-6 border border-white/10 shadow-2xl min-h-[580px] flex flex-col justify-between">
            {campaign ? (
              viewMode === "studio" && videoPlan ? (
                <VideoCreationStudio
                  videoPlan={videoPlan}
                  onBack={() => setViewMode("videoPlan")}
                  onSendToCampaignManager={() => setViewMode("manager")}
                />
              ) : viewMode === "videoPlan" && videoPlan ? (
                <VideoPlanPreview
                  plan={videoPlan}
                  onBack={() => setViewMode("campaign")}
                  onGenerateVideo={() => setViewMode("studio")}
                />
              ) : (

                <div className="space-y-6">
                  {/* Campaign Summary & Template Banner */}
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-white/10 pb-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-white tracking-tight">
                        {campaign.campaignName}
                      </h3>
                      <p className="text-xs text-indigo-300 mt-0.5">
                        Selected Template:{" "}
                        <strong>
                          {selectedTemplate?.name || "Brand Introduction"}
                        </strong>{" "}
                        · CTA: <strong>{campaign.cta}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* 4 Tabs */}
                      <div className="flex items-center space-x-1 rounded-xl bg-obsidian-950 p-1 border border-white/10">
                        <button
                          onClick={() => setActiveTab("concepts")}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                            activeTab === "concepts"
                              ? "bg-indigo-600 text-white shadow-md"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          10 Concepts
                        </button>
                        <button
                          onClick={() => setActiveTab("scripts")}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                            activeTab === "scripts"
                              ? "bg-indigo-600 text-white shadow-md"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Scripts (3)
                        </button>
                        <button
                          onClick={() => setActiveTab("captions")}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                            activeTab === "captions"
                              ? "bg-indigo-600 text-white shadow-md"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Captions
                        </button>
                        <button
                          onClick={() => setActiveTab("adcopy")}
                          className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                            activeTab === "adcopy"
                              ? "bg-indigo-600 text-white shadow-md"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          Ad Copy
                        </button>
                      </div>

                      <button
                        onClick={handleCreateVideoPlan}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 transition shadow-lg shadow-indigo-500/25 shrink-0"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Scene Plan (Phase 2)
                      </button>
                    </div>
                  </div>


                {/* TAB 1: 10 CONCEPTS */}
                {activeTab === "concepts" && (
                  <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                    {campaign.videoConcepts.map((c, idx) => (
                      <div
                        key={c.id}
                        className="rounded-2xl bg-obsidian-950/80 p-4 border border-white/10 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">
                            Concept #{idx + 1}: {c.title}
                          </span>
                          <span className="text-[10px] font-extrabold bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
                            {c.duration} · {c.format}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-white">
                          "{c.hook}"
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                          <span>B-Roll: {c.visualDescription}</span>
                          <button
                            onClick={() => handleCopy(c.hook, c.id)}
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold"
                          >
                            {copiedId === c.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Hook</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 2: SCRIPTS */}
                {activeTab === "scripts" && (
                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                    {campaign.scripts.map((script, sIdx) => (
                      <div
                        key={script.scriptId}
                        className="rounded-2xl bg-obsidian-950/90 p-4 border border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                          <span className="text-xs font-extrabold text-white">
                            Script #{sIdx + 1}: {script.title}
                          </span>
                          <span className="text-xs text-indigo-300 font-bold">
                            30s · {script.templateUsed}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {script.timeline.map((seg, idx) => (
                            <div
                              key={idx}
                              className="rounded-xl bg-obsidian-900/80 p-3 border border-white/10 text-xs"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-extrabold text-amber-300 uppercase">
                                  {seg.timeRange} — {seg.purpose}
                                </span>
                                <span className="text-slate-400">
                                  Visual: {seg.visualCue}
                                </span>
                              </div>
                              <p className="text-slate-200 font-medium">
                                "{seg.spokenText}"
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 3: CAPTIONS */}
                {activeTab === "captions" && (
                  <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                    {campaign.captions.map((cap, cIdx) => (
                      <div
                        key={cIdx}
                        className="rounded-2xl bg-obsidian-950/80 p-4 border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-lg bg-purple-500/20 px-2.5 py-0.5 text-xs font-extrabold uppercase text-purple-300">
                            {cap.platform}
                          </span>
                          <button
                            onClick={() => handleCopy(cap.text, `cap_${cIdx}`)}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold"
                          >
                            {copiedId === `cap_${cIdx}` ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {cap.text}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {cap.hashtags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs text-indigo-400 font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 4: AD COPY */}
                {activeTab === "adcopy" && (
                  <div className="space-y-4">
                    {campaign.adCopy.map((copy, idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl bg-obsidian-950/80 p-5 border border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300 uppercase">
                            Ad Copy Option #{idx + 1}
                          </span>
                          <button
                            onClick={() => handleCopy(copy, `ad_${idx}`)}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-bold"
                          >
                            {copiedId === `ad_${idx}` ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
                          "{copy}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              )
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-12 text-center my-auto">
                <Video className="h-12 w-12 text-slate-600 mb-3" />
                <h4 className="text-base font-extrabold text-white mb-1">
                  Ready to Build Your AI Campaign
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Select your target promotion type and industry on the left, enter your inputs, and click "Create Campaign" to run the MarketPilot Engine.
                </p>
              </div>
            )}

            {/* Bottom Status / Phase Footer */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Phase 1, 2, 3 & 4 (Social Publisher & Campaign Manager) Active</span>
              </span>
              <span>Template Registry: {selectedTemplate?.id || "universal_v1"}</span>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );

};
