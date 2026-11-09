"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MapPin, Compass, Filter } from "lucide-react";

interface SeasonalPrice {
  id: string;
  seasonName: string;
  pricePerPerson: number;
  hotelCategory: string;
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
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="bg-white border border-[#E9E1D5] rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#6a7d61] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by destination, package code, or activity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30 focus:border-[#173D32]"
            />
          </div>

          {/* Destination Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs font-medium text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
            >
              <option value="ALL">All Destinations</option>
              <option value="kerala">Kerala (All)</option>
              <option value="munnar">Munnar Highlands</option>
              <option value="alleppey">Alleppey Backwaters</option>
              <option value="wayanad">Wayanad Rainforests</option>
              <option value="tamilnadu">Tamil Nadu Circuits</option>
            </select>
          </div>

          {/* Duration Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs font-medium text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
            >
              <option value="ALL">Any Duration</option>
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs font-medium text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
            >
              <option value="FEATURED">Featured First</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="mt-4 pt-4 border-t border-[#E9E1D5]/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#6a7d61] font-semibold flex items-center gap-1 mr-2">
            <Filter className="w-3.5 h-3.5" /> Budget Tier:
          </span>
          {[
            { id: "ALL", label: "All Budgets" },
            { id: "UNDER_25K", label: "Under ₹25,000" },
            { id: "25K_45K", label: "₹25,000 – ₹45,000" },
            { id: "ABOVE_45K", label: "Above ₹45,000 (Luxury)" },
          ].map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedBudget(tier.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedBudget === tier.id
                  ? "bg-[#173D32] text-[#FAF9F6]"
                  : "bg-[#FAF9F6] text-[#252925] hover:bg-[#E9E1D5]"
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#6a7d61]">
        <p>
          Showing <strong className="text-[#173D32]">{filteredPackages.length}</strong> verified curated journeys
        </p>
        {(searchQuery || selectedDestination !== "ALL" || selectedDuration !== "ALL" || selectedBudget !== "ALL") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedDestination("ALL");
              setSelectedDuration("ALL");
              setSelectedBudget("ALL");
            }}
            className="text-[#173D32] underline hover:text-[#215143] font-medium"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Package Grid */}
      {filteredPackages.length === 0 ? (
        <div className="bg-white border border-[#E9E1D5] rounded-2xl p-12 text-center max-w-lg mx-auto">
          <Compass className="w-12 h-12 text-[#A9B8A2] mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold text-[#173D32] mb-2">No Matching Journeys Found</h3>
          <p className="text-xs text-[#252925]/70 mb-6">
            We couldn't find a package matching your exact criteria. Our bespoke travel designers can craft a custom itinerary for you.
          </p>
          <Link
            href="/#enquire"
            className="inline-block bg-[#173D32] text-[#FAF9F6] px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
          >
            Request Custom Itinerary
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPackages.map((pkg) => {
            const lowestPrice = pkg.seasonalPrices[0]?.pricePerPerson;
            const hotelTier = pkg.seasonalPrices[0]?.hotelCategory;

            return (
              <div
                key={pkg.id}
                className="bg-white border border-[#E9E1D5] rounded-2xl overflow-hidden card-hover flex flex-col justify-between shadow-sm group"
              >
                <div>
                  <div className="relative h-64 overflow-hidden bg-[#E9E1D5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pkg.heroImage}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-[#173D32]/90 backdrop-blur-sm text-[#FAF9F6] text-xs font-semibold rounded-full tracking-wide">
                        {pkg.duration}
                      </span>
                      {pkg.featured && (
                        <span className="px-3 py-1 bg-[#C5A059] text-[#FAF9F6] text-xs font-semibold rounded-full tracking-wide">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2.5 py-0.5 bg-white/90 backdrop-blur-sm text-[#173D32] text-[10px] font-mono font-bold rounded">
                        {pkg.packageCode}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wider text-[#6a7d61] font-semibold mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{pkg.destination}</span>
                    </p>
                    <h3 className="font-serif text-xl font-bold text-[#173D32] group-hover:text-[#215143] transition-colors leading-snug mb-3">
                      <Link href={`/packages/${pkg.slug}`}>{pkg.title}</Link>
                    </h3>
                    <p className="text-xs text-[#252925]/75 line-clamp-3 leading-relaxed mb-4">
                      {pkg.description}
                    </p>

                    {hotelTier && (
                      <div className="inline-block px-2.5 py-1 rounded bg-[#FAF9F6] border border-[#E9E1D5] text-[11px] text-[#252925]/80 font-medium mb-2">
                        🏨 {hotelTier}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-[#E9E1D5]/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#252925]/60 block uppercase tracking-wider">
                        Starting from
                      </span>
                      <span className="text-xl font-serif font-bold text-[#173D32]">
                        ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "Inquire"}
                      </span>
                      <span className="text-[10px] text-[#6a7d61] block -mt-1 font-medium">
                        per person • twin sharing
                      </span>
                      <span className="text-[9px] text-[#252925]/50 block">
                        GST as applicable
                      </span>
                    </div>

                    <Link
                      href={`/packages/${pkg.slug}`}
                      className="px-5 py-2.5 bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] rounded-full text-xs font-semibold tracking-wide uppercase transition-all shadow-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
