"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SaaSPricingModal } from "@/components/studio/SaaSPricingModal";
import {
  ChevronDown,
  Sparkles,
  Bell,
  Settings,
  Layers,
  Eye,
  Share2,
  Video,
  Briefcase,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface HeaderProps {
  onOpenBrandKit: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBrandKit,
  activeTab,
  setActiveTab,
}) => {
  const {
    brands,
    activeBrandId,
    setActiveBrandId,
    workspaceMode,
    setWorkspaceMode,
    activeCreatorTab,
    setActiveCreatorTab,
    saasPlan,
  } = useAppStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const activeBrand =
    brands.find((b) => b.id === activeBrandId) || brands[0];

  const handleBrandSwitch = (id: string) => {
    setActiveBrandId(id);
    const brand = brands.find((b) => b.id === id);
    toast.success(`Switched workspace to ${brand?.name}`, {
      description: `Loaded ${brand?.defaultTone} AI persona and visual kit.`,
    });
    setDropdownOpen(false);
  };

  const handleModeSwitch = (mode: "business" | "seller") => {
    setWorkspaceMode(mode);
    if (mode === "business") {
      setActiveBrandId("manpower");
      setActiveCreatorTab("business");
      toast.success("Switched to Business Workspace", {
        description: "Manpower Corp, Urban Fitness & Dental Care unlocked.",
      });
    } else {
      setActiveBrandId("shopkeeper");
      setActiveCreatorTab("product");
      toast.success("Switched to Individual Seller Workspace", {
        description:
          "Shopkeeper, Product Seller, Freelancer & Creator studios active.",
      });
    }
  };

  const filteredBrands = brands.filter((b) => {
    if (workspaceMode === "business") {
      return ["manpower", "urban-fitness", "smileone"].includes(b.id);
    }
    return ["shopkeeper", "product-seller", "freelancer", "creator"].includes(
      b.id
    );
  });

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          {/* Left: Brand / Logo + Mode Switcher */}
          <div className="flex items-center space-x-4">
            <div
              onClick={() => setActiveTab("studio")}
              className="flex cursor-pointer items-center space-x-3 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-animated-gradient shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Video className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg font-bold tracking-tight text-slate-900">
                    Market Pilot AI
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200/60">
                    MULTIMODAL 2.0
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-500">
                  Enterprise & Individual AI Video SaaS
                </p>
              </div>
            </div>

            <div className="h-6 w-[1px] bg-slate-200 hidden md:block" />

            {/* Workspace Mode Pill Toggle (Business vs Individual Seller) */}
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <button
                onClick={() => handleModeSwitch("business")}
                className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  workspaceMode === "business"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Briefcase className="h-3 w-3" />
                <span className="hidden xl:inline">1. Business</span>
                <span className="xl:hidden">Business</span>
              </button>
              <button
                onClick={() => handleModeSwitch("seller")}
                className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  workspaceMode === "seller"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShoppingBag className="h-3 w-3" />
                <span className="hidden xl:inline">2. Individual Seller</span>
                <span className="xl:hidden">Seller</span>
              </button>
            </div>

            {/* Multi-Brand Switcher Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-left hover:border-slate-300 hover:bg-slate-100 transition-all shadow-2xs group"
              >
                <div
                  className="h-3 w-3 rounded-full shadow-inner ring-2 ring-black/10 shrink-0"
                  style={{ backgroundColor: activeBrand.primaryColor }}
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block leading-none">
                    {activeBrand.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                    {activeBrand.industry}
                  </span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 z-40 w-72 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-2xl p-2 shadow-2xl ring-1 ring-black/5">
                    <div className="px-3 py-2 border-b border-slate-200 mb-1 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {workspaceMode === "business"
                          ? "Business Workspaces"
                          : "Individual Seller Workspaces"}
                      </p>
                      <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700">
                        {workspaceMode.toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {filteredBrands.map((brand) => {
                        const isSelected = brand.id === activeBrandId;
                        return (
                          <button
                            key={brand.id}
                            onClick={() => handleBrandSwitch(brand.id)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition-all ${
                              isSelected
                                ? "bg-indigo-50 border border-indigo-200 text-indigo-900"
                                : "hover:bg-slate-100 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor: brand.primaryColor,
                                }}
                              />
                              <div>
                                <p className="text-xs font-bold">
                                  {brand.name}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {brand.industry}
                                </p>
                              </div>
                            </div>
                            {isSelected && (
                              <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700">
                                ACTIVE
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-slate-200 pt-1 mt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenBrandKit();
                        }}
                        className="flex w-full items-center justify-center space-x-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-slate-200 transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Configure Brand Kit Profile</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center/Right: Create Video Dashboard Option + Main Navigation Tabs */}
          <div className="flex items-center space-x-3">
            {/* Create Video Option Badge / Mode Switcher */}
            <div className="hidden lg:flex items-center space-x-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 px-2">
                Create Video:
              </span>
              <button
                onClick={() => {
                  setActiveTab("studio");
                  setActiveCreatorTab("business");
                  setWorkspaceMode("business");
                  setActiveBrandId("manpower");
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  activeCreatorTab === "business"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                [Business Video]
              </button>
              <button
                onClick={() => {
                  setActiveTab("studio");
                  setActiveCreatorTab("product");
                  setWorkspaceMode("seller");
                  setActiveBrandId("shopkeeper");
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  activeCreatorTab === "product"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                [Product Video]
              </button>
            </div>

            {/* Main Navigation Tabs */}
            <nav className="flex items-center space-x-1 rounded-2xl border border-slate-200 bg-slate-100/80 p-1">
              {[
                {
                  id: "studio" as const,
                  label: "Studio",
                  icon: Layers,
                  badge:
                    activeCreatorTab === "product" ? "MODULE 6" : "AUTO-EDIT",
                },
                {
                  id: "inspector" as const,
                  label: "Vision",
                  icon: Eye,
                  badge: "NEW",
                },
                {
                  id: "publisher" as const,
                  label: "Publisher",
                  icon: Share2,
                  badge: "MULTI-CH",
                },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-white text-indigo-700 shadow-md ring-1 ring-slate-200"
                        : "text-slate-600 hover:bg-white/50 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 ${
                        isActive ? "text-indigo-600" : "text-slate-400"
                      }`}
                    />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                          isActive
                            ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* SaaS Pricing Tier Button (Monetization ready) */}
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="flex items-center space-x-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
              <span>{saasPlan} Plan</span>
              <span className="hidden sm:inline text-[10px] text-emerald-600 font-semibold">
                ({saasPlan === "Free" ? "5 vids/mo" : "Active"})
              </span>
            </button>

            {/* Brand Kit Profile Settings */}
            <button
              onClick={onOpenBrandKit}
              className="flex items-center space-x-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
            >
              <Settings className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden xl:inline">Brand Kit</span>
            </button>
          </div>
        </div>
      </header>

      {/* SaaS Pricing Modal */}
      <SaaSPricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </>
  );
};
