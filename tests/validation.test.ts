import { describe, it, expect } from "vitest";
import { validateSeasonalPeriods, PublicEnquirySchema, PackageFormSchema } from "../src/lib/validation";

describe("5 & 8. Validation Tests (Seasonal Overlaps & Schemas)", () => {
  it("should successfully validate non-overlapping seasonal periods", () => {
    const validPeriods = [
      {
        seasonName: "Peak Season",
        startDate: "2026-10-01",
        endDate: "2027-03-31",
        pricePerPerson: 32500,
        hotelCategory: "4-Star",
      },
      {
        seasonName: "Monsoon Season",
        startDate: "2026-06-01",
        endDate: "2026-09-30",
        pricePerPerson: 24900,
        hotelCategory: "4-Star",
      },
      {
        seasonName: "Summer Season",
        startDate: "2026-04-01",
        endDate: "2026-05-31",
        pricePerPerson: 27500,
        hotelCategory: "4-Star",
      },
    ];

    const result = validateSeasonalPeriods(validPeriods);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject overlapping seasonal periods with descriptive error", () => {
    const overlappingPeriods = [
      {
        seasonName: "Period A",
        startDate: "2026-10-01",
        endDate: "2027-03-31",
        pricePerPerson: 32500,
        hotelCategory: "4-Star",
      },
      {
        seasonName: "Period B",
        startDate: "2026-12-01", // Overlaps with Period A!
        endDate: "2027-04-30",
        pricePerPerson: 35000,
        hotelCategory: "4-Star",
      },
    ];

    const result = validateSeasonalPeriods(overlappingPeriods);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Seasonal overlap detected");
    expect(result.error).toContain("Period A");
    expect(result.error).toContain("Period B");
  });

  it("should reject seasonal periods where end date is before start date", () => {
    const invalidDates = [
      {
        seasonName: "Inverted Dates",
        startDate: "2026-10-31",
        endDate: "2026-10-01",
        pricePerPerson: 20000,
        hotelCategory: "3-Star",
      },
    ];

    const result = validateSeasonalPeriods(invalidDates);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("end date must be strictly after start date");
  });

  it("should validate public enquiry form input and enforce DPDP consent", () => {
    // Valid Enquiry
    const validEnquiry = {
      customerName: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "+91 98201 12345",
      destination: "Kerala",
      adults: 2,
      children: 1,
      budget: 120000,
      originalMessage: "Kerala 5-6 nights in December with private houseboat.",
      preferredContactMethod: "WHATSAPP",
      whatsappConsent: true,
      dpdpConsent: true,
    };

    const parseResult = PublicEnquirySchema.safeParse(validEnquiry);
    expect(parseResult.success).toBe(true);

    // Missing DPDP Consent
    const missingConsent = {
      ...validEnquiry,
      dpdpConsent: false,
    };
    const invalidResult = PublicEnquirySchema.safeParse(missingConsent);
    expect(invalidResult.success).toBe(false);
  });
});

