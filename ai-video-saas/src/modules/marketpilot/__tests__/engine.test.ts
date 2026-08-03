import {
  MarketPilotPromotionEngine,
  validatePromotionRequest,
  TemplateResolver,
  getIndustryMetadata,
  PromotionRequest,
} from "../index";

/**
 * Automated Verification Test Suite for Module 7: AI Promotion Engine Core
 * Covers:
 * ✓ Template selection
 * ✓ Industry detection
 * ✓ Input validation
 * ✓ Campaign generation schema
 * ✓ API responses
 */
export async function runMarketPilotEngineTests(): Promise<{
  passed: number;
  failed: number;
  results: { testName: string; status: "PASS" | "FAIL"; message: string }[];
}> {
  const results: { testName: string; status: "PASS" | "FAIL"; message: string }[] = [];
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, message: string) => {
    if (condition) {
      passed++;
      results.push({ testName, status: "PASS", message });
    } else {
      failed++;
      results.push({ testName, status: "FAIL", message });
    }
  };

  // Test 1: Industry Detection & Metadata
  try {
    const meta = getIndustryMetadata("real-estate");
    assert(
      meta.displayName === "Real Estate & Luxury Properties" &&
        meta.defaultGoal === "lead_generation",
      "Industry Detection Test",
      "Successfully identified real-estate industry metadata and default goal."
    );
  } catch (err: any) {
    assert(false, "Industry Detection Test", err.message);
  }

  // Test 2: Input Validation
  try {
    const invalid = validatePromotionRequest({});
    const valid = validatePromotionRequest({
      promotionType: "website",
      businessName: "Valued SaaS",
      userInputs: { url: "https://example.com" },
    });

    assert(
      !invalid.valid &&
        valid.valid &&
        valid.normalizedRequest?.businessName === "Valued SaaS",
      "Input Validation Test",
      "Correctly rejected empty request and validated normalized request."
    );
  } catch (err: any) {
    assert(false, "Input Validation Test", err.message);
  }

  // Test 3: Template Selection & Resolution
  try {
    const req: PromotionRequest = {
      promotionType: "product",
      industry: "product",
      businessName: "TechGear",
      userInputs: { price: "$99" },
      targetAudience: "Gamers",
      campaignGoal: "sales_conversion",
    };
    const { primaryTemplate, suggestions } = TemplateResolver.resolve(req);

    assert(
      primaryTemplate.id === "product_launch" || primaryTemplate.category === "product",
      "Template Selection Test",
      `Resolved template ${primaryTemplate.name} for product promotion.`
    );
  } catch (err: any) {
    assert(false, "Template Selection Test", err.message);
  }

  // Test 4: Complete Campaign Generation Schema
  try {
    const response = await MarketPilotPromotionEngine.generateCampaign({
      promotionType: "real-estate",
      industry: "real-estate",
      businessName: "Skyline Residences",
      userInputs: { location: "Miami", priceRange: "$1.5M - $4M" },
      targetAudience: "Luxury Homebuyers",
      campaignGoal: "lead_generation",
    });

    assert(
      response.success &&
        response.campaign !== undefined &&
        response.campaign.videoConcepts.length === 10 &&
        response.campaign.scripts.length === 3 &&
        response.campaign.captions.length === 4 &&
        response.campaign.adCopy.length === 2,
      "Campaign Generation Schema Test",
      "Successfully generated 10 concepts, 3 scripts, 4 captions, and 2 ad copy options."
    );
  } catch (err: any) {
    assert(false, "Campaign Generation Schema Test", err.message);
  }

  // Test 5: API Response Structure
  try {
    const res = await MarketPilotPromotionEngine.generateCampaign({
      promotionType: "restaurant",
      industry: "restaurant",
      businessName: "Bistro 54",
      userInputs: { menu: "Truffle Pasta, Steaks" },
    });
    assert(
      res.success &&
        res.selectedTemplate !== undefined &&
        res.suggestedTemplates !== undefined &&
        Boolean(res.campaign?.campaignName.includes("Bistro 54")),
      "API Response Structure Test",
      "Engine response payload contains selectedTemplate, suggestedTemplates, and campaign schema."
    );
  } catch (err: any) {
    assert(false, "API Response Structure Test", err.message);
  }

  return { passed, failed, results };
}
