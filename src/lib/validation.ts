import { z } from "zod";

export interface SeasonalPeriodInput {
  id?: string;
  seasonName: string;
  startDate: Date | string;
  endDate: Date | string;
  pricePerPerson: number;
  hotelCategory: string;
  gstDetails?: string;
  sharingBasis?: string;
}

/**
 * Validates that seasonal pricing periods do not overlap.
 * Returns { valid: true } or { valid: false, error: string }
 */
export function validateSeasonalPeriods(
  periods: SeasonalPeriodInput[]
): { valid: boolean; error?: string } {
  for (let i = 0; i < periods.length; i++) {
    const startA = new Date(periods[i].startDate).getTime();
    const endA = new Date(periods[i].endDate).getTime();

    if (isNaN(startA) || isNaN(endA)) {
      return { valid: false, error: `Invalid date format in season "${periods[i].seasonName}"` };
    }

    if (startA >= endA) {
      return {
        valid: false,
        error: `Season "${periods[i].seasonName}" end date must be strictly after start date.`,
      };
    }

    if (periods[i].pricePerPerson <= 0) {
      return {
        valid: false,
        error: `Season "${periods[i].seasonName}" price must be greater than 0.`,
      };
    }

    // Check overlap against other periods
    for (let j = i + 1; j < periods.length; j++) {
      const startB = new Date(periods[j].startDate).getTime();
      const endB = new Date(periods[j].endDate).getTime();

      // Overlap condition: startA <= endB && endA >= startB
      if (startA <= endB && endA >= startB) {
        return {
          valid: false,
          error: `Seasonal overlap detected: "${periods[i].seasonName}" (${new Date(startA).toISOString().split("T")[0]} to ${new Date(endA).toISOString().split("T")[0]}) overlaps with "${periods[j].seasonName}" (${new Date(startB).toISOString().split("T")[0]} to ${new Date(endB).toISOString().split("T")[0]}).`,
        };
      }
    }
  }

  return { valid: true };
}

// Zod schema for public enquiry submission
export const PublicEnquirySchema = z.object({
  customerName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(8, "Phone number must be at least 8 digits").max(20),
  destination: z.string().min(2, "Please specify a preferred destination"),
  travelStartDate: z.string().optional().nullable(),
  travelEndDate: z.string().optional().nullable(),
  duration: z.string().optional().nullable(),
  adults: z.coerce.number().int().min(1, "At least 1 adult is required").max(50),
  children: z.coerce.number().int().min(0).max(30).default(0),
  budget: z.coerce.number().positive("Budget must be a positive number").optional().nullable(),
  specialRequirements: z.string().max(1000).optional().nullable(),
  originalMessage: z.string().min(5, "Please provide a brief message about your trip plans").max(2000),
  preferredContactMethod: z.enum(["EMAIL", "PHONE", "WHATSAPP"]).default("EMAIL"),
  whatsappConsent: z.boolean().default(false),
  dpdpConsent: z.boolean().refine(val => val === true, {
    message: "You must accept the DPDP privacy policy to proceed",
  }),
});

// Zod schema for Admin Login
export const AdminLoginSchema = z.object({
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Zod schema for Package CMS Form
export const PackageFormSchema = z.object({
  packageCode: z.string().min(3, "Package code required (e.g. PKG-KL-15)"),
  slug: z.string().min(3, "URL Slug is required"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  destination: z.string().min(2, "Destination required"),
  duration: z.string().min(3, "Duration required (e.g. 6 Days / 5 Nights)"),
  description: z.string().min(20, "Detailed description required"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  heroImage: z.string().url("Valid image URL required"),
  featured: z.boolean().default(false),
  bestTimeToVisit: z.string().optional(),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  gallery: z.array(z.string()).default([]),
  changeSummary: z.string().optional(),
});

