"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  X,
  Upload,
  Check,
  Palette,
  UserCheck,
  MessageSquare,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

interface BrandKitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLOR_PRESETS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Cyan", hex: "#0891b2" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Amber", hex: "#f59e0b" },
];

const AVATARS = [
  {
    id: "alex",
    name: "Alex - Corporate Recruiter",
    style: "Professional Studio · Warm Baritone",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&q=80",
    role: "Ideal for Enterprise & Tech Staffing",
  },
  {
    id: "marcus",
    name: "Marcus - High-Energy Fitness Coach",
    style: "Dynamic Gym · High Cadence",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80",
    role: "Ideal for Wellness & Consumer Brands",
  },
  {
    id: "sarah",
    name: "Sarah - Medical Host",
    style: "Trustworthy Clinic · Calm Mezzo",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&q=80",
    role: "Ideal for Healthcare & Professional Services",
  },
  {
    id: "david",
    name: "David - Engineering Tech Lead",
    style: "Technical Walkthrough · Analytical",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&q=80",
    role: "Ideal for B2B SaaS & Robotics",
  },
];

const TONES = [
  {
    title: "Professional & Authoritative",
    desc: "Clear, executive language with high credibility and technical precision.",
  },
  {
    title: "High-Energy & Gen-Z",
    desc: "Fast-paced hooks, trendy phrasing, and exciting call-to-actions.",
  },
  {
    title: "Urgent Sale & Hook",
    desc: "Direct conversion focus with scarcity, benefits, and immediate CTA.",
  },
  {
    title: "Empathetic & Trustworthy",
    desc: "Patient and reassuring tone focused on reliability and care.",
  },
];

export const BrandKitModal: React.FC<BrandKitModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { brands, activeBrandId, updateBrand } = useAppStore();
  const activeBrand =
    brands.find((b) => b.id === activeBrandId) || brands[0];

  const [name, setName] = useState(activeBrand.name);
  const [tagline, setTagline] = useState(activeBrand.tagline);
  const [selectedColor, setSelectedColor] = useState(activeBrand.primaryColor);
  const [selectedAvatar, setSelectedAvatar] = useState(
    activeBrand.defaultAvatarId
  );
  const [selectedTone, setSelectedTone] = useState(activeBrand.defaultTone);

  if (!isOpen) return null;

  const handleSave = () => {
    updateBrand(activeBrand.id, {
      name,
      tagline,
      primaryColor: selectedColor,
      defaultAvatarId: selectedAvatar,
      defaultAvatarName:
        AVATARS.find((a) => a.id === selectedAvatar)?.name ||
        activeBrand.defaultAvatarName,
      defaultTone: selectedTone,
    });
    toast.success("Brand Kit saved successfully!", {
      description: `Updated visual tokens and voice profile for ${name}.`,
    });
    onClose();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateBrand(activeBrand.id, { logoUrl: url });
      toast.success("Logo uploaded!", {
        description: "New logo preview is active in the workspace.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-900/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-700/80 bg-obsidian-900/95 p-6 shadow-2xl ring-1 ring-white/10 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Brand Kit & Persona Settings
              </h2>
              <p className="text-xs text-slate-400">
                Configure visual assets, default AI avatars, and tone of voice
                for <span className="text-white font-bold">{activeBrand.name}</span>.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="space-y-6">
          {/* Brand Identity & Logo Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Client / Brand Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Brand Value Proposition / Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Color Preset Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                  Primary Accent Color
                </label>
                <div className="flex items-center space-x-2">
                  {COLOR_PRESETS.map((col) => {
                    const isSelected = selectedColor === col.hex;
                    return (
                      <button
                        key={col.hex}
                        onClick={() => setSelectedColor(col.hex)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform ${
                          isSelected
                            ? "scale-125 ring-2 ring-white shadow-lg"
                            : "hover:scale-110 opacity-80"
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {isSelected && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Logo Upload Dropzone */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
                Brand Logo Mark (Watermark Overlay)
              </label>
              <label className="flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900/40 hover:bg-slate-800/40 hover:border-indigo-500/50 transition-all cursor-pointer p-4 text-center">
                <img
                  src={activeBrand.logoUrl}
                  alt="Logo"
                  className="h-14 w-14 rounded-xl object-cover border border-slate-700 mb-3 shadow-md"
                />
                <div className="flex items-center space-x-1 text-xs font-bold text-indigo-400">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Click to Upload New Logo</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  PNG or JPG up to 5MB. Rendered in video corner overlay.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* AI Avatar Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Default AI Persona & Voiceover Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.id;
                return (
                  <div
                    key={avatar.id}
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`flex items-center space-x-3 rounded-2xl border p-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/10"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                    }`}
                  >
                    <img
                      src={avatar.image}
                      alt={avatar.name}
                      className="h-12 w-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white truncate">
                          {avatar.name}
                        </p>
                        {isSelected && (
                          <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-indigo-400 font-medium truncate">
                        {avatar.style}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {avatar.role}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tone of Voice Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
              Default Tone of Voice & Hook Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TONES.map((tone) => {
                const isSelected = selectedTone === tone.title;
                return (
                  <div
                    key={tone.title}
                    onClick={() => setSelectedTone(tone.title)}
                    className={`rounded-2xl border p-3.5 cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-bold text-white">
                        {tone.title}
                      </p>
                      {isSelected && (
                        <Check className="h-4 w-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {tone.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex items-center justify-end space-x-3 border-t border-slate-800/80 pt-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Save Brand Kit Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
