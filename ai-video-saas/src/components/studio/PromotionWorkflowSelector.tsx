"use client";

import React, { useState } from "react";
import {
  Building2,
  Package,
  Globe,
  Smartphone,
  Share2,
  Utensils,
  Store,
  Video,
  Sparkles,
  Home,
  Palmtree,
  Dumbbell,
  GraduationCap,
  Scissors,
  Stethoscope,
  Users,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { PromotionTargetType } from "@/types/database";

interface PromotionOption {
  id: PromotionTargetType;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  category: "core" | "industry" | "creator";
  description: string;
}

const PROMOTION_OPTIONS: PromotionOption[] = [
  {
    id: "business",
    label: "Business",
    icon: <Building2 className="h-4 w-4" />,
    category: "core",
    description: "Companies, startups, agencies & services",
  },
  {
    id: "product",
    label: "Product",
    icon: <Package className="h-4 w-4" />,
    category: "core",
    description: "Online sellers, retailers & e-commerce",
  },
  {
    id: "website",
    label: "Website",
    icon: <Globe className="h-4 w-4" />,
    badge: "AI URL",
    category: "core",
    description: "SaaS platforms & online services",
  },
  {
    id: "app",
    label: "Mobile App",
    icon: <Smartphone className="h-4 w-4" />,
    badge: "VIRAL",
    category: "core",
    description: "iOS & Android app installs & demo",
  },
  {
    id: "social-profile",
    label: "Social Profile",
    icon: <Share2 className="h-4 w-4" />,
    category: "creator",
    description: "Instagram, TikTok & YouTube growth",
  },
  {
    id: "creator-channel",
    label: "Creator Channel",
    icon: <Video className="h-4 w-4" />,
    badge: "NEW",
    category: "creator",
    description: "Hooks, Shorts scripts & subscriber conversion",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: <Utensils className="h-4 w-4" />,
    category: "industry",
    description: "Restaurants, cafes, food trucks & bakeries",
  },
  {
    id: "shop",
    label: "Shop & Boutique",
    icon: <Store className="h-4 w-4" />,
    category: "industry",
    description: "Retail shops, boutiques & local stores",
  },
  {
    id: "real-estate",
    label: "Real Estate",
    icon: <Home className="h-4 w-4" />,
    badge: "LUXURY",
    category: "industry",
    description: "Property developers, agents & brokers",
  },
  {
    id: "hotel-hospitality",
    label: "Hotel & Hospitality",
    icon: <Palmtree className="h-4 w-4" />,
    category: "industry",
    description: "Hotels, resorts, villas & travel offers",
  },
  {
    id: "fitness-gym",
    label: "Fitness & Gym",
    icon: <Dumbbell className="h-4 w-4" />,
    category: "industry",
    description: "Gyms, trainers, transformations & challenges",
  },
  {
    id: "education",
    label: "Education",
    icon: <GraduationCap className="h-4 w-4" />,
    category: "industry",
    description: "Schools, bootcamps, courses & institutes",
  },
  {
    id: "salon-beauty",
    label: "Salon & Beauty",
    icon: <Scissors className="h-4 w-4" />,
    category: "industry",
    description: "Salons, spas, beauty pros & transformations",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    icon: <Stethoscope className="h-4 w-4" />,
    category: "industry",
    description: "Clinics, doctors & wellness centers",
  },
  {
    id: "recruitment",
    label: "Recruitment",
    icon: <Users className="h-4 w-4" />,
    category: "industry",
    description: "HR departments, talent & hiring agencies",
  },
  {
    id: "freelancer-personal-brand",
    label: "Freelancer / Coach",
    icon: <Briefcase className="h-4 w-4" />,
    category: "creator",
    description: "Designers, developers, consultants & coaches",
  },
];

export const PromotionWorkflowSelector: React.FC = () => {
  const {
    activePromotionType,
    setActivePromotionType,
    setActiveCreatorTab,
    setWorkspaceMode,
  } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<
    "all" | "core" | "industry" | "creator"
  >("all");

  const handleSelect = (id: PromotionTargetType) => {
    setActivePromotionType(id);

    if (id === "business") {
      setWorkspaceMode("business");
      setActiveCreatorTab("business");
    } else if (id === "product") {
      setWorkspaceMode("seller");
      setActiveCreatorTab("product");
    } else {
      setWorkspaceMode("seller");
      setActiveCreatorTab("product");
    }
  };

  const filteredOptions =
    activeCategory === "all"
      ? PROMOTION_OPTIONS
      : PROMOTION_OPTIONS.filter((opt) => opt.category === activeCategory);

  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-obsidian-950 via-obsidian-900 to-obsidian-950 p-6 shadow-2xl space-y-4">
      {/* Top Title & Category Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-white tracking-wide">
                What do you want to promote?
              </h3>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                15 INDUSTRIES SUPPORTED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Universal AI Promotion Engine — Template-driven video ads & social campaigns
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 rounded-xl bg-obsidian-950 p-1 border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`rounded-lg px-3 py-1 text-xs font-extrabold transition-all ${
              activeCategory === "all"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All (16)
          </button>
          <button
            onClick={() => setActiveCategory("core")}
            className={`rounded-lg px-3 py-1 text-xs font-extrabold transition-all ${
              activeCategory === "core"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Core SaaS (4)
          </button>
          <button
            onClick={() => setActiveCategory("industry")}
            className={`rounded-lg px-3 py-1 text-xs font-extrabold transition-all ${
              activeCategory === "industry"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Industries (9)
          </button>
          <button
            onClick={() => setActiveCategory("creator")}
            className={`rounded-lg px-3 py-1 text-xs font-extrabold transition-all ${
              activeCategory === "creator"
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Creators & Pros (3)
          </button>
        </div>
      </div>

      {/* Responsive Industry Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
        {filteredOptions.map((opt) => {
          const isSelected = activePromotionType === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`group relative flex flex-col items-start justify-between rounded-2xl p-3.5 text-left transition-all border ${
                isSelected
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]"
                  : "bg-obsidian-950/80 border-white/10 text-slate-300 hover:bg-obsidian-900 hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-indigo-400 group-hover:bg-white/10 group-hover:text-white"
                  }`}
                >
                  {opt.icon}
                </div>
                {opt.badge && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                      isSelected
                        ? "bg-white text-indigo-900"
                        : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                    }`}
                  >
                    {opt.badge}
                  </span>
                )}
              </div>

              <div>
                <span className="block text-xs font-extrabold tracking-tight">
                  {opt.label}
                </span>
                <span
                  className={`block text-[10px] line-clamp-1 mt-0.5 ${
                    isSelected ? "text-indigo-100" : "text-slate-400"
                  }`}
                >
                  {opt.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
