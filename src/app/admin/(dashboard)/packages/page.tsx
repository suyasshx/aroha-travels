import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PackageTableClient from "./PackageTableClient";
import { PlusCircle, Package as PackageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPackagesPage() {
  const packages = await prisma.package.findMany({
    include: {
      seasonalPrices: {
        orderBy: { startDate: "asc" },
      },
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6a7d61] block mb-1">
            Package CMS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
            Curated Package Inventory
          </h1>
          <p className="text-xs text-[#252925]/70 mt-0.5">
            Manage packages, seasonal price periods, day-wise itineraries, and version snapshots.
          </p>
        </div>

        <Link
          href="/admin/packages/new"
          className="bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Travel Package</span>
        </Link>
      </div>

      <PackageTableClient initialPackages={packages as any} />
    </div>
  );
}

