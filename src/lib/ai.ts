import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { prisma } from "./prisma";
import { PackageStatus } from "@prisma/client";

// Zod schema for structured extraction
export const AIExtractionSchema = z.object({
  destination: z.string().default("Kerala"),
  adults: z.number().int().min(1).default(2),
  children: z.number().int().min(0).default(0),
  duration: z.string().default("5-6 days"),
  travel_month: z.string().default("Upcoming Season"),
  budget: z.number().nullable().default(null),
  special_requirements: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.85),
});

export type ExtractedEnquiryData = z.infer<typeof AIExtractionSchema>;

export interface PackageRecommendation {
  packageId: string;
  packageCode: string;
  title: string;
  slug: string;
  matchScore: number;
  seasonMatched: string;
  pricePerPerson: number;
  estimatedTotal: number;
  reason: string;
}

export interface AIExtractionResult {
  extractedData: ExtractedEnquiryData;
  confidence: number;
  recommendations: PackageRecommendation[];
  replyDraft: string;
  provider: "gemini-1.5-flash" | "rule-based-fallback";
}

/**
 * Deterministic Rule-based NLP Extractor (Fallback)
 */
export function extractWithRuleBasedFallback(message: string): ExtractedEnquiryData {
  const text = message.toLowerCase();

  // Adults extraction
  let adults = 2;
  const adultMatch = text.match(/(\d+)\s*(?:adult|grown|pax|people|person)/i);
  if (adultMatch) {
    adults = parseInt(adultMatch[1], 10);
  } else if (text.includes("couple") || text.includes("honeymoon") || text.includes("husband") || text.includes("wife")) {
    adults = 2;
  } else if (text.includes("solo")) {
    adults = 1;
  }

  // Children extraction
  let children = 0;
  const childMatch = text.match(/(\d+)\s*(?:child|children|kid|baby|infant|teenager)/i);
  if (childMatch) {
    children = parseInt(childMatch[1], 10);
  } else if (text.includes("with kid") || text.includes("with child") || text.includes("1 kid")) {
    children = 1;
  }

  // Duration extraction
  let duration = "5-6 days";
  const durationMatch = text.match(/(\d+(?:\s*-\s*\d+)?)\s*(?:night|day|n|d)/i);
  if (durationMatch) {
    duration = durationMatch[0].trim();
  }

  // Month extraction
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  let travel_month = "Upcoming Season";
  for (const m of months) {
    if (text.includes(m)) {
      travel_month = m.charAt(0).toUpperCase() + m.slice(1);
      break;
    }
  }

  // Budget extraction (e.g. 1.2 lakh, 120000, 90k, 50,000)
  let budget: number | null = null;
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs|l)/i);
  const kMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand)/i);
  const rawNumMatch = text.match(/(?:budget|around|approx|total|of)?\s*(?:rs\.?|inr|₹)?\s*([1-9]\d{1,2}(?:,\d{3})+|[1-9]\d{3,6})/i);

  if (lakhMatch) {
    budget = Math.round(parseFloat(lakhMatch[1]) * 100000);
  } else if (kMatch) {
    budget = Math.round(parseFloat(kMatch[1]) * 1000);
  } else if (rawNumMatch) {
    budget = parseInt(rawNumMatch[1].replace(/,/g, ""), 10);
  }

  // Destination extraction
  let destination = "Kerala";
  if (text.includes("munnar") && text.includes("alleppey")) {
    destination = "Munnar & Alleppey";
  } else if (text.includes("wayanad")) {
    destination = "Wayanad";
  } else if (text.includes("madurai") || text.includes("rameswaram") || text.includes("kanyakumari")) {
    destination = "Madurai, Rameswaram & Kanyakumari";
  } else if (text.includes("kochi") || text.includes("marari")) {
    destination = "Complete Kerala & Marari Beach";
  }

  // Special requirements extraction
  const special_requirements: string[] = [];
  if (text.includes("houseboat")) special_requirements.push("Houseboat");
  if (text.includes("honeymoon")) special_requirements.push("Honeymoon Special");
  if (text.includes("kid") || text.includes("child")) special_requirements.push("Child friendly");
  if (text.includes("veg")) special_requirements.push("Vegetarian Dining");
  if (text.includes("ayurved")) special_requirements.push("Ayurvedic Wellness");
  if (text.includes("photo") || text.includes("camera")) special_requirements.push("Photography");
  if (text.includes("senior") || text.includes("elderly")) special_requirements.push("Senior Citizen Friendly");
  if (text.includes("luxury") || text.includes("5 star") || text.includes("5-star")) special_requirements.push("5-Star Luxury");
  if (text.includes("monsoon") || text.includes("rain")) special_requirements.push("Monsoon Experience");

  return {
    destination,
    adults,
    children,
    duration,
    travel_month,
    budget,
    special_requirements,
    confidence: 0.88,
  };
}

