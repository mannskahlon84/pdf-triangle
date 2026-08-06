import { AssetAnalyzer } from "../src/modules/marketpilot/video-planner/analyzers/assetAnalyzer";

console.log("=== Visual Intelligence Layer (Phase 2) Test ===\n");

const mediaUrls = [
  "blob:http://localhost:3000/earphone-side-profile.png",
  "blob:http://localhost:3000/earphone-box-front.png",
  "blob:http://localhost:3000/earphone-lifestyle-gym.png",
  "blob:http://localhost:3000/earphone-clean-top.png",
];

console.log("Input Uploaded Images (Sequential Order):");
mediaUrls.forEach((url, i) => console.log(`  ${i + 1}. ${url.split('/').pop()}`));

console.log("\n--- BEFORE: Standard Sequential Assignment ---");
const roles = ["hero", "feature", "benefit", "cta"];
roles.forEach((role, idx) => {
  console.log(`[${role.toUpperCase()}] -> ${mediaUrls[idx % mediaUrls.length].split('/').pop()}`);
});

console.log("\n--- AFTER: AI Intelligent Composition (Mock) ---");
const analyzedAssets = AssetAnalyzer.analyze(mediaUrls, "Earbuds", "electronics");

analyzedAssets.forEach(asset => {
  console.log(`[${asset.role.toUpperCase()}] -> ${asset.url.split('/').pop()}`);
  console.log(`      └─ AI Assessment: ${asset.metrics.angle} angle | Sharpness: ${asset.metrics.sharpness}/100 | Match Score: ${asset.score}/100`);
});

const hookUrl = analyzedAssets.find((a) => a.role === "hero")?.url;
const featureUrl = analyzedAssets.find((a) => a.role === "feature")?.url;
const lifestyleUrl = analyzedAssets.find((a) => a.role === "benefit")?.url;
const ctaUrl = analyzedAssets.find((a) => a.role === "cta")?.url;

const isSequential =
  hookUrl === mediaUrls[0] &&
  featureUrl === mediaUrls[1] &&
  lifestyleUrl === mediaUrls[2] &&
  ctaUrl === mediaUrls[3];

console.log("\n[Test Result] Dynamic Routing Active: " + !isSequential);
