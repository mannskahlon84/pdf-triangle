"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";
import { SaaSPricingTier } from "@/types/database";
import {
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  X,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface SaaSPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRICING_PLANS: {
  tier: SaaSPricingTier;
  price: string;
  period: string;
  tagline: string;
  badge?: string;
  features: string[];
  recommended?: boolean;
}[] = [
  {
    tier: "Free",
    price: "$0",
    period: "/month",
    tagline: "Consumer-friendly starter pack for casual creators & solo shopkeepers.",
    features: [
      "5 AI marketing videos / month",
      "Upload multiple product photos & angles",
      "15s social media reel generation",
      "Instagram & TikTok AI caption generator",
      "Standard 720p HD exports",
    ],
  },
  {
    tier: "Starter",
    price: "$29",
    period: "/month",
    tagline: "For active shopkeepers, D2C sellers & online stores scaling video ads.",
    badge: "MOST POPULAR",
    recommended: true,
    features: [
      "50 AI marketing videos / month",
      "Multi-angle product video templates",
      "AI Sales Assistant & Pricing Psychology",
      "1080p Full HD exports + zero watermark",
      "Direct publishing to Instagram & TikTok",
      "Save up to 25 products in catalog",
    ],
  },
  {
    tier: "Business",
    price: "$79",
    period: "/month",
    tagline: "Unlimited product video ads for high-volume e-commerce brands.",
    badge: "BEST VALUE",
    features: [
      "Unlimited video generations / month",
      "Unlimited product catalog items & angles",
      "4K Ultra-HD hybrid video rendering",
      "Custom AI avatar host voice cloning",
      "AI Seasonal Campaign & Discount generator",
      "Priority GPU render queue",
    ],
  },
  {
    tier: "Enterprise",
    price: "Custom",
    period: "/year",
    tagline: "Dedicated team workspaces, custom brand kits & API integration.",
    badge: "ENTERPRISE",
    features: [
      "Everything in Business plan",
      "Multi-user Team Workspace with roles",
      "Custom Brand Kit & SSO compliance",
      "Dedicated account manager & SLA",
      "API access for automated catalog video reels",
      "Custom OCR & industry terminology training",
    ],
  },
];

export const SaaSPricingModal: React.FC<SaaSPricingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { saasPlan, setSaaSPlan } = useAppStore();

  if (!isOpen) return null;

  const handleSelectPlan = (tier: SaaSPricingTier) => {
    setSaaSPlan(tier);
    toast.success(`Upgraded to ${tier} SaaS Plan!`, {
      description:
        tier === "Free"
          ? "5 videos/month unlocked for individual seller product videos."
          : tier === "Starter"
          ? "50 videos/month + AI Sales Assistant now active."
          : tier === "Business"
          ? "Unlimited products & 4K GPU rendering enabled."
          : "Enterprise team workspace & custom brand API activated.",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-5 mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                MODULE 6 MONETIZATION READY
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                Current Plan: {saasPlan}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
              Flexible SaaS Pricing for Individual Sellers & Enterprise Teams
            </h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Create professional social media videos from product photos without video editing skills.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRICING_PLANS.map((plan) => {
            const isCurrent = saasPlan === plan.tier;
            return (
              <div
                key={plan.tier}
                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                  plan.recommended
                    ? "border-indigo-500 bg-indigo-50/20 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 right-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        plan.recommended
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black text-slate-900">
                      {plan.tier}
                    </h3>
                  </div>
                  <div className="flex items-baseline space-x-1 mb-2">
                    <span className="text-3xl font-black text-slate-900">
                      {plan.price}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium min-h-[36px] mb-4">
                    {plan.tagline}
                  </p>

                  <div className="space-y-2.5 border-t border-slate-100 pt-4 mb-6">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-slate-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan.tier)}
                  disabled={isCurrent}
                  className={`w-full rounded-xl py-2.5 px-4 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                    isCurrent
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                      : plan.recommended
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Current Active Plan</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Switch to {plan.tier}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Guarantee */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-emerald-600 font-bold">
              <Check className="h-4 w-4 mr-1" />
              Zero-Glitch Quality Guarantee
            </span>
            <span className="hidden sm:inline">•</span>
            <span>No video editing skills required</span>
            <span className="hidden sm:inline">•</span>
            <span>Cancel anytime</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline mt-2 sm:mt-0"
          >
            Close & Return to Video Studio
          </button>
        </div>
      </div>
    </div>
  );
};