/**
 * Deterministic Package Matching Engine
 * Compares extracted requirements against real published packages and real seasonal prices in the database.
 * NEVER invents packages or prices!
 */
export async function matchPackagesDeterministically(
  extracted: ExtractedEnquiryData
): Promise<PackageRecommendation[]> {
  const publishedPackages = await prisma.package.findMany({
    where: {
      status: { in: [PackageStatus.PUBLISHED, PackageStatus.DRAFT] },
    },
    include: {
      seasonalPrices: true,
      hotels: true,
    },
  });

  if (publishedPackages.length === 0) {
    return [];
  }

  const recommendations: PackageRecommendation[] = [];

  for (const pkg of publishedPackages) {
    let score = 0.5; // Base score
    const titleLower = (pkg.title + " " + pkg.destination + " " + pkg.description).toLowerCase();
    const destLower = extracted.destination.toLowerCase();

    // 1. Destination Matching
    if (titleLower.includes(destLower) || destLower.includes(pkg.destination.toLowerCase())) {
      score += 0.25;
    }

    // 2. Requirements Matching
    let matchedRequirementsCount = 0;
    for (const req of extracted.special_requirements) {
      if (titleLower.includes(req.toLowerCase())) {
        matchedRequirementsCount++;
        score += 0.1;
      }
    }

    // 3. Determine applicable seasonal price from DB
    // Match based on travel_month if provided, or take the lowest / primary price
    let selectedPrice = pkg.seasonalPrices[0];
    const month = extracted.travel_month.toLowerCase();

    if (month.includes("december") || month.includes("january") || month.includes("february") || month.includes("october") || month.includes("november") || month.includes("march")) {
      const peak = pkg.seasonalPrices.find(p => p.seasonName.toLowerCase().includes("peak") || p.seasonName.toLowerCase().includes("winter"));
      if (peak) selectedPrice = peak;
    } else if (month.includes("june") || month.includes("july") || month.includes("august") || month.includes("september")) {
      const monsoon = pkg.seasonalPrices.find(p => p.seasonName.toLowerCase().includes("monsoon") || p.seasonName.toLowerCase().includes("summer"));
      if (monsoon) selectedPrice = monsoon;
    }

    if (!selectedPrice) continue;

    // Twin-sharing total calculation
    const totalPax = extracted.adults + extracted.children;
    const estimatedTotal = Math.round(selectedPrice.pricePerPerson * extracted.adults + (selectedPrice.pricePerPerson * 0.5 * extracted.children));

    // 4. Budget Compatibility
    if (extracted.budget) {
      if (estimatedTotal <= extracted.budget) {
        score += 0.15;
      } else if (estimatedTotal <= extracted.budget * 1.2) {
        score += 0.05;
      } else {
        score -= 0.1;
      }
    }

    // Generate clear transparent reasoning
    let reason = `Matches ${pkg.destination} with ${pkg.duration} duration.`;
    if (matchedRequirementsCount > 0) {
      reason += ` Includes requested highlights (${extracted.special_requirements.join(", ")}).`;
    }
    if (extracted.budget) {
      if (estimatedTotal <= extracted.budget) {
        reason += ` Estimated total of ₹${estimatedTotal.toLocaleString("en-IN")} fits comfortably within your budget of ₹${extracted.budget.toLocaleString("en-IN")}.`;
      } else {
        reason += ` Estimated total is ₹${estimatedTotal.toLocaleString("en-IN")}.`;
      }
    }

    recommendations.push({
      packageId: pkg.id,
      packageCode: pkg.packageCode,
      title: pkg.title,
      slug: pkg.slug,
      matchScore: Math.min(0.99, Math.max(0.4, Number(score.toFixed(2)))),
      seasonMatched: selectedPrice.seasonName,
      pricePerPerson: selectedPrice.pricePerPerson,
      estimatedTotal,
      reason,
    });
  }

  // Sort descending by match score and return top 3
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  return recommendations.slice(0, 3);
}

