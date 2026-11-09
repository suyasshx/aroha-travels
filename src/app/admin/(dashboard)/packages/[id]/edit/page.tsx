import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PackageEditor from "@/components/admin/PackageEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPackagePage({ params }: PageProps) {
  const { id } = await params;

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
    notFound();
  }

  return <PackageEditor initialData={pkg as any} />;
}

