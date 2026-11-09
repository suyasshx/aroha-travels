import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/security";
import { PackageStatus } from "@prisma/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, props: RouteProps) {
  try {
    const session = await requireStaffAdmin();
    const { id } = await props.params;

    const sourcePkg = await prisma.package.findUnique({
      where: { id },
      include: {
        seasonalPrices: true,
        itineraryDays: true,
        hotels: true,
      },
    });

    if (!sourcePkg) {
      return NextResponse.json({ success: false, error: "Source package not found" }, { status: 404 });
    }

    const timestamp = Date.now().toString().slice(-4);
    const newCode = `${sourcePkg.packageCode}-COPY-${timestamp}`;
    const newSlug = `${sourcePkg.slug}-copy-${timestamp}`;
    const newTitle = `${sourcePkg.title} (Copy)`;

    const duplicated = await prisma.package.create({
      data: {
        packageCode: newCode,
        slug: newSlug,
        title: newTitle,
        destination: sourcePkg.destination,
        duration: sourcePkg.duration,
        description: sourcePkg.description,
        status: PackageStatus.DRAFT,
        heroImage: sourcePkg.heroImage,
        featured: false,
        bestTimeToVisit: sourcePkg.bestTimeToVisit,
        inclusions: sourcePkg.inclusions,
        exclusions: sourcePkg.exclusions,
        gallery: sourcePkg.gallery,
        seasonalPrices: {
          create: sourcePkg.seasonalPrices.map((sp) => ({
            seasonName: sp.seasonName,
            startDate: sp.startDate,
            endDate: sp.endDate,
            pricePerPerson: sp.pricePerPerson,
            hotelCategory: sp.hotelCategory,
            gstDetails: sp.gstDetails,
            sharingBasis: sp.sharingBasis,
          })),
        },
        itineraryDays: {
          create: sourcePkg.itineraryDays.map((day) => ({
            dayNumber: day.dayNumber,
            title: day.title,
            description: day.description,
            activities: day.activities,
            stay: day.stay,
            meals: day.meals,
          })),
        },
        hotels: {
          create: sourcePkg.hotels.map((h) => ({
            name: h.name,
            category: h.category,
            location: h.location,
            roomType: h.roomType,
          })),
        },
      },
    });

    // Create Version 1 snapshot for the duplicated package
    await prisma.packageVersion.create({
      data: {
        packageId: duplicated.id,
        versionNumber: 1,
        snapshot: {
          packageCode: duplicated.packageCode,
          title: duplicated.title,
          sourcePackageId: sourcePkg.id,
        },
        changeSummary: `Duplicated from ${sourcePkg.packageCode} (${sourcePkg.title})`,
        updatedBy: session.email,
      },
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: "PACKAGE_DUPLICATED",
        entityType: "PACKAGE",
        entityId: duplicated.id,
        details: `Duplicated ${sourcePkg.packageCode} into new draft package ${duplicated.packageCode}.`,
      },
    });

    return NextResponse.json({ success: true, package: duplicated });
  } catch (error: unknown) {
    return safeErrorResponse(error, "Failed to duplicate package.");
  }
}
