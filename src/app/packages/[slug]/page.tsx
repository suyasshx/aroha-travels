import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicEnquiryForm from "@/components/PublicEnquiryForm";
import { prisma } from "@/lib/prisma";
import { PackageStatus } from "@prisma/client";
import {
  MapPin,
  Clock,
  Calendar,
  Check,
  X,
  Hotel as HotelIcon,
  Sparkles,
  Info,
  ShieldCheck,
  ChevronDown,
  Navigation,
} from "lucide-react";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await prisma.package.findUnique({
    where: { slug },
  });

  if (!pkg || pkg.status !== PackageStatus.PUBLISHED) {
    return {
      title: "Package Not Found",
    };
  }

  return {
    title: `${pkg.title} (${pkg.duration})`,
    description: pkg.description.slice(0, 160),
    openGraph: {
      title: `${pkg.title} | Aroha Travels`,
      description: pkg.description.slice(0, 160),
      images: [{ url: pkg.heroImage }],
    },
  };
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Retrieve published package from PostgreSQL
  const pkg = await prisma.package.findUnique({
    where: { slug },
    include: {
      seasonalPrices: {
        orderBy: { startDate: "asc" },
      },
      itineraryDays: {
        orderBy: { dayNumber: "asc" },
      },
      hotels: true,
    },
  });

  // Enforce rule: Only PUBLISHED packages visible on public routes!
  if (!pkg || pkg.status !== PackageStatus.PUBLISHED) {
    notFound();
  }

  const lowestPrice = pkg.seasonalPrices[0]?.pricePerPerson;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />

      <main className="flex-grow pb-24">
        {/* DESTINATION HERO IMAGE */}
        <section className="relative h-[65vh] min-h-[460px] bg-[#173D32] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pkg.heroImage}
            alt={pkg.title}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#173D32] via-[#173D32]/50 to-black/30" />

          <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 text-[#FAF9F6]">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded-full bg-[#FAF9F6]/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
                  {pkg.duration}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#173D32] border border-[#A9B8A2]/30 text-xs font-mono font-bold tracking-wider">
                  {pkg.packageCode}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#A9B8A2] font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {pkg.destination}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
                {pkg.title}
              </h1>

              <p className="text-sm sm:text-base text-[#FAF9F6]/85 max-w-3xl leading-relaxed">
                {pkg.description}
              </p>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT + FIXED/SIDEBAR ENQUIRY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left 8 Cols: Itinerary, Pricing, Hotels, Inclusions */}
            <div className="lg:col-span-8 space-y-12">
              {/* PRIMARY PRICING CALLOUT BANNER */}
              <div className="bg-white border border-[#E9E1D5] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#6a7d61] font-semibold block mb-1">
                    Verified Package Tariff
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-[#173D32]">
                      ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "Enquire"}
                    </span>
                    <span className="text-xs text-[#252925]/75 font-medium">
                      per person
                    </span>
                  </div>
                  <p className="text-xs text-[#173D32] font-semibold mt-1">
                    Starting from ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "---"} per person, based on twin sharing. GST as applicable.
                  </p>
                </div>

                <a
                  href="#enquire-form"
                  className="bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider text-center transition-all shadow cursor-pointer shrink-0"
                >
                  Book / Enquire Now
                </a>
              </div>

              {/* SEASONAL PRICING BREAKDOWN */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-[#173D32]" />
                  <h2 className="font-serif text-2xl font-bold text-[#173D32]">
                    Seasonal Pricing & Hotel Categories
                  </h2>
                </div>
                <p className="text-xs text-[#252925]/70 mb-5">
                  Tariffs vary by travel season and climate conditions. Pricing directly sourced from contracted resort allotments.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.seasonalPrices.map((season) => (
                    <div
                      key={season.id}
                      className="bg-white border border-[#E9E1D5] rounded-xl p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif font-bold text-base text-[#173D32]">
                          {season.seasonName}
                        </h3>
                        <span className="text-base font-bold text-[#173D32]">
                          ₹{season.pricePerPerson.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="text-xs text-[#6a7d61] space-y-1">
                        <p>
                          <strong>Validity:</strong> {new Date(season.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} – {new Date(season.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <p>
                          <strong>Hotel Tier:</strong> {season.hotelCategory}
                        </p>
                        <p>
                          <strong>Basis:</strong> {season.sharingBasis} ({season.gstDetails})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BEST TIME TO VISIT */}
              {pkg.bestTimeToVisit && (
                <div className="bg-[#FAF9F6] border border-[#E9E1D5] rounded-xl p-5 flex items-start gap-3.5">
                  <Info className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#173D32] uppercase tracking-wider mb-1">
                      Best Time to Travel
                    </h4>
                    <p className="text-xs text-[#252925]/85 leading-relaxed">
                      {pkg.bestTimeToVisit}
                    </p>
                  </div>
                </div>
              )}

              {/* DAY-WISE ITINERARY */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="w-5 h-5 text-[#173D32]" />
                  <h2 className="font-serif text-2xl font-bold text-[#173D32]">
                    Day-Wise Travel Itinerary
                  </h2>
                </div>

                <div className="space-y-4">
                  {pkg.itineraryDays.map((day) => (
                    <details
                      key={day.id}
                      open={day.dayNumber === 1}
                      className="group bg-white border border-[#E9E1D5] rounded-2xl overflow-hidden transition-all shadow-sm"
                    >
                      <summary className="p-5 sm:p-6 cursor-pointer list-none flex items-center justify-between hover:bg-[#FAF9F6] transition-colors select-none">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-full bg-[#173D32] text-[#FAF9F6] text-xs font-bold flex items-center justify-center shrink-0">
                            D{day.dayNumber}
                          </span>
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6a7d61] block">
                              Day {day.dayNumber}
                            </span>
                            <h3 className="font-serif text-base sm:text-lg font-bold text-[#173D32]">
                              {day.title}
                            </h3>
                          </div>
                        </div>
                        <ChevronDown className="w-5 h-5 text-[#6a7d61] group-open:rotate-180 transition-transform" />
                      </summary>

                      <div className="px-5 sm:px-6 pb-6 pt-2 border-t border-[#E9E1D5]/60 text-xs sm:text-sm text-[#252925]/80 space-y-4">
                        <p className="leading-relaxed">{day.description}</p>

                        {day.activities && day.activities.length > 0 && (
                          <div className="pt-2">
                            <h4 className="text-xs font-bold text-[#173D32] uppercase tracking-wider mb-2">
                              Day Highlights:
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {day.activities.map((act, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-xs text-[#252925]/80">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#173D32] mt-1.5 shrink-0" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="pt-3 border-t border-[#E9E1D5]/50 flex flex-wrap items-center justify-between gap-4 text-xs">
                          {day.stay && (
                            <p className="text-[#6a7d61]">
                              <strong className="text-[#173D32]">Overnight:</strong> {day.stay}
                            </p>
                          )}
                          {day.meals && (
                            <p className="text-[#6a7d61]">
                              <strong className="text-[#173D32]">Included Meals:</strong> {day.meals}
                            </p>
                          )}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* HOTEL ACCOMMODATION DETAILS */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <HotelIcon className="w-5 h-5 text-[#173D32]" />
                  <h2 className="font-serif text-2xl font-bold text-[#173D32]">
                    Handpicked Boutique Hotels & Stays
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {pkg.hotels.map((h) => (
                    <div
                      key={h.id}
                      className="bg-white border border-[#E9E1D5] rounded-xl p-5 shadow-sm space-y-2"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] block">
                        {h.category}
                      </span>
                      <h3 className="font-serif font-bold text-base text-[#173D32]">
                        {h.name}
                      </h3>
                      <p className="text-xs text-[#6a7d61]">
                        📍 {h.location}
                      </p>
                      {h.roomType && (
                        <p className="text-[11px] text-[#252925]/75 pt-1 border-t border-[#E9E1D5]/50">
                          Room: {h.roomType}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* INCLUSIONS & EXCLUSIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white border border-[#E9E1D5] rounded-2xl p-6 sm:p-8 shadow-sm">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#173D32] mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    Inclusions
                  </h3>
                  <ul className="space-y-2.5 text-xs text-[#252925]/80">
                    {pkg.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-[#173D32] mb-4 flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" />
                    Exclusions
                  </h3>
                  <ul className="space-y-2.5 text-xs text-[#252925]/80">
                    {pkg.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <X className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* PHOTO GALLERY */}
              {pkg.gallery && pkg.gallery.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#173D32] mb-4">
                    Journey Gallery
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {pkg.gallery.map((imgUrl, i) => (
                      <div key={i} className="h-44 rounded-xl overflow-hidden bg-[#E9E1D5] shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`${pkg.title} scene ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* DESTINATION MAP PLACEHOLDER */}
              <div className="bg-white border border-[#E9E1D5] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation className="w-4 h-4 text-[#173D32]" />
                  <h3 className="font-serif text-lg font-bold text-[#173D32]">
                    Destination Map & Route
                  </h3>
                </div>
                <div className="relative h-60 rounded-xl bg-[#e9eee6] border border-[#A9B8A2]/40 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#173D32_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative z-10 max-w-sm">
                    <MapPin className="w-8 h-8 text-[#173D32] mx-auto mb-2 animate-bounce" />
                    <p className="font-serif text-base font-bold text-[#173D32]">
                      {pkg.destination}
                    </p>
                    <p className="text-xs text-[#252925]/75 mt-1">
                      Route: Cochin International Airport → Munnar Western Ghats → Thekkady Periyar Reserve → Alleppey Backwater Jetty → Return Transfer.
                    </p>
                    <span className="inline-block mt-3 px-3 py-1 bg-white/80 rounded-full text-[10px] text-[#6a7d61] font-mono">
                      GPS Waypoints Contracted Private Driver Route
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Sticky Desktop Enquiry Form */}
            <div id="enquire-form" className="lg:col-span-4">
              <div className="sticky top-24">
                <PublicEnquiryForm
                  defaultDestination={pkg.destination}
                  defaultPackageTitle={pkg.title}
                />
              </div>
            </div>
          </div>
        </section>

        {/* FIXED PROMINENT MOBILE ENQUIRY CTA BAR */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF9F6] border-t border-[#E9E1D5] p-3 px-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#252925]/60 block uppercase tracking-wider">Starting from</span>
            <span className="text-lg font-serif font-bold text-[#173D32]">
              ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "Enquire"}
            </span>
            <span className="text-[9px] text-[#6a7d61] block -mt-1">per person / twin sharing</span>
          </div>

          <a
            href="#enquire-form"
            className="bg-[#173D32] text-[#FAF9F6] px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow"
          >
            Enquire Now
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}

