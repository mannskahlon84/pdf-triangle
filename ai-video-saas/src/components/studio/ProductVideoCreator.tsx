"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import {
  ProductCatalogItem,
  ProductVideoTemplateType,
  ProductAngleImage,
} from "@/types/database";
import {
  Sparkles,
  Upload,
  Video,
  Check,
  Copy,
  Plus,
  Trash2,
  TrendingUp,
  Share2,
  Film,
  Play,
  Layers,
  Tag,
  DollarSign,
  Gift,
  Zap,
  ShoppingBag,
  Award,
  ChevronRight,
  Eye,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const TEMPLATE_OPTIONS: ProductVideoTemplateType[] = [
  "Fashion Product",
  "Food Product",
  "Electronics",
  "Beauty Product",
  "Jewellery",
  "Real Estate",
  "Automotive",
  "Restaurant Menu",
];

export const ProductVideoCreator: React.FC = () => {
  const {
    sellerProducts,
    activeProductId,
    setActiveProductId,
    addProductToCatalog,
    updateProductInCatalog,
    deleteProductFromCatalog,
    setIsRenderingVideo,
    isRenderingVideo,
    renderProgress,
    setRenderProgress,
    renderStepText,
    setRenderStepText,
    setFinishedVideoUrl,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isRenderingVideo) return;
    const steps = [
      "Analyzing uploaded product angles & aspect ratio...",
      "Executing Hybrid AI Creative Planner rules...",
      "Writing marketing script (Hook, Features, Benefit)...",
      "Assigning visual B-Roll & AI image assets...",
      "Composing 15s multi-scene timeline in FFmpeg...",
      "Encoding 1080x1920 vertical MP4 video stream...",
      "Finalizing audio sync & karaoke captions...",
    ];
    let idx = 0;
    let progressVal = 15;
    setRenderProgress(15);
    setRenderStepText(steps[0]);
    const interval = setInterval(() => {
      idx = (idx + 1) % steps.length;
      progressVal = Math.min(progressVal + 11, 94);
      setRenderStepText(steps[idx]);
      setRenderProgress(progressVal);
    }, 1800);
    return () => clearInterval(interval);
  }, [isRenderingVideo, setRenderProgress, setRenderStepText]);

  const activeProduct =
    sellerProducts.find((p) => p.id === activeProductId) || sellerProducts[0];

  // Form State for editing / new product
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editName, setEditName] = useState(activeProduct?.name || "");
  const [editPrice, setEditPrice] = useState(activeProduct?.price || "");
  const [editCategory, setEditCategory] = useState<ProductVideoTemplateType>(
    activeProduct?.category || "Fashion Product"
  );
  const [editFeatures, setEditFeatures] = useState(
    activeProduct?.features?.join(", ") || ""
  );
  const [editOffer, setEditOffer] = useState(activeProduct?.offerInfo || "");
  const [customAngleLabel, setCustomAngleLabel] = useState("Side View");

  // UI state
  const [selectedAngleIndex, setSelectedAngleIndex] = useState(0);
  const [activePlatformCopy, setActivePlatformCopy] = useState<
    "instagram" | "tiktok" | "youtube" | "ads"
  >("instagram");
  const [showSalesAssistant, setShowSalesAssistant] = useState(true);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(
    activeProduct?.generatedVideos?.[0] || null
  );

  // Sync state when switching catalog products
  const handleSelectCatalogItem = (product: ProductCatalogItem) => {
    setIsCreatingNew(false);
    setActiveProductId(product.id);
    setEditName(product.name);
    setEditPrice(product.price);
    setEditCategory(product.category);
    setEditFeatures(product.features.join(", "));
    setEditOffer(product.offerInfo);
    setSelectedAngleIndex(0);
    setVideoPreviewUrl(product.generatedVideos?.[0] || null);
    toast.success(`Loaded "${product.name}" into Product Video Studio`, {
      description: `${product.angles.length} product angles & AI sales copy ready.`,
    });
  };

  const handleStartNewProduct = () => {
    setIsCreatingNew(true);
    setEditName("New Product Item");
    setEditPrice("$49.99");
    setEditCategory("Fashion Product");
    setEditFeatures("Premium quality, Lightweight, Daily luxury");
    setEditOffer("15% OFF First Order");
    setVideoPreviewUrl(null);
  };

  const handleSaveProduct = () => {
    if (isCreatingNew) {
      const newProd: ProductCatalogItem = {
        id: `prod-${Date.now()}`,
        sellerId: "shopkeeper",
        name: editName || "Untitled Product",
        price: editPrice || "$0.00",
        category: editCategory,
        features: editFeatures.split(",").map((f) => f.trim()).filter(Boolean),
        offerInfo: editOffer,
        angles: [
          {
            id: `ang-${Date.now()}-1`,
            label: "Front view",
            url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=800&fit=crop&q=80",
            timestamp: 2,
          },
        ],
        detectedCategory: editCategory,
        materials: ["Premium materials", "Handcrafted finish"],
        colors: ["Classic Edition", "Modern Matte"],
        marketingPoints: [
          "✓ High quality build & finish",
          "✓ Designed for everyday utility",
          "✓ Exceptional value for price",
        ],
        generatedVideos: [],
        previousScripts: [
          `Discover ${editName}. Designed for everyday luxury and performance. Order now!`,
        ],
        aiContentCopy: {
          instagramCaption: `Upgrade your style with ${editName} ✨ ${editOffer}! Link in bio to order. #${editCategory.replace(
            /\s+/g,
            ""
          )} #MustHave #ProductDrop`,
          tiktokCaption: `Why everyone is talking about ${editName} 🔥 ${editOffer}! Get yours today #TikTokMadeMeBuyIt #Shopping`,
          youtubeShortsDescription: `Check out the all-new ${editName} featuring premium design and ${editOffer}.`,
          hashtags: [
            `#${editCategory.replace(/\s+/g, "")}`,
            "#ShopNow",
            "#OnlineStore",
            "#ProductVideo",
            "#MustHave",
          ],
          productTitle: `${editName} — Premium Edition`,
          advertisementCopy: `Experience ${editName} for only ${editPrice}. Includes ${editOffer}. Order directly from our store with fast shipping.`,
        },
        aiSalesSuggestion: {
          bestCustomerSegment: "Quality-conscious shoppers & online buyers aged 20–45",
          sellingAngle: "Direct-to-consumer value without retail markup",
          pricingPsychology: `Charm pricing (${editPrice}) + immediate discount hook (${editOffer})`,
          seasonalCampaigns: ["Seasonal Flash Promo", "Holiday Gifting Feature"],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addProductToCatalog(newProd);
      setIsCreatingNew(false);
      toast.success(`Created "${newProd.name}" in My Products catalog!`);
    } else if (activeProduct) {
      updateProductInCatalog(activeProduct.id, {
        name: editName,
        price: editPrice,
        category: editCategory,
        features: editFeatures.split(",").map((f) => f.trim()).filter(Boolean),
        offerInfo: editOffer,
      });
      toast.success(`Saved changes to "${editName}"`);
    }
  };

  // Handle uploading product photos (single-single or multiple angles)
  const handleUploadPhotoAngle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeProduct) return;

    Array.from(files).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;
        const angleCount = activeProduct.angles.length + idx + 1;
        const defaultLabels = [
          "Front view",
          "Side view",
          "Inside view",
          "Close-up stitching view",
          "Lifestyle view",
        ];
        const label =
          files.length === 1 && customAngleLabel
            ? customAngleLabel
            : defaultLabels[angleCount - 1] || `Angle ${angleCount}`;
        const newAngle: ProductAngleImage = {
          id: `ang-up-${Date.now()}-${idx}`,
          label,
          url: dataUrl,
          timestamp: Math.min(2 + angleCount * 3, 14),
        };
        const currentProduct =
          useAppStore.getState().sellerProducts.find((p) => p.id === activeProduct.id) ||
          activeProduct;
        const newAngles = [...currentProduct.angles, newAngle];
        updateProductInCatalog(activeProduct.id, {
          angles: newAngles,
        });
        setSelectedAngleIndex(newAngles.length - 1);
        toast.success(`Added photo angle to ${activeProduct.name}!`, {
          description: "AI Product Understanding updated with new multi-angle visual data.",
        });
      };
      reader.readAsDataURL(file);
    });
  };

  // Simulate AI Product Understanding analysis
  const handleRunAIUnderstanding = () => {
    if (!activeProduct) return;
    setIsAnalyzingAI(true);
    toast.info("AI Product Understanding running...", {
      description: "Detecting materials, features, selling points, and customer benefits.",
    });

    setTimeout(() => {
      setIsAnalyzingAI(false);
      const updatedMarketingPoints = [
        `✓ Premium ${activeProduct.category.toLowerCase()} craftsmanship`,
        `✓ ${activeProduct.features[0] || "Spacious design & versatility"}`,
        `✓ High-converting value at ${activeProduct.price}`,
      ];
      updateProductInCatalog(activeProduct.id, {
        detectedCategory: activeProduct.name.toLowerCase(),
        marketingPoints: updatedMarketingPoints,
      });
      toast.success("AI Product Understanding complete!", {
        description: "Generated customer benefits, hooks, and multi-platform captions.",
      });
    }, 1200);
  };

  const handleGenerate15sReel = async () => {
  if (!activeProduct) return;

  try {
    setIsRenderingVideo(true);
    setRenderProgress(10);
    setRenderStepText("Sending product data to AI video engine...");

    const mediaUrls = (activeProduct.angles?.map((a) => a.url) || []).filter(
      Boolean
    ) as string[];

    const response = await fetch("/api/marketpilot/generate-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product: activeProduct,
        mediaUrls,
        useHybridAi: true,
        ttsProvider: "ElevenLabs",
      }),
    });

    const data = await response.json();

    const videoUrl = data.videoUrl ?? data.previewUrl;

    if (!videoUrl) {
      throw new Error("No video URL or preview URL returned");
    }

    setFinishedVideoUrl(videoUrl);
    setVideoPreviewUrl(videoUrl);

    updateProductInCatalog(activeProduct.id, {
      generatedVideos: [
        videoUrl,
        ...(activeProduct.generatedVideos || []),
      ],
    });
    toast.success(
      `15s Social Reel generated for "${activeProduct.name}"!`
    );

  } catch (error) {
    console.error("VIDEO GENERATION ERROR:", error);

    toast.error(
      "Failed to generate video. Check Render Coordinator."
    );

  } finally {
    setIsRenderingVideo(false);
  }
};

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  if (!activeProduct) return null;

  return (
    <div className="w-full space-y-6">
      {/* 1. PRODUCT CATALOG BAR ("MY PRODUCTS") */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                My Products Catalog
              </h3>
              <p className="text-[11px] font-medium text-slate-500">
                Select a product to view its multi-angle photos & create social reels
              </p>
            </div>
          </div>

          {/* Product Selector Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {sellerProducts.map((prod) => {
              const isSelected = prod.id === activeProduct.id && !isCreatingNew;
              return (
                <button
                  key={prod.id}
                  onClick={() => handleSelectCatalogItem(prod)}
                  className={`flex items-center space-x-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-500"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{prod.name}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                      isSelected
                        ? "bg-amber-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {prod.angles.length} angles
                  </span>
                </button>
              );
            })}

            <button
              onClick={handleStartNewProduct}
              className={`flex items-center space-x-1 rounded-xl border border-dashed px-3 py-1.5 text-xs font-bold transition-all ${
                isCreatingNew
                  ? "border-amber-500 bg-amber-50 text-amber-800"
                  : "border-slate-300 bg-white text-slate-600 hover:border-amber-500 hover:text-amber-700"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Product</span>
            </button>
          </div>
        </div>
      </div>

      {/* MAIN WORKFLOW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (7 SPAN): Upload Input + AI Product Understanding + AI Content Copy */}
        <div className="lg:col-span-7 space-y-6">
          {/* UPLOAD INPUT & PRODUCT DETAILS */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
                  1
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  Product Details & Multi-Angle Uploads
                </h4>
              </div>
              <button
                onClick={handleSaveProduct}
                className="rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-all shadow-sm"
              >
                Save Product
              </button>
            </div>

            {/* Form Fields: Name, Price, Category, Offer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Premium Leather Bag"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Price ($)
                </label>
                <input
                  type="text"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="e.g. $129.99"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Video Template Style
                </label>
                <select
                  value={editCategory}
                  onChange={(e) =>
                    setEditCategory(
                      e.target.value as ProductVideoTemplateType
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                >
                  {TEMPLATE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Offer / CTA Incentive
                </label>
                <input
                  type="text"
                  value={editOffer}
                  onChange={(e) => setEditOffer(e.target.value)}
                  placeholder="e.g. 20% OFF Summer Sale"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Key Features (comma separated)
                </label>
                <input
                  type="text"
                  value={editFeatures}
                  onChange={(e) => setEditFeatures(e.target.value)}
                  placeholder="Full-grain leather, Waterproof interior, Office friendly"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* MULTI-ANGLE PHOTO CAROUSEL & SINGLE-BY-SINGLE UPLOAD */}
            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-bold text-slate-900">
                    Product Photos & Angles ({activeProduct.angles.length})
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Upload photos single-by-single or in multi-angle batch
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={customAngleLabel}
                    onChange={(e) => setCustomAngleLabel(e.target.value)}
                    placeholder="Angle Label"
                    className="w-28 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleUploadPhotoAngle}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5 text-amber-600" />
                    <span>Add Angle / Photo</span>
                  </button>
                </div>
              </div>

              {/* Angle Thumbnails Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {activeProduct.angles.map((angle, idx) => {
                  const isSelected = selectedAngleIndex === idx;
                  return (
                    <div
                      key={angle.id}
                      onClick={() => setSelectedAngleIndex(idx)}
                      className={`relative cursor-pointer overflow-hidden rounded-xl border transition-all ${
                        isSelected
                          ? "border-amber-500 ring-2 ring-amber-500 shadow-md"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <img
                        src={angle.url}
                        alt={angle.label}
                        className="h-24 w-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent p-2">
                        <p className="text-[10px] font-bold text-white truncate">
                          {angle.label}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 rounded-full bg-amber-500 p-1 text-white shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI PRODUCT UNDERSTANDING SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 font-bold text-xs">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center">
                    <span>AI Product Understanding</span>
                    <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                      EXAMPLE OUTPUT
                    </span>
                  </h4>
                </div>
              </div>
              <button
                onClick={handleRunAIUnderstanding}
                disabled={isAnalyzingAI}
                className="flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-sm"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isAnalyzingAI ? "animate-spin" : ""}`}
                />
                <span>{isAnalyzingAI ? "Analyzing..." : "Re-Analyze Product"}</span>
              </button>
            </div>

            {/* Detected Product Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Detected Product
                </span>
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-black text-slate-800">
                  {activeProduct.detectedCategory || activeProduct.name}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Marketing Points & Customer Benefits
                </span>
                <div className="space-y-1.5">
                  {activeProduct.marketingPoints.map((pt, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 rounded-lg bg-white border border-slate-200/80 px-3 py-2 shadow-2xs"
                    >
                      <span className="text-xs font-bold text-slate-800">
                        {pt}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials & Colors */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Materials Detected
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(
                      activeProduct.materials || [
                        "Premium finish",
                        "Reinforced build",
                      ]
                    ).map((m, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Colors & Palette
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(
                      activeProduct.colors || [
                        "Cognac Brown",
                        "Midnight Black",
                      ]
                    ).map((c, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI CONTENT GENERATOR SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
                  3
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  AI Content Generator (Multi-Platform Copy)
                </h4>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Auto-generated from Product Analysis
              </span>
            </div>

            {/* Platform Copy Tabs */}
            <div className="flex items-center space-x-1 border-b border-slate-200 pb-2">
              {[
                { id: "instagram" as const, label: "Instagram Caption" },
                { id: "tiktok" as const, label: "TikTok Caption" },
                { id: "youtube" as const, label: "YouTube Shorts" },
                { id: "ads" as const, label: "Ad Copy & Hashtags" },
              ].map((tab) => {
                const isActive = activePlatformCopy === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePlatformCopy(tab.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Display Active Copy */}
            <div className="relative rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">
                {activePlatformCopy === "instagram" &&
                  (activeProduct.aiContentCopy?.instagramCaption ||
                    "Upgrade your style with premium leather. Handcrafted full-grain Italian leather bag designed for office and travel. 👜✨ #PremiumLeather #TravelBag")}
                {activePlatformCopy === "tiktok" &&
                  (activeProduct.aiContentCopy?.tiktokCaption ||
                    "Why this leather bag is taking over TikTok 😍 Waterproof interior + lifetime brass hardware. Get 20% OFF today! #LeatherBag #FashionFinds")}
                {activePlatformCopy === "youtube" &&
                  (activeProduct.aiContentCopy?.youtubeShortsDescription ||
                    "Looking for a versatile leather handbag that transitions from office to travel? Check out our Premium Leather Bag.")}
                {activePlatformCopy === "ads" &&
                  `${
                    activeProduct.aiContentCopy?.productTitle ||
                    activeProduct.name
                  }\n\n${
                    activeProduct.aiContentCopy?.advertisementCopy ||
                    "Order directly from our store with fast shipping."
                  }\n\nHashtags:\n${(
                    activeProduct.aiContentCopy?.hashtags || [
                      "#PremiumLeather",
                      "#FashionProduct",
                    ]
                  ).join(" ")}`}
              </p>

              <button
                onClick={() => {
                  const textToCopy =
                    activePlatformCopy === "instagram"
                      ? activeProduct.aiContentCopy?.instagramCaption || ""
                      : activePlatformCopy === "tiktok"
                      ? activeProduct.aiContentCopy?.tiktokCaption || ""
                      : activePlatformCopy === "youtube"
                      ? activeProduct.aiContentCopy?.youtubeShortsDescription ||
                        ""
                      : activeProduct.aiContentCopy?.advertisementCopy || "";
                  handleCopyText(textToCopy, activePlatformCopy);
                }}
                className="absolute top-3 right-3 flex items-center space-x-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
              >
                <Copy className="h-3 w-3 text-slate-500" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 SPAN): AI 15s Reel Pipeline + Preview + AI Sales Assistant */}
        <div className="lg:col-span-5 space-y-6">
          {/* AI VIDEO CREATION PIPELINE — 15 SECOND REEL STRUCTURE */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold text-xs">
                  4
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    AI Video Creation Pipeline
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    15 Second Social Reel Structure
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                {activeProduct.angles.length} Angles Ready
              </span>
            </div>

            {/* 15s Timeline Breakdown Card */}
            <div className="space-y-3">
              {/* 0-3s Hook */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-900">
                    0–3 Seconds: Attention Hook
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    HOOK
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  &ldquo;Upgrade your style with {activeProduct.name.toLowerCase()}.&rdquo;
                </p>
              </div>

              {/* 3-12s Product Showcase */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-indigo-900">
                    3–12 Seconds: Product Showcase
                  </span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    SHOWCASE
                  </span>
                </div>
                <ul className="text-xs font-semibold text-slate-700 space-y-1 mt-1">
                  <li className="flex items-center">
                    <Check className="h-3.5 w-3.5 text-indigo-600 mr-1.5" />
                    Smooth image transitions across all {activeProduct.angles.length}{" "}
                    angles
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3.5 w-3.5 text-indigo-600 mr-1.5" />
                    Zoom effects & dynamic camera movement
                  </li>
                  <li className="flex items-center">
                    <Check className="h-3.5 w-3.5 text-indigo-600 mr-1.5" />
                    Product highlights & pricing overlay ({activeProduct.price})
                  </li>
                </ul>
              </div>

              {/* 12-15s CTA */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-emerald-900">
                    12–15 Seconds: Call to Action (CTA)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    CTA
                  </span>
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  &ldquo;{activeProduct.offerInfo || "Order now — Visit our store"}&rdquo;
                </p>
              </div>
            </div>

            {/* GENERATE REEL BUTTON & PROGRESS */}
            <button
              onClick={handleGenerate15sReel}
              disabled={isRenderingVideo}
              className={`w-full flex items-center justify-center space-x-2 rounded-xl py-3.5 px-4 text-sm font-black transition-all ${
                isRenderingVideo
                  ? "bg-slate-300 text-slate-600 cursor-not-allowed border border-slate-400/60 shadow-none pointer-events-none select-none"
                  : "bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20 active:scale-[0.99]"
              }`}
            >
              {isRenderingVideo ? (
                <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
              ) : (
                <Film className="h-4 w-4" />
              )}
              <span>
                {isRenderingVideo
                  ? "🚫 Rendering 15s Product Reel... (Please wait)"
                  : `🎬 Generate 15s Product Reel (${activeProduct.category})`}
              </span>
            </button>

            {/* Video Preview Box (Instantly shows progress while rendering, then MP4 player when done!) */}
            {(isRenderingVideo || videoPreviewUrl) && (
              <div className="rounded-2xl border border-slate-200 bg-slate-900 overflow-hidden shadow-lg transition-all duration-300">
                {isRenderingVideo ? (
                  <>
                    <div className="flex items-center justify-between bg-slate-800 px-4 py-2.5 border-b border-white/10">
                      <span className="text-xs font-bold text-white flex items-center">
                        <Loader2 className="h-3.5 w-3.5 text-amber-400 mr-1.5 animate-spin" />
                        AI Video Studio — Generating 15s Reel ({activeProduct.name})
                      </span>
                      <span className="rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-extrabold animate-pulse">
                        IN PROGRESS • {renderProgress || 15}%
                      </span>
                    </div>
                    <div className="relative aspect-[9/16] w-full max-h-[380px] mx-auto bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-5">
                      <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                        <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
                      </div>
                      <div className="space-y-1.5 max-w-xs">
                        <h4 className="text-sm font-extrabold text-white tracking-wide">
                          Generating Reel...
                        </h4>
                        <p className="text-xs text-amber-300 font-semibold min-h-[32px] flex items-center justify-center transition-all duration-300">
                          {renderStepText || "Analyzing product images & multi-angle B-Roll..."}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Please don&apos;t click again or close this tab
                        </p>
                      </div>
                      <div className="w-full max-w-xs bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-white/10 p-0.5">
                        <div
                          className="bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-700 shadow-sm"
                          style={{ width: `${renderProgress || 15}%` }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between bg-slate-800 px-4 py-2">
                      <span className="text-xs font-bold text-white flex items-center">
                        <Video className="h-3.5 w-3.5 text-amber-400 mr-1.5" />
                        15s Generated Reel ({activeProduct.name})
                      </span>
                      <span className="rounded bg-emerald-500/20 text-emerald-400 px-2 py-0.5 text-[10px] font-bold">
                        1080p HD • READY
                      </span>
                    </div>
                    <div className="relative aspect-[9/16] w-full max-h-[380px] mx-auto bg-black flex items-center justify-center">
                      <video
                        src={videoPreviewUrl || undefined}
                        controls
                        autoPlay
                        loop
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between bg-slate-800/80 px-4 py-2.5">
                      <span className="text-[11px] font-bold text-slate-300">
                        Publishing: Instagram Reels • TikTok • Shorts
                      </span>
                      <button
                        onClick={() => {
                          toast.success(
                            "Reel published & scheduled to social channels!"
                          );
                        }}
                        className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                      >
                        Publish Reel
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 5. OPTIONAL: AI SALES ASSISTANT CARD */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    AI Sales Assistant
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Smart conversion & pricing psychology
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSalesAssistant(!showSalesAssistant)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                {showSalesAssistant ? "Hide" : "Show"}
              </button>
            </div>

            {showSalesAssistant && (
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Best Customer Segment
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {activeProduct.aiSalesSuggestion?.bestCustomerSegment ||
                        "Urban commuters, fashion-conscious shoppers aged 24–45"}
                    </p>
                  </div>

                  <div className="border-t border-slate-200/80 pt-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Recommended Selling Angle
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">
                      {activeProduct.aiSalesSuggestion?.sellingAngle ||
                        "Luxury craft at accessible direct-to-consumer price point"}
                    </p>
                  </div>

                  <div className="border-t border-slate-200/80 pt-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                      Pricing Psychology
                    </span>
                    <p className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg mt-1 inline-block">
                      {activeProduct.aiSalesSuggestion?.pricingPsychology ||
                        "Charm pricing + limited-time 20% OFF bundle incentive"}
                    </p>
                  </div>

                  <div className="border-t border-slate-200/80 pt-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                      Seasonal Campaigns
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(
                        activeProduct.aiSalesSuggestion?.seasonalCampaigns || [
                          "Back-to-Office Commuter Promo",
                          "Weekend Getaway Campaign",
                        ]
                      ).map((camp, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[10px] font-bold text-indigo-700"
                        >
                          {camp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
