"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BrandKitModal } from "@/components/brand/BrandKitModal";
import { MultimodalDropzone } from "@/components/studio/MultimodalDropzone";
import { VisionInspectorDrawer } from "@/components/studio/VisionInspectorDrawer";
import { CompositorModeSelector } from "@/components/studio/CompositorModeSelector";
import { SessionChatSidepanel } from "@/components/studio/SessionChatSidepanel";
import { ProductVideoCreator } from "@/components/studio/ProductVideoCreator";
import { PromotionWorkflowSelector } from "@/components/studio/PromotionWorkflowSelector";
import { BrandPromotionCreator } from "@/components/studio/BrandPromotionCreator";
import { RenderProgressModal } from "@/components/rendering/RenderProgressModal";
import { HybridVideoPlayer } from "@/components/studio/HybridVideoPlayer";
import { SocialPublisher } from "@/components/social/SocialPublisher";
import {
  Sparkles,
  ShieldCheck,
  Video,
  Layers,
  Calendar,
  CheckCircle2,
  Wand2,
  Briefcase,
  ShoppingBag,
  Globe,
  Smartphone,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>("studio");
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isRenderModalOpen, setIsRenderModalOpen] = useState(false);

  const {
    selectedMedia,
    activeBrandId,
    setActiveBrandId,
    brands,
    currentScript,
    compositorMode,
    activeCreatorTab,
    setActiveCreatorTab,
    workspaceMode,
    setWorkspaceMode,
    activePromotionType,
  } = useAppStore();

  const activeBrand =
    brands.find((b) => b.id === activeBrandId) || brands[0];

  const handleTriggerRender = () => {
    if (!selectedMedia && activeCreatorTab === "business") {
      toast.error("No workplace media selected!", {
        description:
          "Please upload an MP4/PNG or select a 1-click sample workplace video from the gallery.",
      });
      return;
    }
    setIsRenderModalOpen(true);
  };

  const handleRenderComplete = () => {
    setIsRenderModalOpen(false);
    setActiveTab("player");
    toast.success("Hybrid Video Reel Rendered!", {
      description: `Loaded ${
        compositorMode === "pip" ? "Picture-in-Picture" : "Alternating Cuts"
      } mode with karaoke subtitles and ${activeBrand.name} logo overlay.`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Header */}
      <Header
        onOpenBrandKit={() => setIsBrandModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Container: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => setActiveTab(tab)}
          onOpenBrandKit={() => setIsBrandModalOpen(true)}
        />

        {/* Right Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* MODULE 7: All-in-One Promotion Workflow Selector Banner (When on Studio tab) */}
            {activeTab === "studio" && <PromotionWorkflowSelector />}

            {/* Top Status Notification Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <p className="text-xs font-semibold text-slate-600">
                  Active Brand Context:{" "}
                  <span className="text-slate-900 font-bold">
                    {activeBrand.name}
                  </span>{" "}
                  · Multimodal Action Recognition:{" "}
                  <span className="text-emerald-600 font-bold">ONLINE</span>
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => setIsBrandModalOpen(true)}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 font-bold text-indigo-700 border border-slate-200 transition-colors"
                >
                  Configure Persona & Brand Kit
                </button>
                <button
                  onClick={handleTriggerRender}
                  className="flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 px-3.5 py-1.5 font-bold text-white shadow-md hover:from-indigo-700 hover:to-emerald-700 transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Quick Render Reel</span>
                </button>
              </div>
            </div>

            {/* TAB 1: STUDIO (Business Enterprise vs Module 6 Product vs Module 7 Brand Promotion) */}
            {activeTab === "studio" && (
              <>
                {activePromotionType === "business" ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 columns: Multimodal Dropzone + Compositor Mode Switcher */}
                    <div className="lg:col-span-2 space-y-6">
                      <MultimodalDropzone
                        onInspectVision={() => setActiveTab("vision")}
                      />

                      <div className="rounded-3xl border border-slate-700/80 bg-obsidian-900/90 p-6 shadow-xl">
                        <CompositorModeSelector
                          onTriggerRender={handleTriggerRender}
                        />
                      </div>
                    </div>

                    {/* Right 1 column: Multi-turn Session Chat Sidepanel */}
                    <div className="h-[740px] lg:h-auto">
                      <SessionChatSidepanel
                        onSelectScriptVersion={(script) => {
                          toast.success(
                            `Restored script version: "${script.title}"`
                          );
                        }}
                      />
                    </div>
                  </div>
                ) : activePromotionType === "product" ? (
                  <ProductVideoCreator />
                ) : (
                  <BrandPromotionCreator />
                )}
              </>
            )}

            {/* TAB 2: VISION INSPECTOR (AI Video Scrubber & Action Detector) */}
            {activeTab === "vision" && (
              <div className="space-y-6">
                <VisionInspectorDrawer
                  onApplyToScript={(kf) => {
                    toast.success(
                      `Synchronized keyframe 0:0${kf.timestamp}s to active script!`
                    );
                  }}
                />

                {/* Return button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setActiveTab("studio")}
                    className="flex items-center space-x-2 rounded-xl bg-slate-800 border border-slate-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-all"
                  >
                    <span>← Return to Studio & Compositor</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: HYBRID PLAYER (Simulated PiP/Alternating Cuts & Subtitle Studio) */}
            {activeTab === "player" && (
              <HybridVideoPlayer
                onSchedulePost={() => setActiveTab("social")}
                onBackToStudio={() => setActiveTab("studio")}
              />
            )}

            {/* TAB 4: SOCIAL (Multi-Channel Publisher & Calendar) */}
            {activeTab === "social" && <SocialPublisher />}
          </div>
        </main>
      </div>

      {/* Brand Kit Modal */}
      <BrandKitModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
      />

      {/* Asynchronous Rendering Progress Modal */}
      <RenderProgressModal
        isOpen={isRenderModalOpen}
        onComplete={handleRenderComplete}
        onClose={() => setIsRenderModalOpen(false)}
      />
    </div>
  );
}
