"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, Compass, Filter, ArrowUpRight, ArrowRight, Calendar, Sparkles } from "lucide-react";

interface SeasonalPrice {
  id: string;
  seasonName: string;
  pricePerPerson: number;
  hotelCategory: string;
  sharingBasis?: string;
  gstDetails?: string;
}

interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
}

interface PackageItem {
  id: string;
  packageCode: string;
  slug: string;
  title: string;
  destination: string;
  duration: string;
  description: string;
  heroImage: string;
  featured: boolean;
  bestTimeToVisit: string | null;
  seasonalPrices: SeasonalPrice[];
  itineraryDays?: ItineraryDay[];
}

export default function PackageListClient({
  initialPackages,
  initialDest,
}: {
  initialPackages: PackageItem[];
  initialDest?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<string>(initialDest || "ALL");
  const [selectedDuration, setSelectedDuration] = useState<string>("ALL");
  const [selectedBudget, setSelectedBudget] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("FEATURED");

  // Filter & Sort Logic
  const filteredPackages = useMemo(() => {
    return initialPackages.filter((pkg) => {
      // 1. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = (pkg.title + " " + pkg.destination + " " + pkg.description + " " + pkg.packageCode).toLowerCase();
        if (!text.includes(q)) return false;
      }

      // 2. Destination Filter
      if (selectedDestination !== "ALL") {
        const dest = pkg.destination.toLowerCase();
        if (selectedDestination === "kerala" && !dest.includes("kerala")) return false;
        if (selectedDestination === "tamilnadu" && !dest.includes("tamil") && !dest.includes("madurai")) return false;
        if (selectedDestination === "munnar" && !dest.includes("munnar")) return false;
        if (selectedDestination === "alleppey" && !dest.includes("alleppey")) return false;
        if (selectedDestination === "wayanad" && !dest.includes("wayanad")) return false;
      }

      // 3. Duration Filter
      if (selectedDuration !== "ALL") {
        const dur = pkg.duration.toLowerCase();
        if (selectedDuration === "SHORT" && !dur.includes("4") && !dur.includes("5")) return false;
        if (selectedDuration === "MEDIUM" && !dur.includes("6") && !dur.includes("7")) return false;
        if (selectedDuration === "LONG" && !dur.includes("8") && !dur.includes("9") && !dur.includes("10")) return false;
      }

      // 4. Budget Filter (based on lowest seasonal price)
      const lowestPrice = pkg.seasonalPrices[0]?.pricePerPerson || 0;
      if (selectedBudget === "UNDER_25K" && lowestPrice > 25000) return false;
      if (selectedBudget === "25K_45K" && (lowestPrice < 25000 || lowestPrice > 45000)) return false;
      if (selectedBudget === "ABOVE_45K" && lowestPrice < 45000) return false;

      return true;
    }).sort((a, b) => {
      const priceA = a.seasonalPrices[0]?.pricePerPerson || 0;
      const priceB = b.seasonalPrices[0]?.pricePerPerson || 0;

      if (sortBy === "PRICE_ASC") return priceA - priceB;
      if (sortBy === "PRICE_DESC") return priceB - priceA;
      if (sortBy === "FEATURED") {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      }
      return 0;
    });
  }, [initialPackages, searchQuery, selectedDestination, selectedDuration, selectedBudget, sortBy]);

  return (
    <div className="space-y-12">
      {/* Search and Editorial Filter Bar */}
      <div className="bg-white border border-[#E9E1D5] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#6a7d61] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by keyword, region, or package code (e.g. Munnar, PKG-KL-07)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs sm:text-sm text-[#252925] placeholder:text-[#252925]/40 focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
            />
          </div>

          {/* Destination Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs font-mono uppercase tracking-wider text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20"
            >
              <option value="ALL">All Regions (South India)</option>
              <option value="kerala">Kerala (All Circuits)</option>
              <option value="munnar">Munnar Highlands</option>
              <option value="alleppey">Alleppey Backwaters</option>
              <option value="wayanad">Wayanad Rainforests</option>
              <option value="tamilnadu">Tamil Nadu Heritage</option>
            </select>
          </div>

          {/* Duration Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs font-mono uppercase tracking-wider text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20"
            >
              <option value="ALL">Any Pacing</option>
              <option value="SHORT">Short (4–5 Days)</option>
              <option value="MEDIUM">Classic (6–7 Days)</option>
              <option value="LONG">Grand (8+ Days)</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs font-mono uppercase tracking-wider text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20"
            >
              <option value="FEATURED">Curated First</option>
              <option value="PRICE_ASC">Tariff: Low to High</option>
              <option value="PRICE_DESC">Tariff: High to Low</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="mt-6 pt-6 border-t border-[#E9E1D5]/70 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="text-[10px] font-mono tracking-wider uppercase text-[#6a7d61] flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" /> Budget Tier:
          </span>
          {[
            { id: "ALL", label: "All Tariffs" },
            { id: "UNDER_25K", label: "Under ₹25,000 / guest" },
            { id: "25K_45K", label: "₹25,000 – ₹45,000 / guest" },
            { id: "ABOVE_45K", label: "Above ₹45,000 (Luxury Estates)" },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedBudget(tier.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedBudget === tier.id
                  ? "bg-[#173D32] text-[#FAF9F6] shadow-sm"
                  : "bg-[#FAF9F6] text-[#252925]/80 hover:bg-[#E9E1D5]"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#6a7d61] font-mono px-2">
        <p>
          CATALOG: <strong className="text-[#173D32] font-semibold">{filteredPackages.length}</strong> PUBLISHED EXPEDITIONS
        </p>
        {(searchQuery || selectedDestination !== "ALL" || selectedDuration !== "ALL" || selectedBudget !== "ALL") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedDestination("ALL");
              setSelectedDuration("ALL");
              setSelectedBudget("ALL");
            }}
            className="text-[#173D32] underline hover:text-[#215143] font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Package List Layout */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white border border-[#E9E1D5] rounded-3xl p-16 text-center max-w-lg mx-auto">
          <Compass className="w-12 h-12 text-[#A9B8A2] mx-auto mb-4 stroke-[1.5]" />
          <h3 className="font-serif text-2xl font-bold text-[#173D32] mb-2">
            No Expeditions Found
          </h3>
          <p className="text-xs text-[#252925]/70 mb-6 font-light leading-relaxed">
            We currently do not have a pre-curated package matching your exact filter parameters. Our bespoke travel atelier crafts custom routes tailored to your specific travel window.
          </p>
          <Link
            href="/#enquire"
            className="inline-block bg-[#173D32] text-[#FAF9F6] px-8 py-3 rounded-full text-xs font-semibold uppercase tracking-widest"
          >
            Design Custom Route
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Top Marquee Item (If Available) */}
          {filteredPackages.length > 0 && (
            <div className="bg-white border border-[#E9E1D5] rounded-3xl overflow-hidden shadow-sm group hover:border-[#173D32]/40 transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-6 relative h-80 sm:h-96 lg:h-auto overflow-hidden bg-[#E9E1D5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={filteredPackages[0].heroImage}
                    alt={filteredPackages[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="px-3 py-1 bg-[#173D32] text-[#FAF9F6] text-[10px] font-mono font-bold tracking-wider rounded-full">
                      {filteredPackages[0].packageCode}
                    </span>
                    <span className="px-3 py-1 bg-white/90 text-[#173D32] text-[10px] font-mono uppercase tracking-wider rounded-full">
                      {filteredPackages[0].duration}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-[#6a7d61] font-mono mb-2">
                      {filteredPackages[0].destination}
                    </div>

                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32] mb-4 group-hover:text-[#215143] leading-tight">
                      <Link href={`/packages/${filteredPackages[0].slug}`}>
                        {filteredPackages[0].title}
                      </Link>
                    </h2>

                    <p className="text-xs sm:text-sm text-[#252925]/75 leading-relaxed font-light mb-6">
                      {filteredPackages[0].description}
                    </p>

                    {filteredPackages[0].bestTimeToVisit && (
                      <p className="text-[11px] text-[#6a7d61] font-mono mb-6">
                        SEASON: {filteredPackages[0].bestTimeToVisit}
                      </p>
                    )}
                  </div>

                  <div className="pt-6 border-t border-[#E9E1D5] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#6a7d61] block font-mono">
                        Direct Seasonal Tariff
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-serif text-2xl font-bold text-[#173D32]">
                          ₹{filteredPackages[0].seasonalPrices[0]?.pricePerPerson?.toLocaleString("en-IN") || "Enquire"}
                        </span>
                        <span className="text-[10px] text-[#6a7d61]">/ guest (twin-sharing)</span>
                      </div>
                    </div>

                    <Link
                      href={`/packages/${filteredPackages[0].slug}`}
                      className="px-6 py-3 bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] rounded-full text-xs font-semibold tracking-wider uppercase transition-all flex items-center gap-2"
                    >
                      <span>Explore Monograph</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Remaining Packages in Refined Editorial 2-Col Grid */}
          {filteredPackages.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredPackages.slice(1).map((pkg) => {
                const lowestPrice = pkg.seasonalPrices[0]?.pricePerPerson;
                return (
                  <article
                    key={pkg.id}
                    className="bg-white border border-[#E9E1D5] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-[#173D32]/40 transition-all duration-300"
                  >
                    <div>
                      <div className="relative h-64 overflow-hidden bg-[#E9E1D5]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pkg.heroImage}
                          alt={pkg.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <span className="px-3 py-1 bg-[#173D32]/90 backdrop-blur-sm text-[#FAF9F6] text-[10px] font-mono uppercase tracking-wider rounded-full">
                            {pkg.duration}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <span className="px-2.5 py-0.5 bg-white/90 text-[#173D32] text-[10px] font-mono font-bold rounded">
                            {pkg.packageCode}
                          </span>
                        </div>
                      </div>

                      <div className="p-8">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[#6a7d61] font-mono mb-2">
                          {pkg.destination}
                        </div>

                        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#173D32] group-hover:text-[#215143] leading-snug mb-3">
                          <Link href={`/packages/${pkg.slug}`}>
                            {pkg.title}
                          </Link>
                        </h3>

                        <p className="text-xs text-[#252925]/75 line-clamp-3 leading-relaxed mb-6 font-light">
                          {pkg.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-8 pt-0 border-t border-[#E9E1D5]/60 mt-auto flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#6a7d61] block font-mono">
                          Starting Tariff
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="font-serif text-xl font-bold text-[#173D32]">
                            ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "Enquire"}
                          </span>
                          <span className="text-[10px] text-[#6a7d61]">/ guest</span>
                        </div>
                      </div>

                      <Link
                        href={`/packages/${pkg.slug}`}
                        className="px-5 py-2.5 bg-[#FAF9F6] border border-[#173D32] text-[#173D32] group-hover:bg-[#173D32] group-hover:text-[#FAF9F6] rounded-full text-xs font-semibold uppercase tracking-wider transition-all"
                      >
                        Read Details
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
