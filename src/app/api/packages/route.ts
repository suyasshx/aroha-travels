import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/auth";
import { validateSeasonalPeriods } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { safeErrorResponse } from "@/lib/security";
import { PackageStatus } from "@prisma/client";

// GET /api/packages - list all packages (staff admin view only)
export async function GET() {
  try {
    await requireStaffAdmin();
    const packages = await prisma.package.findMany({
      include: {
        seasonalPrices: { orderBy: { startDate: "asc" } },
        hotels: true,
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, packages });
  } catch (error: unknown) {
    return safeErrorResponse(error, "Failed to retrieve packages.", 401);
  }
}

// POST /api/packages - create new package (staff admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await requireStaffAdmin();
    const body = await req.json();

    const {
      packageCode: rawCode,
      slug: rawSlug,
      title: rawTitle,
      destination: rawDest,
      duration: rawDuration,
      description: rawDesc,
      status = PackageStatus.DRAFT,
      heroImage: rawHero,
      featured = false,
      bestTimeToVisit: rawBestTime,
      inclusions = [],
      exclusions = [],
      gallery = [],
      seasonalPrices = [],
      itineraryDays = [],
      hotels = [],
      changeSummary: rawSummary = "Initial package creation",
    } = body;

    // Sanitize text inputs
    const packageCode = sanitizeText(rawCode).toUpperCase();
    const slug = sanitizeText(rawSlug).toLowerCase();
    const title = sanitizeText(rawTitle);
    const destination = sanitizeText(rawDest);
    const duration = sanitizeText(rawDuration);
    const description = sanitizeText(rawDesc);
    const heroImage = sanitizeText(rawHero);
    const bestTimeToVisit = rawBestTime ? sanitizeText(rawBestTime) : null;
    const changeSummary = sanitizeText(rawSummary);

    // Check unique constraints
    const existingCode = await prisma.package.findUnique({ where: { packageCode } });
    if (existingCode) {
      return NextResponse.json({ success: false, error: `Package code "${packageCode}" is already in use.` }, { status: 400 });
    }

    const existingSlug = await prisma.package.findUnique({ where: { slug } });
    if (existingSlug) {
      return NextResponse.json({ success: false, error: `URL Slug "${slug}" already exists. Please choose a unique slug.` }, { status: 400 });
    }

    // Validate seasonal pricing overlap
    if (seasonalPrices && seasonalPrices.length > 0) {
      const seasonalValidation = validateSeasonalPeriods(seasonalPrices);
      if (!seasonalValidation.valid) {
        return NextResponse.json({ success: false, error: seasonalValidation.error }, { status: 400 });
      }
    }

    // Create Package with nested records
    const newPackage = await prisma.package.create({
      data: {
        packageCode,
        slug,
        title,
        destination,
        duration,
        description,
        status,
        heroImage,
        featured,
        bestTimeToVisit,
        inclusions: inclusions.map((i: string) => sanitizeText(i)),
        exclusions: exclusions.map((e: string) => sanitizeText(e)),
        gallery: gallery.map((g: string) => sanitizeText(g)),
        seasonalPrices: {
          create: seasonalPrices.map((sp: any) => ({
            seasonName: sanitizeText(sp.seasonName),
            startDate: new Date(sp.startDate),
            endDate: new Date(sp.endDate),
            pricePerPerson: Number(sp.pricePerPerson),
            hotelCategory: sanitizeText(sp.hotelCategory || "4-Star Deluxe"),
            gstDetails: sanitizeText(sp.gstDetails || "5% GST applicable"),
            sharingBasis: sanitizeText(sp.sharingBasis || "Twin Sharing Basis"),
          })),
        },
        itineraryDays: {
          create: itineraryDays.map((day: any, idx: number) => ({
            dayNumber: day.dayNumber || idx + 1,
            title: sanitizeText(day.title),
            description: sanitizeText(day.description),
            activities: Array.isArray(day.activities) ? day.activities.map((a: string) => sanitizeText(a)) : [],
            stay: day.stay ? sanitizeText(day.stay) : null,
            meals: day.meals ? sanitizeText(day.meals) : null,
          })),
        },
        hotels: {
          create: hotels.map((h: any) => ({
            name: sanitizeText(h.name),
            category: sanitizeText(h.category),
            location: sanitizeText(h.location),
            roomType: h.roomType ? sanitizeText(h.roomType) : null,
          })),
        },
      },
    });

    // Create Version 1 snapshot
    await prisma.packageVersion.create({
      data: {
        packageId: newPackage.id,
        versionNumber: 1,
        snapshot: {
          packageCode: newPackage.packageCode,
          title: newPackage.title,
          destination: newPackage.destination,
          duration: newPackage.duration,
          status: newPackage.status,
          seasonalPrices,
          itineraryDays,
          hotels,
        },
        changeSummary,
        updatedBy: session.email,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: "PACKAGE_CREATED",
        entityType: "PACKAGE",
        entityId: newPackage.id,
        details: `Created package ${newPackage.packageCode} (${newPackage.title}) in ${newPackage.status} status.`,
      },
    });

    return NextResponse.json({ success: true, package: newPackage });
  } catch (error: unknown) {
    return safeErrorResponse(error, "Failed to create package.");
  }
}
