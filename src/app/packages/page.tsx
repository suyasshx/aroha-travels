import { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PackageListClient from "./PackageListClient";
import { prisma } from "@/lib/prisma";
import { PackageStatus } from "@prisma/client";

export const metadata: Metadata = {
  title: "Curated Expeditions & Regional Circuits | Aroha Travels",
  description:
    "Explore our complete collection of handcrafted holiday packages across Kerala and South India. Contracted boutique resort tariffs, private houseboats, and verified seasonal pricing.",
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
      itineraryDays: {
        orderBy: {
          dayNumber: "asc",
        },
      },
    },
    orderBy: {
      featured: "desc",
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252925] selection:bg-[#173D32] selection:text-[#FAF9F6]">
      <Header />

      <main className="flex-grow py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          {/* Editorial Archive Header */}
          <div className="max-w-3xl mb-14 border-b border-[#E9E1D5] pb-10">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#6a7d61] block mb-3">
              THE AROHA COLLECTION · COMPLETE CATALOG
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#173D32] leading-tight mb-4">
              Curated Expeditions
            </h1>
            <p className="text-xs sm:text-base text-[#252925]/75 leading-relaxed font-light">
              Every itinerary in our collection is paced deliberately to allow deep immersion. Stays are contracted with heritage estates and boutique eco-villas, accompanied by private chauffeur-naturalists and transparent seasonal tariffs.
            </p>
          </div>

          {/* Interactive Client Listing with Search, Filters, and Curated Layouts */}
          <PackageListClient initialPackages={packages as any} initialDest={initialDest} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
