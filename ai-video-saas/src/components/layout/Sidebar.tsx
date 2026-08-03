"use client";

import React from "react";
import {
  Sparkles,
  Eye,
  Calendar,
  BarChart3,
  Layers,
  Settings,
  Zap,
  HelpCircle,
  Video,
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBrandKit: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenBrandKit,
}) => {
  const navItems = [
    {
      id: "studio",
      label: "Multimodal Studio",
      icon: Sparkles,
      badge: "AUTO-EDIT",
      description: "Dual dropzone & memory chat",
    },
    {
      id: "inspector",
      label: "AI Vision Inspector",
      icon: Eye,
      badge: "NEW",
      description: "Keyframe action & timestamp insights",
    },
    {
      id: "calendar",
      label: "Social Media Publisher",
      icon: Calendar,
      badge: "MULTI-CH",
      description: "Reels, TikTok & YouTube Shorts",
    },
    {
      id: "analytics",
      label: "Enterprise Analytics",
      icon: BarChart3,
      description: "Views, CTR & engagement ROI",
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 shrink-0 hidden md:flex shadow-sm">
      <div className="space-y-6">
        <div className="px-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Workflows
          </p>
        </div>

        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all ${
                  isActive
                    ? "bg-indigo-50 border border-indigo-200 text-indigo-900 shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`h-4 w-4 ${
                      isActive ? "text-indigo-600" : "text-slate-400"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold leading-tight">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Brand Persona Box in Sidebar */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 shadow-sm">
          <div className="flex items-center space-x-2.5 mb-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Persona
            </p>
          </div>
          <p className="text-xs font-bold text-slate-900 truncate">
            Principal Architect
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Enterprise Admin
          </p>
          <button
            onClick={onOpenBrandKit}
            className="mt-3 flex w-full items-center justify-center space-x-1.5 rounded-xl border border-slate-200 bg-white py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Brand Kit Settings</span>
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="border-t border-slate-200 pt-4 px-2">
        <p className="text-[10px] font-semibold text-slate-500">
          Market Pilot AI Enterprise
        </p>
        <p className="text-[9px] text-slate-400">
          Multimodal Action Recognition
        </p>
      </div>
    </aside>
  );
};
