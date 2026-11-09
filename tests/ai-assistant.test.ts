import { describe, it, expect } from "vitest";
import {
  AIExtractionSchema,
  extractWithRuleBasedFallback,
  generateReplyDraft,
  matchPackagesDeterministically,
  ExtractedEnquiryData,
} from "../src/lib/ai";

describe("9, 10, 11 & 12. AI Assistant, Fallback & Recommendation Engine Tests", () => {
  it("9. should validate structured AI extraction against the Zod schema", () => {
    const rawAiOutput = {
      destination: "Kerala",
      adults: 2,
      children: 1,
      duration: "5-6 nights",
      travel_month: "December",
      budget: 120000,
      special_requirements: ["Houseboat", "Child friendly"],
      confidence: 0.95,
    };

    const validated = AIExtractionSchema.safeParse(rawAiOutput);
    expect(validated.success).toBe(true);
    if (validated.success) {
      expect(validated.data.adults).toBe(2);
      expect(validated.data.children).toBe(1);
      expect(validated.data.budget).toBe(120000);
      expect(validated.data.special_requirements).toContain("Houseboat");
    }
  });

  it("11. should accurately extract structured fields using rule-based fallback when AI is unavailable", () => {
    // Testing the exact prompt example
    const enquiryMessage =
      "Hi, 2 adults and 1 kid, Kerala 5-6 nights in December, budget around 1.2 lakh total, houseboat a must.";

    const extracted = extractWithRuleBasedFallback(enquiryMessage);

    expect(extracted.adults).toBe(2);
    expect(extracted.children).toBe(1);
    expect(extracted.travel_month).toBe("December");
    expect(extracted.budget).toBe(120000);
    expect(extracted.special_requirements).toContain("Houseboat");
    expect(extracted.confidence).toBeGreaterThanOrEqual(0.85);
  });

  it("10 & 12. should deterministically match real database packages and never invent prices", async () => {
    const sampleExtracted: ExtractedEnquiryData = {
      destination: "Munnar, Thekkady & Alleppey",
      adults: 2,
      children: 1,
      duration: "6 days",
      travel_month: "December",
      budget: 120000,
      special_requirements: ["Houseboat"],
      confidence: 0.95,
    };

    const recommendations = await matchPackagesDeterministically(sampleExtracted);

    expect(recommendations.length).toBeGreaterThan(0);
    const topMatch = recommendations[0];

    // Must match real package PKG-KL-07
    expect(topMatch.packageCode).toBe("PKG-KL-07");
    // Must retrieve the exact DB peak season price (32,500)
    expect(topMatch.pricePerPerson).toBe(32500);
    expect(topMatch.seasonMatched).toContain("Peak Season");
    // Calculation: 2 adults * 32,500 + 1 kid (50%) = 81,250
    expect(topMatch.estimatedTotal).toBe(81250);
    // Estimated total must be within the 1.2 lakh budget
    expect(topMatch.estimatedTotal).toBeLessThanOrEqual(120000);
  });

  it("should generate a transparent reply draft using verified DB rates without hallucinating prices", () => {
    const extracted: ExtractedEnquiryData = {
      destination: "Kerala",
      adults: 2,
      children: 1,
      duration: "6 days",
      travel_month: "December",
      budget: 120000,
      special_requirements: ["Houseboat"],
      confidence: 0.95,
    };

    const topPackage = {
      packageId: "test-id",
      packageCode: "PKG-KL-07",
      title: "Munnar, Thekkady and Alleppey Houseboat",
      slug: "munnar-thekkady-alleppey-houseboat",
      matchScore: 0.98,
      seasonMatched: "Peak Season (Winter & Spring)",
      pricePerPerson: 32500,
      estimatedTotal: 81250,
      reason: "Matches 6-day duration and includes private Alleppey houseboat.",
    };

    const draft = generateReplyDraft("Rahul Sharma", extracted, topPackage);

    expect(draft).toContain("Dear Rahul");
    expect(draft).toContain("Munnar, Thekkady and Alleppey Houseboat");
    expect(draft).toContain("PKG-KL-07");
    expect(draft).toContain("₹32,500");
    expect(draft).toContain("₹81,250");
    expect(draft.toLowerCase()).toContain("twin-sharing");
    expect(draft).toContain("Aroha Travels");
  });
});
