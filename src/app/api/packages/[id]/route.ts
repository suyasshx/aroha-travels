import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/auth";
import { validateSeasonalPeriods } from "@/lib/validation";
import { PackageStatus } from "@prisma/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET /api/packages/[id] - fetch single package with all relations & versions
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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

// PUT /api/packages/[id] - update package & record version history
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
      inclusions,
      exclusions,
      gallery,
      seasonalPrices,
      itineraryDays,
      hotels,
      changeSummary = "Updated package details and pricing",
    } = body;

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
          packageCode: packageCode || existingPkg.packageCode,
          slug: slug || existingPkg.slug,
          title: title || existingPkg.title,
          destination: destination || existingPkg.destination,
          duration: duration || existingPkg.duration,
          description: description || existingPkg.description,
          status: status || existingPkg.status,
          heroImage: heroImage || existingPkg.heroImage,
          featured: featured !== undefined ? featured : existingPkg.featured,
          bestTimeToVisit: bestTimeToVisit !== undefined ? bestTimeToVisit : existingPkg.bestTimeToVisit,
          inclusions: inclusions !== undefined ? inclusions : existingPkg.inclusions,
          exclusions: exclusions !== undefined ? exclusions : existingPkg.exclusions,
          gallery: gallery !== undefined ? gallery : existingPkg.gallery,
          seasonalPrices: seasonalPrices
            ? {
                create: seasonalPrices.map((sp: any) => ({
                  seasonName: sp.seasonName,
                  startDate: new Date(sp.startDate),
                  endDate: new Date(sp.endDate),
                  pricePerPerson: Number(sp.pricePerPerson),
                  hotelCategory: sp.hotelCategory || "4-Star",
                  gstDetails: sp.gstDetails || "5% GST applicable",
                  sharingBasis: sp.sharingBasis || "Twin Sharing Basis",
                })),
              }
            : undefined,
          itineraryDays: itineraryDays
            ? {
                create: itineraryDays.map((day: any, idx: number) => ({
                  dayNumber: day.dayNumber || idx + 1,
                  title: day.title,
                  description: day.description,
                  activities: Array.isArray(day.activities) ? day.activities : [],
                  stay: day.stay || null,
                  meals: day.meals || null,
                })),
              }
            : undefined,
          hotels: hotels
            ? {
                create: hotels.map((h: any) => ({
                  name: h.name,
                  category: h.category,
                  location: h.location,
                  roomType: h.roomType || null,
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
  } catch (error: any) {
    console.error("Update package error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/packages/[id] - delete or archive package
export async function DELETE(req: NextRequest, props: RouteProps) {
  try {
    const session = await requireStaffAdmin();
    const { id } = await props.params;

    const existingPkg = await prisma.package.findUnique({ where: { id } });
    if (!existingPkg) {
      return NextResponse.json({ success: false, error: "Package not found" }, { status: 404 });
    }

    // Check query params: if ?archive=true, set status to ARCHIVED, otherwise delete
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
  } catch (error: any) {
    console.error("Delete package error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

