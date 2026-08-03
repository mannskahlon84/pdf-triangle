"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  Smartphone,
  Share2,
  Utensils,
  Store,
  Video,
  Sparkles,
  Play,
  Pause,
  Calendar,
  Lightbulb,
  MessageSquare,
  Hash,
  Copy,
  Check,
  Zap,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  Send,
  Upload,
  CheckCircle2,
  TrendingUp,
  Award,
  Clock,
  ExternalLink,
  Layers,
  Building2,
  Package,
  Home,
  Palmtree,
  Dumbbell,
  GraduationCap,
  Scissors,
  Stethoscope,
  Users,
  Briefcase,
  Film,
  Target,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import {
  PromotionTargetType,
  PromotionVideoTemplateType,
  PromotionVideoTimelineSegment,
} from "@/types/database";
import { promotionTypesConfig } from "@/config/promotionTypes.config";
import { PROMOTION_TEMPLATES_CONFIG } from "@/config/promotion-templates";

export const BrandPromotionCreator: React.FC = () => {
  const {
    activePromotionType,
    promotionCampaigns,
    activeCampaignId,
    setActiveCampaignId,
    updatePromotionCampaign,
  } = useAppStore();

  // Dynamic template schema from our 15-industry library
  const currentSchema =
    promotionTypesConfig[activePromotionType] || promotionTypesConfig.website;

  const activeCampaign =
    promotionCampaigns.find((c) => c.id === activeCampaignId) ||
    promotionCampaigns.find((c) => c.targetType === activePromotionType) ||
    promotionCampaigns[0];

  const [selectedTemplate, setSelectedTemplate] = useState<PromotionVideoTemplateType>(
    activeCampaign?.template || currentSchema.defaultTemplate
  );
  const [selectedVideoStyle, setSelectedVideoStyle] = useState<string>(
    currentSchema.videoStyles[0] || "Cinematic Modern"
  );
  const [selectedCta, setSelectedCta] = useState<string>(
    currentSchema.ctaOptions[0] || "Learn More Today"
  );

  const [activeTab, setActiveTab] = useState<
    "calendar" | "ideas" | "captions" | "adcopy"
  >("calendar");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(6);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Scalable dynamic form data
  const [formData, setFormData] = useState<Record<string, any>>({
    url:
      activeCampaign?.inputData?.websiteUrl ||
      activeCampaign?.inputData?.downloadLink ||
      activeCampaign?.inputData?.socialProfileUrl ||
      "",
    category:
      activeCampaign?.inputData?.businessCategory ||
      activeCampaign?.inputData?.appName ||
      activeCampaign?.inputData?.location ||
      "",
    audience:
      activeCampaign?.inputData?.targetAudience ||
      activeCampaign?.inputData?.offers ||
      "",
    benefits:
      activeCampaign?.inputData?.mainBenefits ||
      activeCampaign?.inputData?.appFeatures ||
      activeCampaign?.inputData?.restaurantMenu ||
      currentSchema.fields.find((f) => f.id === "benefits")?.defaultTags ||
      [],
  });

  const [newTagInput, setNewTagInput] = useState("");

  // Synchronize when the user switches industry in the selector
  useEffect(() => {
    setSelectedTemplate(
      activeCampaign?.template || currentSchema.defaultTemplate
    );
    setSelectedVideoStyle(
      currentSchema.videoStyles[0] || "Cinematic Modern"
    );
    setSelectedCta(currentSchema.ctaOptions[0] || "Learn More Today");

    const schemaBenefits =
      currentSchema.fields.find((f) => f.id === "benefits")?.defaultTags || [];
    setFormData({
      url:
        activeCampaign?.inputData?.websiteUrl ||
        activeCampaign?.inputData?.downloadLink ||
        activeCampaign?.inputData?.socialProfileUrl ||
        "",
      category:
        activeCampaign?.inputData?.businessCategory ||
        activeCampaign?.inputData?.appName ||
        activeCampaign?.inputData?.location ||
        currentSchema.name,
      audience:
        activeCampaign?.inputData?.targetAudience ||
        activeCampaign?.inputData?.offers ||
        "",
      benefits:
        activeCampaign?.inputData?.mainBenefits ||
        activeCampaign?.inputData?.appFeatures ||
        activeCampaign?.inputData?.restaurantMenu ||
        schemaBenefits,
    });
  }, [activePromotionType, activeCampaignId]);

  const ENGINE_STEPS = [
    "1. Input Understanding",
    "2. Audience Analysis",
    "3. Marketing Strategy",
    "4. Script Generation",
    "5. Video Creation",
    "6. Social Publishing",
  ];

  const handleRunMarketingEngine = () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => {
        if (prev >= 6) {
          clearInterval(stepInterval);
          setIsAnalyzing(false);

          if (activeCampaign) {
            const tplConfig =
              PROMOTION_TEMPLATES_CONFIG[selectedTemplate] ||
              PROMOTION_TEMPLATES_CONFIG["Brand Introduction"];

            const newTimeline: PromotionVideoTimelineSegment[] =
              tplConfig.structure.map((s) => ({
                startSec: parseInt(s.time.split("-")[0]) || 0,
                endSec: parseInt(s.time.split("-")[1]) || 30,
                title: `${s.time} sec: ${s.purpose}`,
                content: s.instruction,
                badge: s.purpose.toUpperCase(),
              }));

            updatePromotionCampaign(activeCampaign.id, {
              template: selectedTemplate,
              timelineStructure: newTimeline,
            });
          }
          return 6;
        }
        return prev + 1;
      });
    }, 400);
  };

  const handleGeneratePromoVideo = () => {
    setIsGeneratingVideo(true);
    setVideoProgress(0);

    const interval = setInterval(() => {
      setVideoProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGeneratingVideo(false);
          setIsPlaying(true);
          if (activeCampaign) {
            updatePromotionCampaign(activeCampaign.id, {
              generatedVideoUrl:
                "https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-leather-bag-43407-large.mp4",
            });
          }
          return 100;
        }
        return prev + 10;
      });
    }, 250);
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getTargetIcon = (type: PromotionTargetType) => {
    switch (type) {
      case "website":
        return <Globe className="h-6 w-6 text-indigo-400" />;
      case "app":
        return <Smartphone className="h-6 w-6 text-purple-400" />;
      case "social-profile":
        return <Share2 className="h-6 w-6 text-pink-400" />;
      case "restaurant":
        return <Utensils className="h-6 w-6 text-amber-400" />;
      case "shop":
        return <Store className="h-6 w-6 text-emerald-400" />;
      case "creator-channel":
        return <Video className="h-6 w-6 text-cyan-400" />;
      case "real-estate":
        return <Home className="h-6 w-6 text-indigo-400" />;
      case "hotel-hospitality":
        return <Palmtree className="h-6 w-6 text-amber-400" />;
      case "fitness-gym":
        return <Dumbbell className="h-6 w-6 text-red-400" />;
      case "education":
        return <GraduationCap className="h-6 w-6 text-blue-400" />;
      case "salon-beauty":
        return <Scissors className="h-6 w-6 text-pink-400" />;
      case "healthcare":
        return <Stethoscope className="h-6 w-6 text-emerald-400" />;
      case "recruitment":
        return <Users className="h-6 w-6 text-purple-400" />;
      case "freelancer-personal-brand":
        return <Briefcase className="h-6 w-6 text-amber-400" />;
      default:
        return <Building2 className="h-6 w-6 text-indigo-400" />;
    }
  };

  const tplConfig =
    PROMOTION_TEMPLATES_CONFIG[selectedTemplate] ||
    PROMOTION_TEMPLATES_CONFIG["Brand Introduction"];

  const currentTimeline: PromotionVideoTimelineSegment[] =
    tplConfig.structure.map((s) => ({
      startSec: parseInt(s.time.split("-")[0]) || 0,
      endSec: parseInt(s.time.split("-")[1]) || 30,
      title: `${s.time} sec: ${s.purpose}`,
      content: s.instruction,
      badge: s.purpose.toUpperCase(),
    }));

  return (
    <div className="w-full space-y-8 pb-16">
      {/* 1. INDUSTRY HEADER & TEMPLATE SELECTOR BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-obsidian-900/80 p-6 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30">
            {getTargetIcon(activePromotionType)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {currentSchema.industryName}
              </h2>
              <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
                UNIVERSAL AI ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {currentSchema.description}
            </p>
          </div>
        </div>

        {/* Dynamic Template & Style Pickers */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">
              Template:
            </span>
            <select
              value={selectedTemplate}
              onChange={(e) =>
                setSelectedTemplate(
                  e.target.value as PromotionVideoTemplateType
                )
              }
              className="rounded-xl bg-obsidian-950 px-3 py-2 text-xs font-bold text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {currentSchema.availableTemplates.map((tpl) => (
                <option key={tpl} value={tpl}>
                  {tpl}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">
              Style:
            </span>
            <select
              value={selectedVideoStyle}
              onChange={(e) => setSelectedVideoStyle(e.target.value)}
              className="rounded-xl bg-obsidian-950 px-3 py-2 text-xs font-bold text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {currentSchema.videoStyles.map((style, i) => (
                <option key={i} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. AI MARKETING ENGINE PIPELINE BAR */}
      <div className="rounded-3xl bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 p-6 border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              AI Promotion Engine Pipeline
            </h3>
            <span className="text-xs text-slate-400">
              ({selectedTemplate} · {selectedVideoStyle})
            </span>
          </div>
          <button
            onClick={handleRunMarketingEngine}
            disabled={isAnalyzing}
            className="flex items-center space-x-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isAnalyzing ? "animate-spin" : ""}`}
            />
            <span>
              {isAnalyzing
                ? "Analyzing Industry Inputs..."
                : "Run AI Promotion Engine"}
            </span>
          </button>
        </div>

        {/* 6 Stage Progress Flow */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {ENGINE_STEPS.map((stepName, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum <= analysisStep;
            const isCurrent = stepNum === analysisStep && isAnalyzing;

            return (
              <div
                key={stepName}
                className={`flex flex-col items-center justify-center rounded-2xl p-3 text-center border transition-all ${
                  isCompleted
                    ? "bg-indigo-900/30 border-indigo-500/40 text-indigo-200"
                    : isCurrent
                    ? "bg-amber-500/20 border-amber-400 text-amber-200 animate-pulse"
                    : "bg-obsidian-900/40 border-white/5 text-slate-500"
                }`}
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Clock className="h-4 w-4 text-slate-500" />
                  )}
                  <span className="text-[11px] font-extrabold">
                    Step {stepNum}
                  </span>
                </div>
                <span className="text-xs font-semibold truncate w-full">
                  {stepName.replace(/^[0-9]+\.\s*/, "")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: SCALABLE DYNAMIC FORM & VIDEO CREATOR vs CAMPAIGN STRATEGY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Template-Driven Input Layer & Video Reel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scalable Input Layer Form Card */}
          <div className="rounded-3xl bg-obsidian-900/90 p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Industry Input Schema
              </h3>
              <span className="text-xs font-bold text-indigo-300">
                {currentSchema.name}
              </span>
            </div>

            {/* DYNAMIC FORM FIELDS */}
            <div className="space-y-4">
              {currentSchema.fields.map((field) => {
                if (field.type === "tags") {
                  const currentTags = Array.isArray(formData[field.id])
                    ? formData[field.id]
                    : field.defaultTags || [];

                  return (
                    <div key={field.id}>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        {field.label}
                      </label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {currentTags.map((tag: string, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center space-x-1.5 rounded-xl bg-obsidian-950 px-3 py-1.5 border border-white/10 text-xs text-slate-200"
                            >
                              <span className="truncate max-w-[200px]">
                                {tag}
                              </span>
                              <button
                                onClick={() => {
                                  const updated = currentTags.filter(
                                    (_: string, i: number) => i !== idx
                                  );
                                  setFormData({
                                    ...formData,
                                    [field.id]: updated,
                                  });
                                }}
                                className="text-slate-500 hover:text-red-400"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newTagInput}
                            onChange={(e) => setNewTagInput(e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full rounded-xl bg-obsidian-950 px-3 py-2 text-xs text-white border border-white/15 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              if (!newTagInput.trim()) return;
                              setFormData({
                                ...formData,
                                [field.id]: [
                                  ...currentTags,
                                  newTagInput.trim(),
                                ],
                              });
                              setNewTagInput("");
                            }}
                            className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={field.id}>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      {field.label}
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type={field.type === "url" ? "text" : field.type}
                        value={formData[field.id] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.id]: e.target.value,
                          })
                        }
                        placeholder={field.placeholder}
                        className="w-full rounded-xl bg-obsidian-950 px-3.5 py-2.5 text-xs text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {field.type === "url" && (
                        <a
                          href={formData[field.id] || "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    {field.helperText && (
                      <p className="text-[11px] text-slate-400 mt-1">
                        {field.helperText}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Dynamic CTA Selector from Industry Config */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  CTA Strategy / Call to Action
                </label>
                <select
                  value={selectedCta}
                  onChange={(e) => setSelectedCta(e.target.value)}
                  className="w-full rounded-xl bg-obsidian-950 px-3.5 py-2.5 text-xs text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {currentSchema.ctaOptions.map((cta, i) => (
                    <option key={i} value={cta}>
                      {cta}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 4. PROMOTION VIDEO PLAYER & TEMPLATE TIMELINE BLUEPRINT */}
          <div className="rounded-3xl bg-obsidian-900/90 p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Video className="h-4 w-4 text-indigo-400" />
                <span>{selectedTemplate} Reel</span>
              </h3>
              <span className="text-xs font-bold text-slate-400">
                9:16 Vertical · 30s
              </span>
            </div>

            {/* Video Viewport / Simulated Rendering */}
            <div className="relative aspect-[9/16] w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-obsidian-950 border border-white/15 shadow-2xl mb-4 group">
              {isGeneratingVideo ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-obsidian-950/95 p-6 text-center z-20">
                  <Sparkles className="h-10 w-10 text-indigo-400 animate-spin mb-3" />
                  <span className="text-sm font-bold text-white mb-2">
                    Rendering {selectedTemplate}...
                  </span>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden mb-1">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400">{videoProgress}%</span>
                </div>
              ) : activeCampaign?.generatedVideoUrl ? (
                <>
                  <video
                    src={activeCampaign.generatedVideoUrl}
                    className="h-full w-full object-cover"
                    loop
                    muted
                    autoPlay={isPlaying}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950/80 via-transparent to-transparent pointer-events-none" />

                  {/* On-Screen Promotion Hook Overlay */}
                  <div className="absolute bottom-6 left-4 right-4 text-center z-10 space-y-1">
                    <span className="inline-block rounded-lg bg-indigo-600/90 backdrop-blur-md px-3 py-1.5 text-xs font-extrabold text-white shadow-lg border border-white/20">
                      {currentTimeline[0]?.content || currentSchema.exampleHook}
                    </span>
                    <span className="block text-[10px] font-bold text-amber-300">
                      CTA: {selectedCta}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isPlaying ? (
                      <Pause className="h-12 w-12 text-white" />
                    ) : (
                      <Play className="h-12 w-12 text-white" />
                    )}
                  </button>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <Video className="h-10 w-10 text-slate-600 mb-2" />
                  <span className="text-xs font-bold text-slate-400">
                    No video generated yet
                  </span>
                </div>
              )}
            </div>

            {/* Template-Driven Timeline Blueprint */}
            <div className="space-y-2 mb-4">
              {currentTimeline.map((seg, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-obsidian-950/80 p-3 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-indigo-300">
                      {seg.title}
                    </span>
                    <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      {seg.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">
                    "{seg.content}"
                  </p>
                </div>
              ))}
            </div>

            {/* Render & Publish Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleGeneratePromoVideo}
                disabled={isGeneratingVideo}
                className="flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-4 py-3 text-xs font-extrabold text-white shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>
                  {isGeneratingVideo ? "Rendering..." : "Generate Promo Reel"}
                </span>
              </button>

              <button
                onClick={() =>
                  alert(
                    `Published ${selectedTemplate} reel with CTA "${selectedCta}" to Instagram & TikTok!`
                  )
                }
                className="flex items-center justify-center space-x-2 rounded-xl bg-white/10 hover:bg-white/15 px-4 py-3 text-xs font-extrabold text-white border border-white/20 transition-all"
              >
                <Send className="h-4 w-4 text-emerald-400" />
                <span>Publish Reel</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Campaign Builder Dashboard (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-obsidian-900/90 p-6 border border-white/10 shadow-2xl">
            {/* Campaign Header & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-white/10">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  {activeCampaign?.aiCampaignPlan?.campaignName ||
                    `${currentSchema.industryName} Complete Strategy`}
                </h3>
                <p className="text-xs text-indigo-300 mt-0.5 flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>
                    Template:{" "}
                    <strong>
                      {selectedTemplate} ({tplConfig.scriptPattern})
                    </strong>
                  </span>
                </p>
              </div>

              {/* 4 Dashboard Tabs */}
              <div className="flex items-center space-x-1 rounded-xl bg-obsidian-950 p-1 border border-white/10">
                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === "calendar"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={() => setActiveTab("ideas")}
                  className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === "ideas"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>10 Ideas</span>
                </button>
                <button
                  onClick={() => setActiveTab("captions")}
                  className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === "captions"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Captions</span>
                </button>
                <button
                  onClick={() => setActiveTab("adcopy")}
                  className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    activeTab === "adcopy"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>Ad Copy</span>
                </button>
              </div>
            </div>

            {/* TAB 1: CONTENT CALENDAR */}
            {activeTab === "calendar" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    Posting Schedule & Format
                  </h4>
                  <span className="text-xs text-emerald-400 font-semibold">
                    ✓ Multi-platform optimized
                  </span>
                </div>
                <div className="space-y-3">
                  {(activeCampaign?.aiCampaignPlan?.contentCalendar || []).map(
                    (item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl bg-obsidian-950/80 p-4 border border-white/10 hover:border-indigo-500/40 transition-all"
                      >
                        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                          <span className="rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-black text-indigo-300">
                            {item.day}
                          </span>
                          <div>
                            <h5 className="text-sm font-bold text-white">
                              {item.topic}
                            </h5>
                            <span className="text-xs text-slate-400">
                              Format: {item.format}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold text-white self-start sm:self-center">
                          {item.platform}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: 10 VIDEO IDEAS */}
            {activeTab === "ideas" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    AI Generated Video Hooks & Concepts
                  </h4>
                  <span className="text-xs text-indigo-300 font-semibold">
                    10 Viral Angles
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(activeCampaign?.aiCampaignPlan?.videoIdeas || []).map(
                    (idea, i) => (
                      <div
                        key={i}
                        className="rounded-2xl bg-obsidian-950/80 p-4 border border-white/10 hover:border-indigo-500/40 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400">
                            Idea #{i + 1}: {idea.title}
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-400 bg-white/10 rounded px-1.5 py-0.5">
                            {idea.duration}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-white">
                          "{idea.hook}"
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                          <span>Format: {idea.format}</span>
                          <button
                            onClick={() => handleCopyText(idea.hook, i)}
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            {copiedIndex === i ? (
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
                    )
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: 10 CAPTIONS & HASHTAG STRATEGY */}
            {activeTab === "captions" && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-3">
                    Social Media Captions (Ready to Post)
                  </h4>
                  <div className="space-y-3">
                    {(activeCampaign?.aiCampaignPlan?.captions || []).map(
                      (cap, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl bg-obsidian-950/80 p-4 border border-white/10 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="rounded-lg bg-purple-500/20 px-2.5 py-0.5 text-xs font-extrabold uppercase text-purple-300">
                              {cap.platform}
                            </span>
                            <button
                              onClick={() =>
                                handleCopyText(cap.text, idx + 100)
                              }
                              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                            >
                              {copiedIndex === idx + 100 ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Copy Caption</span>
                                </>
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {cap.text}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {cap.hashtags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-xs text-indigo-400 font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Hashtag Strategy Box */}
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-2">
                    Viral Hashtag Strategy
                  </h4>
                  <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-obsidian-950 border border-white/10">
                    {(
                      activeCampaign?.aiCampaignPlan?.hashtagStrategy || []
                    ).map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-xl bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 text-xs font-bold text-indigo-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: AD COPY */}
            {activeTab === "adcopy" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
                    High-Converting Ad Copy
                  </h4>
                  <button
                    onClick={() =>
                      handleCopyText(
                        activeCampaign?.aiCampaignPlan?.adCopy || "",
                        999
                      )
                    }
                    className="flex items-center space-x-1.5 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-1.5 text-xs font-bold text-white border border-white/10"
                  >
                    {copiedIndex === 999 ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Copied Ad Copy</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Ad Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-2xl bg-obsidian-950 p-6 border border-white/10">
                  <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
                    "{activeCampaign?.aiCampaignPlan?.adCopy}"
                  </p>
                </div>

                <div className="rounded-2xl bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-4 border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-extrabold text-white">
                      Want to schedule this ad automatically?
                    </h5>
                    <p className="text-xs text-slate-300">
                      Our multi-platform scheduler posts reels at peak audience
                      engagement times.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      alert("Scheduled ad reel for publish tomorrow at 10:30 AM!")
                    }
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all"
                  >
                    Schedule Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
