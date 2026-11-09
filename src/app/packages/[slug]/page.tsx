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
  Compass,
  ArrowRight,
  ArrowUpRight,
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
      title: "Expedition Monograph Not Found | Aroha Travels",
    };
  }

  return {
    title: `${pkg.title} (${pkg.duration}) — Expedition Monograph`,
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
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252925] selection:bg-[#173D32] selection:text-[#FAF9F6]">
      <Header />

      <main className="flex-grow pb-28">
        {/* ========================================================================= */}
        {/* 1. CINEMATIC MONOGRAPH HERO */}
        {/* ========================================================================= */}
        <section className="relative min-h-[70vh] flex items-end bg-[#173D32] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pkg.heroImage}
            alt={pkg.title}
            className="w-full h-full object-cover object-center absolute inset-0 opacity-60 scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#173D32] via-[#173D32]/60 to-black/30" />

          {/* Monograph Metadata Strip */}
          <div className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-12 pb-16 pt-32 text-[#FAF9F6]">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 rounded-full bg-[#FAF9F6]/20 backdrop-blur-md text-[10px] font-mono uppercase tracking-[0.2em] font-semibold text-[#FAF9F6]">
                  {pkg.duration}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#173D32] border border-[#A9B8A2]/40 text-[10px] font-mono font-bold tracking-wider text-[#FAF9F6]">
                  {pkg.packageCode}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#A9B8A2] font-mono uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                  {pkg.destination}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
                {pkg.title}
              </h1>

              <p className="text-sm sm:text-base text-[#FAF9F6]/90 max-w-3xl leading-relaxed font-light">
                {pkg.description}
              </p>
            </div>
          </div>
        </section>

        {/* Architectural Overview Strip */}
        <div className="border-b border-[#E9E1D5] bg-white py-4 px-6 sm:px-10 lg:px-12 text-xs text-[#252925]">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-[11px]">
            <div>
              <span className="text-[10px] text-[#6a7d61] uppercase block">Pacing</span>
              <strong className="text-[#173D32]">{pkg.duration}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#6a7d61] uppercase block">Carriage</span>
              <strong className="text-[#173D32]">Private Chauffeur Sedan</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#6a7d61] uppercase block">Optimal Window</span>
              <strong className="text-[#173D32]">{pkg.bestTimeToVisit || "September through May"}</strong>
            </div>
            <div>
              <span className="text-[10px] text-[#6a7d61] uppercase block">Tariff Guarantee</span>
              <strong className="text-[#173D32]">Direct Contracted Rates</strong>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. MAIN MONOGRAPH CONTENT + BESPOKE RESERVATIONS DRAWER */}
        {/* ========================================================================= */}
        <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left 8 Cols: Narrative Itinerary, Pricing Ledger, Hotels, Disclosures */}
            <div className="lg:col-span-8 space-y-16">
              {/* PRIMARY PRICING CALLOUT BANNER */}
              <div className="bg-white border border-[#E9E1D5] rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#6a7d61] block mb-1">
                    VERIFIED PACKAGE TARIFF
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-[#173D32]">
                      ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "Enquire"}
                    </span>
                    <span className="text-xs text-[#252925]/75 font-mono">
                      / guest
                    </span>
                  </div>
                  <p className="text-xs text-[#173D32] font-semibold mt-1">
                    Starting from ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "---"} per person, based on twin sharing. GST as applicable.
                  </p>
                </div>

                <a
                  href="#enquire-form"
                  className="bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-widest text-center transition-all shadow-md cursor-pointer shrink-0"
                >
                  Request Detailed Quote
                </a>
              </div>

              {/* SEASONAL PRICING BREAKDOWN */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-5 h-5 text-[#173D32]" />
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
                    Seasonal Tariffs & Hotel Allotments
                  </h2>
                </div>
                <p className="text-xs text-[#252925]/70 mb-6 font-light leading-relaxed">
                  Published tariffs are strictly contracted directly with estate management and audited for seasonal calendar accuracy. No hidden surcharges.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {pkg.seasonalPrices.map((season) => (
                    <div
                      key={season.id}
                      className="bg-white border border-[#E9E1D5] rounded-2xl p-6 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[#E9E1D5]/60 pb-3">
                        <h3 className="font-serif font-bold text-lg text-[#173D32]">
                          {season.seasonName}
                        </h3>
                        <div className="text-right">
                          <span className="text-lg font-serif font-bold text-[#173D32]">
                            ₹{season.pricePerPerson.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-[#6a7d61] block -mt-1 font-mono">
                            / guest
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-[#252925]/80 space-y-1.5 font-mono text-[11px]">
                        <p className="text-[#6a7d61]">
                          <strong className="text-[#173D32]">VALIDITY:</strong>{" "}
                          {new Date(season.startDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} – {new Date(season.endDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                        <p className="text-[#6a7d61]">
                          <strong className="text-[#173D32]">TIER:</strong> {season.hotelCategory}
                        </p>
                        <p className="text-[#6a7d61]">
                          <strong className="text-[#173D32]">BASIS:</strong> {season.sharingBasis} ({season.gstDetails})
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FIELD JOURNAL / DAY-WISE ITINERARY */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-[#173D32]" />
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
                    Field Journal: Day-by-Day Journey
                  </h2>
                </div>
                <p className="text-xs text-[#252925]/70 mb-8 font-light leading-relaxed">
                  Each day is paced intentionally to avoid excessive transit and maximize immersion in local ecology and culture.
                </p>

                <div className="space-y-5">
                  {pkg.itineraryDays.map((day) => (
                    <details
                      key={day.id}
                      open={day.dayNumber === 1}
                      className="group bg-white border border-[#E9E1D5] rounded-3xl overflow-hidden transition-all shadow-sm"
                    >
                      <summary className="p-6 sm:p-7 cursor-pointer list-none flex items-center justify-between hover:bg-[#FAF9F6] transition-colors select-none">
                        <div className="flex items-center gap-4">
                          <span className="w-9 h-9 rounded-full bg-[#173D32] text-[#FAF9F6] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                            {day.dayNumber < 10 ? `0${day.dayNumber}` : day.dayNumber}
                          </span>
                          <div>
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#6a7d61] block">
                              JOURNEY TIMELINE · DAY {day.dayNumber}
                            </span>
                            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#173D32] mt-0.5">
                              {day.title}
                            </h3>
                          </div>
                        </div>
                        <ChevronDown className="w-5 h-5 text-[#6a7d61] group-open:rotate-180 transition-transform" />
                      </summary>

                      <div className="px-6 sm:px-7 pb-7 pt-2 border-t border-[#E9E1D5]/70 text-xs sm:text-sm text-[#252925]/80 space-y-5 font-light">
                        <p className="leading-relaxed">{day.description}</p>

                        {day.activities && day.activities.length > 0 && (
                          <div className="pt-2">
                            <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6a7d61] font-bold mb-3">
                              NOTABLE EXPERIENCES & SIGHTS
                            </h4>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {day.activities.map((act, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#252925]/85">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#173D32] mt-1.5 shrink-0" />
                                  <span>{act}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="pt-4 border-t border-[#E9E1D5]/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                          {day.stay && (
                            <p className="text-[#6a7d61]">
                              <strong className="text-[#173D32]">ESTATE OVERNIGHT:</strong> {day.stay}
                            </p>
                          )}
                          {day.meals && (
                            <p className="text-[#6a7d61]">
                              <strong className="text-[#173D32]">INCLUDED REPAST:</strong> {day.meals}
                            </p>
                          )}
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              </div>

              {/* BOUTIQUE HOTELS & HERITAGE STAYS */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <HotelIcon className="w-5 h-5 text-[#173D32]" />
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
                    Boutique Stays & Heritage Estates
                  </h2>
                </div>
                <p className="text-xs text-[#252925]/70 mb-6 font-light leading-relaxed">
                  We partner exclusively with properties of distinct architectural character, attentive hospitality, and environmentally conscious practices.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {pkg.hotels.map((h) => (
                    <div
                      key={h.id}
                      className="bg-white border border-[#E9E1D5] rounded-2xl p-6 shadow-sm space-y-2.5 flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold block">
                          {h.category}
                        </span>
                        <h3 className="font-serif font-bold text-base text-[#173D32] mt-1">
                          {h.name}
                        </h3>
                        <p className="text-xs text-[#6a7d61] font-mono mt-1">
                          {h.location}
                        </p>
                      </div>

                      {h.roomType && (
                        <div className="pt-3 border-t border-[#E9E1D5]/60 text-[11px] text-[#252925]/75 font-mono">
                          <span className="text-[#6a7d61]">ROOM ALLOTMENT:</span> {h.roomType}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* INCLUSIONS & DISCLOSURES LEDGER */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 bg-white border border-[#E9E1D5] rounded-3xl p-8 sm:p-10 shadow-sm">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#173D32] mb-5 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-700" />
                    Verified Inclusions
                  </h3>
                  <ul className="space-y-3 text-xs text-[#252925]/80 font-light">
                    {pkg.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-[#173D32] mb-5 flex items-center gap-2">
                    <X className="w-4 h-4 text-stone-500" />
                    Disclosures & Exclusions
                  </h3>
                  <ul className="space-y-3 text-xs text-[#252925]/80 font-light">
                    {pkg.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <X className="w-3.5 h-3.5 text-stone-500 mt-0.5 shrink-0" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* PHOTO GALLERY */}
              {pkg.gallery && pkg.gallery.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#173D32] mb-5">
                    Photographic Archive
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    {pkg.gallery.map((imgUrl, i) => (
                      <div key={i} className="h-48 rounded-2xl overflow-hidden bg-[#E9E1D5] shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`${pkg.title} visual archive ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ROUTE & TOPOGRAPHY OVERVIEW */}
              <div className="bg-white border border-[#E9E1D5] rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <Navigation className="w-4 h-4 text-[#173D32]" />
                  <h3 className="font-serif text-xl font-bold text-[#173D32]">
                    Route Topography & Carriage
                  </h3>
                </div>
                <div className="rounded-2xl bg-[#f4f3ef] border border-[#E9E1D5] p-6 text-xs text-[#252925]/80 space-y-2">
                  <p className="font-serif text-base font-bold text-[#173D32]">
                    {pkg.destination}
                  </p>
                  <p className="leading-relaxed font-light">
                    Private air-conditioned sedan transfer from Cochin International Airport, ascending through the Neriamangalam forest bridge into Munnar, descending through cardamom plantations into Thekkady Periyar, and arriving at the private Vembanad houseboat jetty in Alleppey.
                  </p>
                  <div className="pt-2 text-[10px] font-mono text-[#6a7d61]">
                    CARRIAGE SPECIFICATION: DEDICATED LOCAL CHAUFFEUR-CONCIERGE · REFUELING & TOLL PASSES INCLUDED
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Sticky Bespoke Reservations Desk */}
            <div id="enquire-form" className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <PublicEnquiryForm
                  defaultDestination={pkg.destination}
                  defaultPackageTitle={pkg.title}
                />

                <div className="bg-white border border-[#E9E1D5] rounded-2xl p-6 text-xs text-[#252925]/75 space-y-3 font-light">
                  <div className="flex items-center gap-2 text-[#173D32] font-semibold font-mono text-[11px]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>DPDP ACT 2023 PRIVACY SAFEGUARD</span>
                  </div>
                  <p className="leading-relaxed">
                    Your contact information is stored exclusively within our private CRM and never syndicated to marketing brokers or airline resellers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FIXED PROMINENT MOBILE ENQUIRY CTA BAR */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF9F6] border-t border-[#E9E1D5] p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] text-[#252925]/60 block uppercase font-mono tracking-wider">Starting Tariff</span>
            <span className="text-lg font-serif font-bold text-[#173D32]">
              ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "Enquire"}
            </span>
            <span className="text-[9px] text-[#6a7d61] block -mt-1 font-mono">per person · twin sharing</span>
          </div>

          <a
            href="#enquire-form"
            className="bg-[#173D32] text-[#FAF9F6] px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase shadow"
          >
            Enquire Now
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
