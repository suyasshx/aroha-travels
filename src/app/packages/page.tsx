import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PackageListClient from "./PackageListClient";
import { prisma } from "@/lib/prisma";
import { PackageStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Curated Holiday Packages & Itineraries",
  description:
    "Explore our complete collection of handcrafted holiday packages across Kerala and South India. Contracted resort tariffs, private houseboats, and verified seasonal pricing.",
};

export const revalidate = 60;

export default async function PackagesPage(props: {
  searchParams?: Promise<{ dest?: string }>;
}) {
  const searchParams = await props.searchParams;
  const initialDest = searchParams?.dest || "ALL";

  // Query only PUBLISHED packages for public visitors!
  const packages = await prisma.package.findMany({
    where: {
      status: PackageStatus.PUBLISHED,
    },
    include: {
      seasonalPrices: {
        orderBy: {
          pricePerPerson: "asc",
        },
      },
    },
    orderBy: {
      featured: "desc",
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />

      <main className="flex-grow py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#6a7d61] block mb-2">
              Explore Journeys
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#173D32] leading-tight mb-4">
              Curated Kerala & South India Packages
            </h1>
            <p className="text-sm sm:text-base text-[#252925]/75 leading-relaxed">
              Every package is designed with generous pacing, handpicked boutique hotels, and verified seasonal rates directly pulled from our contracted database.
            </p>
          </div>

          {/* Interactive Client Listing with Search, Filters, Sort */}
          <PackageListClient initialPackages={packages as any} initialDest={initialDest} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

