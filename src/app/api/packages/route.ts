import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/auth";
import { validateSeasonalPeriods } from "@/lib/validation";
import { PackageStatus } from "@prisma/client";

// GET /api/packages - list all packages (admin view)
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

// POST /api/packages - create new package
export async function POST(req: NextRequest) {
  try {
    const session = await requireStaffAdmin();
    const body = await req.json();

    const {
      packageCode,
      slug,
      title,
      destination,
      duration,
      description,
      status = PackageStatus.DRAFT,
      heroImage,
      featured = false,
      bestTimeToVisit,
      inclusions = [],
      exclusions = [],
      gallery = [],
      seasonalPrices = [],
      itineraryDays = [],
      hotels = [],
      changeSummary = "Initial package creation",
    } = body;

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
        bestTimeToVisit: bestTimeToVisit || null,
        inclusions,
        exclusions,
        gallery,
        seasonalPrices: {
          create: seasonalPrices.map((sp: any) => ({
            seasonName: sp.seasonName,
            startDate: new Date(sp.startDate),
            endDate: new Date(sp.endDate),
            pricePerPerson: Number(sp.pricePerPerson),
            hotelCategory: sp.hotelCategory || "4-Star Deluxe",
            gstDetails: sp.gstDetails || "5% GST applicable",
            sharingBasis: sp.sharingBasis || "Twin Sharing Basis",
          })),
        },
        itineraryDays: {
          create: itineraryDays.map((day: any, idx: number) => ({
            dayNumber: day.dayNumber || idx + 1,
            title: day.title,
            description: day.description,
            activities: Array.isArray(day.activities) ? day.activities : [],
            stay: day.stay || null,
            meals: day.meals || null,
          })),
        },
        hotels: {
          create: hotels.map((h: any) => ({
            name: h.name,
            category: h.category,
            location: h.location,
            roomType: h.roomType || null,
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
  } catch (error: any) {
    console.error("Create package error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

