import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/auth";
import { validateSeasonalPeriods } from "@/lib/validation";
import { sanitizeText } from "@/lib/sanitize";
import { safeErrorResponse } from "@/lib/security";
import { PackageStatus } from "@prisma/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET /api/packages/[id] - fetch single package (staff admin only)
export async function GET(req: NextRequest, props: RouteProps) {
  try {
    await requireStaffAdmin();
    const { id } = await props.params;

    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        seasonalPrices: { orderBy: { startDate: "asc" } },
        itineraryDays: { orderBy: { dayNumber: "asc" } },
        hotels: true,
        versions: { orderBy: { versionNumber: "desc" } },
      },
    });

    if (!pkg) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, package: pkg });
  } catch (error: unknown) {
    return safeErrorResponse(error, "Failed to retrieve package.", 401);
  }
}

// PUT /api/packages/[id] - update package & record version history (staff admin only)
export async function PUT(req: NextRequest, props: RouteProps) {
  try {
    const session = await requireStaffAdmin();
    const { id } = await props.params;
    const body = await req.json();

    const existingPkg = await prisma.package.findUnique({
      where: { id },
      include: {
        versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      },
    });

    if (!existingPkg) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 });
    }

    const {
      packageCode: rawCode,
      slug: rawSlug,
      title: rawTitle,
      destination: rawDest,
      duration: rawDuration,
      description: rawDesc,
      status,
      heroImage: rawHero,
      featured,
      bestTimeToVisit: rawBestTime,
      inclusions,
      exclusions,
      gallery,
      seasonalPrices,
      itineraryDays,
      hotels,
      changeSummary: rawSummary = "Updated package details and pricing",
    } = body;

    // Sanitize string inputs
    const packageCode = rawCode ? sanitizeText(rawCode).toUpperCase() : existingPkg.packageCode;
    const slug = rawSlug ? sanitizeText(rawSlug).toLowerCase() : existingPkg.slug;
    const title = rawTitle ? sanitizeText(rawTitle) : existingPkg.title;
    const destination = rawDest ? sanitizeText(rawDest) : existingPkg.destination;
    const duration = rawDuration ? sanitizeText(rawDuration) : existingPkg.duration;
    const description = rawDesc ? sanitizeText(rawDesc) : existingPkg.description;
    const heroImage = rawHero ? sanitizeText(rawHero) : existingPkg.heroImage;
    const bestTimeToVisit = rawBestTime !== undefined ? (rawBestTime ? sanitizeText(rawBestTime) : null) : existingPkg.bestTimeToVisit;
    const changeSummary = sanitizeText(rawSummary);

    // Validate seasonal pricing overlap if seasonalPrices provided
    if (seasonalPrices && seasonalPrices.length > 0) {
      const seasonalValidation = validateSeasonalPeriods(seasonalPrices);
      if (!seasonalValidation.valid) {
        return NextResponse.json({ success: false, error: seasonalValidation.error }, { status: 400 });
      }
    }

    // Atomic transaction: replace children & update package & create version history
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Delete old relations if replacing
      if (seasonalPrices) {
        await tx.seasonalPrice.deleteMany({ where: { packageId: id } });
      }
      if (itineraryDays) {
        await tx.itineraryDay.deleteMany({ where: { packageId: id } });
      }
      if (hotels) {
        await tx.hotel.deleteMany({ where: { packageId: id } });
      }

      // 2. Update Package fields
      const updatedPackage = await tx.package.update({
        where: { id },
        data: {
          packageCode,
          slug,
          title,
          destination,
          duration,
          description,
          status: status || existingPkg.status,
          heroImage,
          featured: featured !== undefined ? featured : existingPkg.featured,
          bestTimeToVisit,
          inclusions: inclusions ? inclusions.map((i: string) => sanitizeText(i)) : existingPkg.inclusions,
          exclusions: exclusions ? exclusions.map((e: string) => sanitizeText(e)) : existingPkg.exclusions,
          gallery: gallery ? gallery.map((g: string) => sanitizeText(g)) : existingPkg.gallery,
          seasonalPrices: seasonalPrices
            ? {
                create: seasonalPrices.map((sp: any) => ({
                  seasonName: sanitizeText(sp.seasonName),
                  startDate: new Date(sp.startDate),
                  endDate: new Date(sp.endDate),
                  pricePerPerson: Number(sp.pricePerPerson),
                  hotelCategory: sanitizeText(sp.hotelCategory || "4-Star"),
                  gstDetails: sanitizeText(sp.gstDetails || "5% GST applicable"),
                  sharingBasis: sanitizeText(sp.sharingBasis || "Twin Sharing Basis"),
                })),
              }
            : undefined,
          itineraryDays: itineraryDays
            ? {
                create: itineraryDays.map((day: any, idx: number) => ({
                  dayNumber: day.dayNumber || idx + 1,
                  title: sanitizeText(day.title),
                  description: sanitizeText(day.description),
                  activities: Array.isArray(day.activities) ? day.activities.map((a: string) => sanitizeText(a)) : [],
                  stay: day.stay ? sanitizeText(day.stay) : null,
                  meals: day.meals ? sanitizeText(day.meals) : null,
                })),
              }
            : undefined,
          hotels: hotels
            ? {
                create: hotels.map((h: any) => ({
                  name: sanitizeText(h.name),
                  category: sanitizeText(h.category),
                  location: sanitizeText(h.location),
                  roomType: h.roomType ? sanitizeText(h.roomType) : null,
                })),
              }
            : undefined,
        },
        include: {
          seasonalPrices: true,
          itineraryDays: true,
          hotels: true,
        },
      });

      // 3. Create Immutable Version History Snapshot
      const nextVersionNumber = (existingPkg.versions[0]?.versionNumber || 1) + 1;
      await tx.packageVersion.create({
        data: {
          packageId: id,
          versionNumber: nextVersionNumber,
          snapshot: {
            packageCode: updatedPackage.packageCode,
            title: updatedPackage.title,
            destination: updatedPackage.destination,
            duration: updatedPackage.duration,
            status: updatedPackage.status,
            heroImage: updatedPackage.heroImage,
            seasonalPrices: updatedPackage.seasonalPrices,
            itineraryDays: updatedPackage.itineraryDays,
            hotels: updatedPackage.hotels,
          },
          changeSummary,
          updatedBy: session.email,
        },
      });

      // 4. Log Activity
      await tx.activityLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          action: "PACKAGE_UPDATED",
          entityType: "PACKAGE",
          entityId: id,
          details: `Updated package ${updatedPackage.packageCode} (Version ${nextVersionNumber}): ${changeSummary}`,
        },
      });

      return updatedPackage;
    });

    return NextResponse.json({ success: true, package: updated });
  } catch (error: unknown) {
    return safeErrorResponse(error, "Failed to update package.");
  }
}