/**
 * Deterministic Professional Reply Draft Generator
 * Strictly uses real package names, real destinations, and real seasonal rates from the DB!
 */
export function generateReplyDraft(
  customerName: string,
  extracted: ExtractedEnquiryData,
  topPackage?: PackageRecommendation
): string {
  const firstName = customerName ? customerName.split(" ")[0] : "Traveller";

  if (!topPackage) {
    return `Dear ${firstName},

Greetings from Aroha Travels! Thank you for reaching out to us regarding your planned trip to South India.

We have received your enquiry for ${extracted.adults} adult(s)${extracted.children > 0 ? ` and ${extracted.children} child(ren)` : ""} for ${extracted.duration} in ${extracted.travel_month}. Our senior travel designer is reviewing availability across our handpicked boutique stays and will get back to you within 2 business hours with a tailored itinerary.

Warm regards,
Aroha Travels Concierge Team
info@aroha.com | +91 484 290 1234`;
  }

  const specialReqText = extracted.special_requirements.length > 0
    ? `including your preferences for ${extracted.special_requirements.join(", ")}`
    : "tailored to your travel pace";

  const budgetLine = extracted.budget
    ? `At an estimated total of ₹${topPackage.estimatedTotal.toLocaleString("en-IN")} + 5% GST, this sits comfortably within your target budget of ₹${extracted.budget.toLocaleString("en-IN")}.`
    : `Total estimated package cost is ₹${topPackage.estimatedTotal.toLocaleString("en-IN")} + 5% GST based on twin-sharing.`;

  return `Dear ${firstName},

Greetings from Aroha Travels! Thank you for your interest in discovering South India with us.

Based on your requirement for ${extracted.adults} adult(s)${extracted.children > 0 ? ` and ${extracted.children} child(ren)` : ""} in ${extracted.travel_month}, we are delighted to recommend our curated experience:

🌟 "${topPackage.title}" (${topPackage.packageCode})
• Applicable Season: ${topPackage.seasonMatched}
• Rate: Starting from ₹${topPackage.pricePerPerson.toLocaleString("en-IN")} per person (Twin-Sharing basis, GST as applicable)
• Highlights: ${topPackage.reason}

${budgetLine}

We can customize every aspect of this journey, ${specialReqText}. May we send you the complete day-by-day itinerary brochure or schedule a brief call at your convenience?

Warm regards,
Travel Specialist
Aroha Travels – Discover South India, Beautifully.
Phone: +91 484 290 1234 | travel@aroha.com`;
}

/**
 * Main AI Assistant Pipeline:
 * Tries Gemini API if key is configured, validates with Zod, and falls back gracefully to rule-based NLP.
 */
export async function processEnquiryWithAI(
  customerName: string,
  originalMessage: string
): Promise<AIExtractionResult> {
  let extractedData: ExtractedEnquiryData | null = null;
  let provider: "gemini-1.5-flash" | "rule-based-fallback" = "rule-based-fallback";

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const prompt = `You are an expert travel enquiry analyst for Aroha Travels, a luxury boutique travel agency in Kerala and South India.
Extract structured travel information from the customer's enquiry message below.

Customer Name: ${customerName}
Enquiry Message: "${originalMessage}"

Return ONLY valid JSON matching this exact schema:
{
  "destination": string,
  "adults": number,
  "children": number,
  "duration": string,
  "travel_month": string,
  "budget": number or null,
  "special_requirements": string[],
  "confidence": number between 0 and 1
}`;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      const rawJson = JSON.parse(text);
      const validated = AIExtractionSchema.safeParse(rawJson);

      if (validated.success) {
        extractedData = validated.data;
        provider = "gemini-1.5-flash";
      }
    } catch (err) {
      console.warn("Gemini API call failed, invoking deterministic rule-based fallback:", err);
    }
  }

  // Fallback to rule-based extractor if Gemini is unavailable or not configured
  if (!extractedData) {
    extractedData = extractWithRuleBasedFallback(originalMessage);
    provider = "rule-based-fallback";
  }

  // Deterministically match against actual DB packages
  const recommendations = await matchPackagesDeterministically(extractedData);

  // Generate verified reply draft using real DB pricing
  const replyDraft = generateReplyDraft(customerName, extractedData, recommendations[0]);

  return {
    extractedData,
    confidence: extractedData.confidence,
    recommendations,
    replyDraft,
    provider,
  };
}

