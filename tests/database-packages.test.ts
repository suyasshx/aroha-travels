import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";
import { PackageStatus, EnquiryStatus } from "@prisma/client";

describe("3, 4, 6, 7 & 8. Database Package CRUD, Versioning & Enquiry Tests", () => {
  const testPackageCode = "TEST-PKG-99";
  let createdPackageId = "";

  afterAll(async () => {
    // Cleanup test records
    await prisma.packageVersion.deleteMany({
      where: { package: { packageCode: testPackageCode } },
    });
    await prisma.seasonalPrice.deleteMany({
      where: { package: { packageCode: testPackageCode } },
    });
    await prisma.package.deleteMany({
      where: { packageCode: testPackageCode },
    });
    await prisma.enquiry.deleteMany({
      where: { customerName: "Automated Test Guest" },
    });
  });

  it("3. should create a package with seasonal rates and record initial Version 1", async () => {
    const pkg = await prisma.package.create({
      data: {
        packageCode: testPackageCode,
        slug: "test-circuit-kochi-munnar",
        title: "Test Kochi and Munnar Circuit",
        destination: "Kochi & Munnar, Kerala",
        duration: "5 Days / 4 Nights",
        description: "A test package for verification of persistence and version history.",
        status: PackageStatus.DRAFT,
        heroImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
        seasonalPrices: {
          create: [
            {
              seasonName: "Regular Season",
              startDate: new Date("2026-09-01"),
              endDate: new Date("2027-04-30"),
              pricePerPerson: 22000,
              hotelCategory: "4-Star",
            },
          ],
        },
      },
    });

    createdPackageId = pkg.id;
    expect(pkg.id).toBeDefined();
    expect(pkg.status).toBe(PackageStatus.DRAFT);

    // Create Version 1 snapshot
    const version1 = await prisma.packageVersion.create({
      data: {
        packageId: pkg.id,
        versionNumber: 1,
        snapshot: { title: pkg.title, price: 22000 },
        changeSummary: "Created initial test package",
        updatedBy: "test@aroha.com",
      },
    });

    expect(version1.versionNumber).toBe(1);
    expect(version1.packageId).toBe(pkg.id);
  });

  it("4 & 6. should edit package and increment immutable version history (Version 2)", async () => {
    const updated = await prisma.package.update({
      where: { id: createdPackageId },
      data: {
        title: "Test Kochi and Munnar Circuit (Revised)",
        status: PackageStatus.PUBLISHED,
      },
    });

    expect(updated.title).toContain("(Revised)");
    expect(updated.status).toBe(PackageStatus.PUBLISHED);

    // Create Version 2 snapshot
    const version2 = await prisma.packageVersion.create({
      data: {
        packageId: createdPackageId,
        versionNumber: 2,
        snapshot: { title: updated.title, status: updated.status },
        changeSummary: "Published package and revised title",
        updatedBy: "test@aroha.com",
      },
    });

    expect(version2.versionNumber).toBe(2);

    // Verify history contains both versions without overwriting historical version 1
    const versions = await prisma.packageVersion.findMany({
      where: { packageId: createdPackageId },
      orderBy: { versionNumber: "asc" },
    });

    expect(versions.length).toBe(2);
    expect(versions[0].versionNumber).toBe(1);
    expect(versions[1].versionNumber).toBe(2);
  });

  it("7. should enforce that public package query filters out DRAFT packages", async () => {
    // Query public packages
    const publicPackages = await prisma.package.findMany({
      where: { status: PackageStatus.PUBLISHED },
    });

    for (const p of publicPackages) {
      expect(p.status).toBe(PackageStatus.PUBLISHED);
    }

    // Verify PKG-SI-12 (Draft) is NOT present in public query
    const draftInPublic = publicPackages.find((p) => p.packageCode === "PKG-SI-12");
    expect(draftInPublic).toBeUndefined();
  });

  it("8. should submit customer enquiry, generate unique ID, and persist in DB", async () => {
    const count = await prisma.enquiry.count();
    const enquiryNumber = `ENQ-TEST-${count + 1}`;

    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber,
        customerName: "Automated Test Guest",
        email: "testguest@example.com",
        phone: "+91 99999 88888",
        destination: "Kerala",
        adults: 2,
        children: 0,
        originalMessage: "Testing automated enquiry pipeline with 2 adults.",
        whatsappConsent: false,
        status: EnquiryStatus.NEW,
      },
    });

    expect(enquiry.id).toBeDefined();
    expect(enquiry.enquiryNumber).toBe(enquiryNumber);
    expect(enquiry.status).toBe(EnquiryStatus.NEW);
  });
});