// DELETE /api/packages/[id] - delete or archive package (staff admin only)
export async function DELETE(req: NextRequest, props: RouteProps) {
  try {
    const session = await requireStaffAdmin();
    const { id } = await props.params;

    const existingPkg = await prisma.package.findUnique({ where: { id } });
    if (!existingPkg) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const archiveOnly = url.searchParams.get("archive") === "true";

    if (archiveOnly) {
      await prisma.package.update({
        where: { id },
        data: { status: PackageStatus.ARCHIVED },
      });
      await prisma.activityLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          action: "PACKAGE_ARCHIVED",
          entityType: "PACKAGE",
          entityId: id,
          details: `Archived package ${existingPkg.packageCode} (${existingPkg.title}).`,
        },
      });
      return NextResponse.json({ success: true, message: "Package archived successfully" });
    } else {
      await prisma.package.delete({ where: { id } });
      await prisma.activityLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          action: "PACKAGE_DELETED",
          entityType: "PACKAGE",
          entityId: id,
          details: `Permanently deleted package ${existingPkg.packageCode} (${existingPkg.title}).`,
        },
      });
      return NextResponse.json({ success: true, message: "Package permanently removed" });
    }
  } catch (error: unknown) {
    return safeErrorResponse(error, "Failed to delete package.");
  }
}
