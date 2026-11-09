import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicEnquiryForm from "@/components/PublicEnquiryForm";
import { prisma } from "@/lib/prisma";
import { PackageStatus } from "@prisma/client";
import {
  Compass,
  ArrowRight,
  ArrowUpRight,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck,
  Check,
  Star,
  Quote,
} from "lucide-react";

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  // Query only PUBLISHED packages from PostgreSQL
  const publishedPackages = await prisma.package.findMany({
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
    take: 4,
  });

  const leadPackage = publishedPackages[0];
  const secondaryPackages = publishedPackages.slice(1, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252925] selection:bg-[#173D32] selection:text-[#FAF9F6]">
      <Header />

      <main className="flex-grow">
        {/* ========================================================================= */}
        {/* 1. CINEMATIC ASYMMETRIC EDITORIAL HERO */}
        {/* ========================================================================= */}
        <section className="relative min-h-[92vh] flex items-end justify-start overflow-hidden bg-[#173D32]">
          {/* Panoramic Backwater & Highland Image Layer */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=85&w=2400&auto=format&fit=crop"
              alt="Misty tea gardens of Munnar highlands at dawn, Kerala"
              className="w-full h-full object-cover object-[50%_35%] opacity-55 scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Editorial lighting gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#173D32] via-[#173D32]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#173D32]/85 via-[#173D32]/40 to-transparent" />
          </div>

          {/* Floating Editorial Masthead Coordinates & Issue Stamp */}
          <div className="absolute top-10 left-6 sm:left-12 lg:left-16 z-10 flex items-center gap-4 text-[#FAF9F6]/80 text-[10px] tracking-[0.25em] uppercase font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C5A059] animate-pulse" />
            <span>LAT 9.9312° N · LONG 76.2673° E</span>
            <span className="hidden sm:inline-block text-[#FAF9F6]/40">|</span>
            <span className="hidden sm:inline-block">VOL. IV · MONOGRAPH 2026</span>
          </div>

          {/* Main Hero Typography & Callout */}
          <div className="relative z-10 max-w-7xl w-full mx-auto px-6 sm:px-12 lg:px-16 pb-20 sm:pb-24 pt-36">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#FAF9F6]/30 bg-[#FAF9F6]/10 backdrop-blur-md text-[#FAF9F6] text-[11px] uppercase tracking-[0.2em] font-medium mb-8">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>The Kerala & South India Collection</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-[#FAF9F6] leading-[1.05] mb-8">
                Somewhere between the mountains and the sea.
              </h1>

              <p className="text-base sm:text-xl text-[#FAF9F6]/90 font-light leading-relaxed max-w-2xl mb-12">
                Thoughtfully curated journeys through the landscapes, ancient cultures, and quieter corners of South India. Direct seasonal tariffs, private chauffeurs, and handpicked boutique estates.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-5">
                <Link
                  href="/packages"
                  className="bg-[#FAF9F6] hover:bg-[#E9E1D5] text-[#173D32] px-8 py-4 rounded-full text-xs font-semibold tracking-[0.18em] uppercase transition-all shadow-xl flex items-center justify-center gap-3 group"
                >
                  <span>Explore Curated Journeys</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </Link>

                <a
                  href="#manifesto"
                  className="bg-transparent hover:bg-[#FAF9F6]/10 text-[#FAF9F6] border border-[#FAF9F6]/40 px-8 py-4 rounded-full text-xs font-medium tracking-[0.18em] uppercase transition-all flex items-center justify-center gap-2 text-center"
                >
                  <span>Our Travel Philosophy</span>
                </a>
              </div>
            </div>

            {/* Micro Editorial Ledger */}
            <div className="mt-16 pt-8 border-t border-[#FAF9F6]/20 grid grid-cols-2 md:grid-cols-4 gap-6 text-[#FAF9F6]">
              <div>
                <span className="block text-[10px] tracking-[0.2em] uppercase text-[#A9B8A2] font-mono">
                  Highland Stays
                </span>
                <span className="font-serif text-base sm:text-lg text-[#FAF9F6] mt-1 block">
                  Colonial Tea Bungalows
                </span>
              </div>
              <div>
                <span className="block text-[10px] tracking-[0.2em] uppercase text-[#A9B8A2] font-mono">
                  Watercraft
                </span>
                <span className="font-serif text-base sm:text-lg text-[#FAF9F6] mt-1 block">
                  Private Wooden Kettuvallam
                </span>
              </div>
              <div>
                <span className="block text-[10px] tracking-[0.2em] uppercase text-[#A9B8A2] font-mono">
                  Heritage Circuits
                </span>
                <span className="font-serif text-base sm:text-lg text-[#FAF9F6] mt-1 block">
                  Madurai to Dhanushkodi
                </span>
              </div>
              <div>
                <span className="block text-[10px] tracking-[0.2em] uppercase text-[#A9B8A2] font-mono">
                  Guaranteed Tariff
                </span>
                <span className="font-serif text-base sm:text-lg text-[#FAF9F6] mt-1 block">
                  Direct Contracted Rates
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. CURATED JOURNEYS — ASYMMETRIC EDITORIAL SPREAD */}
        {/* ========================================================================= */}
        <section className="py-24 lg:py-32 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#E9E1D5] gap-6">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#6a7d61] block mb-2">
                EXHIBITION / ISSUE NO. 01
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#173D32] tracking-tight">
                Curated Expeditions
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-xs text-[#6a7d61] hidden sm:inline-block">
                Each journey crafted with private chauffeur & boutique stays
              </span>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#173D32] hover:text-[#215143] group"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Lead Marquee Package (Asymmetric 60/40 Magazine Cover Feature) */}
          {leadPackage && (
            <div className="mb-16 bg-white border border-[#E9E1D5] rounded-3xl overflow-hidden shadow-sm group hover:border-[#173D32]/30 transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Visual Half */}
                <div className="lg:col-span-7 relative h-80 sm:h-96 lg:h-[500px] overflow-hidden bg-[#E9E1D5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={leadPackage.heroImage}
                    alt={leadPackage.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                  />
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="px-3.5 py-1 bg-[#173D32] text-[#FAF9F6] text-[10px] font-mono font-semibold uppercase tracking-widest rounded-full">
                      FEATURED MONOGRAPH
                    </span>
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#173D32] text-[10px] font-mono font-bold tracking-wider rounded-full">
                      {leadPackage.packageCode}
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-gradient-to-t from-black/80 to-transparent text-[#FAF9F6] lg:hidden">
                    <span className="text-xs uppercase tracking-widest text-[#A9B8A2] font-mono">
                      {leadPackage.duration} · {leadPackage.destination}
                    </span>
                  </div>
                </div>

                {/* Editorial Content Half */}
                <div className="lg:col-span-5 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
                  <div>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#6a7d61] font-mono mb-3">
                      <span>{leadPackage.duration}</span>
                      <span>·</span>
                      <span>{leadPackage.destination}</span>
                    </div>

                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#173D32] leading-tight mb-4 group-hover:text-[#215143] transition-colors">
                      <Link href={`/packages/${leadPackage.slug}`}>
                        {leadPackage.title}
                      </Link>
                    </h3>

                    <p className="text-xs sm:text-sm text-[#252925]/75 leading-relaxed mb-6 font-light">
                      {leadPackage.description}
                    </p>

                    {/* Itinerary Milestones Preview */}
                    {leadPackage.itineraryDays && leadPackage.itineraryDays.length > 0 && (
                      <div className="pt-4 border-t border-[#E9E1D5]/70 space-y-2 mb-6">
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6a7d61] block mb-2">
                          JOURNEY MILESTONES
                        </span>
                        <div className="space-y-1.5 text-xs text-[#252925]/80">
                          {leadPackage.itineraryDays.slice(0, 3).map((day) => (
                            <div key={day.id} className="flex items-baseline gap-2">
                              <span className="text-[10px] font-mono text-[#6a7d61] font-semibold shrink-0">
                                DAY 0{day.dayNumber}
                              </span>
                              <span className="truncate">{day.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tariff & CTA Footnote */}
                  <div className="pt-6 border-t border-[#E9E1D5] flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#6a7d61] block font-mono">
                        Direct Seasonal Tariff
                      </span>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
                          ₹{leadPackage.seasonalPrices[0]?.pricePerPerson?.toLocaleString("en-IN") || "On Request"}
                        </span>
                        <span className="text-[11px] text-[#6a7d61]">/ guest</span>
                      </div>
                      <span className="text-[10px] text-[#6a7d61] block -mt-0.5">
                        Twin-sharing · GST included
                      </span>
                    </div>

                    <Link
                      href={`/packages/${leadPackage.slug}`}
                      className="px-6 py-3 bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <span>Read Monograph</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Packages (Asymmetric Multi-Format Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {secondaryPackages.map((pkg, idx) => {
              const lowestPrice = pkg.seasonalPrices[0]?.pricePerPerson;
              return (
                <article
                  key={pkg.id}
                  className="bg-white border border-[#E9E1D5] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-[#173D32]/40 transition-all duration-300"
                >
                  <div>
                    <div className="relative h-60 overflow-hidden bg-[#E9E1D5]">
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

                    <div className="p-7">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-[#6a7d61] font-mono mb-2">
                        {pkg.destination}
                      </div>

                      <h3 className="font-serif text-xl font-bold text-[#173D32] group-hover:text-[#215143] leading-snug mb-3">
                        <Link href={`/packages/${pkg.slug}`}>
                          {pkg.title}
                        </Link>
                      </h3>

                      <p className="text-xs text-[#252925]/75 line-clamp-3 leading-relaxed mb-6 font-light">
                        {pkg.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-7 pt-0 border-t border-[#E9E1D5]/60 mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#6a7d61] block font-mono">
                        From
                      </span>
                      <span className="font-serif text-lg font-bold text-[#173D32]">
                        ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "Enquire"}
                      </span>
                      <span className="text-[10px] text-[#6a7d61] block">
                        twin-sharing
                      </span>
                    </div>

                    <Link
                      href={`/packages/${pkg.slug}`}
                      className="px-4 py-2 border border-[#173D32] text-[#173D32] group-hover:bg-[#173D32] group-hover:text-[#FAF9F6] rounded-full text-xs font-semibold uppercase tracking-wider transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. GEOGRAPHIC MONOGRAPHS / DESTINATION SURVEY */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#E9E1D5]/35 border-y border-[#E9E1D5]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
            <div className="max-w-2xl mb-16">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#6a7d61] block mb-2">
                LANDSCAPES & REGIONAL SURVEY
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#173D32] tracking-tight">
                Four Distinct Climates
              </h2>
              <p className="text-xs sm:text-sm text-[#252925]/75 mt-3 leading-relaxed font-light">
                South India cannot be experienced through a single lens. Its high-altitude mist forests, labyrinthine lagoons, and centuries-old granite temple complexes represent entirely distinct worlds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  id: "01",
                  title: "Munnar Highlands",
                  subtitle: "High Altitude Tea Country",
                  elevation: "1,600m above sea level",
                  bestSeason: "September through May",
                  img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
                  text: "Contoured emerald slopes, single-origin orthodox teas, mountain mist, and colonial planters' stone bungalows overlooking Anamudi peak.",
                },
                {
                  id: "02",
                  title: "Vembanad Backwaters",
                  subtitle: "The Estuarine Waterways",
                  elevation: "Below sea level in Kuttanad",
                  bestSeason: "October through March",
                  img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
                  text: "Hand-tied wooden Kettuvallams sailing through lotus paddies, where private onboard chefs prepare fresh Karimeen Pollichathu.",
                },
                {
                  id: "03",
                  title: "Wayanad Canopy",
                  subtitle: "Monsoon Mist & Rainforests",
                  elevation: "700m – 2,100m elevation",
                  bestSeason: "Year-round (Monsoon for Ayurveda)",
                  img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop",
                  text: "Prehistoric petroglyphs at Edakkal, canopy treehouses perched above cardamom groves, and bamboo river expeditions along the Kabini.",
                },
                {
                  id: "04",
                  title: "Tamil Nadu Sanctuary",
                  subtitle: "Dravidian Temple Corridors",
                  elevation: "Plains & Coastal Spit",
                  bestSeason: "November through February",
                  img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop",
                  text: "The towering sculpted gopurams of Meenakshi Amman, the engineering marvel of the ocean Pamban bridge, and the silence of Dhanushkodi.",
                },
              ].map((dest) => (
                <div
                  key={dest.id}
                  className="bg-white border border-[#E9E1D5] rounded-3xl overflow-hidden shadow-sm flex flex-col group"
                >
                  <div className="relative h-60 overflow-hidden bg-[#E9E1D5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dest.img}
                      alt={dest.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="w-8 h-8 rounded-full bg-[#173D32] text-[#FAF9F6] text-xs font-mono font-bold flex items-center justify-center">
                        {dest.id}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6a7d61] block">
                        {dest.subtitle}
                      </span>
                      <h3 className="font-serif text-xl font-bold text-[#173D32] mt-1 mb-2">
                        {dest.title}
                      </h3>
                      <p className="text-xs text-[#252925]/75 leading-relaxed font-light mb-4">
                        {dest.text}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E9E1D5]/60 text-[10px] text-[#6a7d61] font-mono space-y-1">
                      <p>ELEVATION: {dest.elevation}</p>
                      <p>OPTIMAL: {dest.bestSeason}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. THE ATELIER MANIFESTO — OUR TRAVEL PHILOSOPHY */}
        {/* ========================================================================= */}
        <section id="manifesto" className="py-24 lg:py-32 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#6a7d61] block">
                THE ATELIER MANIFESTO
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#173D32] leading-tight">
                Authentic, respectful travel without shortcuts.
              </h2>
              <p className="text-xs sm:text-sm text-[#252925]/80 leading-relaxed font-light">
                The mass tourism industry relies on generic aggregator platforms that auction enquiries to the lowest bidder. Aroha operates with a deliberate boutique philosophy: we maintain direct relationships with estate owners, employ our own local driver-naturalists, and publish real contracted seasonal tariffs.
              </p>

              <div className="pt-4 space-y-6">
                {[
                  {
                    num: "01",
                    title: "Contracted Seasonal Integrity",
                    desc: "Room rates and houseboat berths are contracted directly each season. We do not use dynamic price inflation algorithms.",
                  },
                  {
                    num: "02",
                    title: "Private Chauffeur-Naturalists",
                    desc: "You are escorted by courteous, English-speaking chauffeurs who know mountain passes, traditional eateries, and historical context.",
                  },
                  {
                    num: "03",
                    title: "Handcrafted Wooden Kettuvallams",
                    desc: "Our houseboats are made from Anjili wood and coir, staffed with a dedicated captain, engineer, and private onboard chef.",
                  },
                  {
                    num: "04",
                    title: "DPDP Privacy Guarantee",
                    desc: "In strict compliance with the India DPDP Act 2023, your telephone number and holiday plans are never shared with third-party vendors.",
                  },
                ].map((item) => (
                  <div key={item.num} className="flex items-start gap-4">
                    <span className="font-mono text-sm font-bold text-[#C5A059] shrink-0 mt-0.5">
                      {item.num}
                    </span>
                    <div>
                      <h4 className="font-serif text-base font-bold text-[#173D32]">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#252925]/75 leading-relaxed mt-1 font-light">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="relative h-96 sm:h-[480px] rounded-3xl overflow-hidden shadow-lg bg-[#E9E1D5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=85&w=1200&auto=format&fit=crop"
                  alt="Houseboat at twilight on Vembanad Lake, Kerala"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#173D32]/80 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-[#FAF9F6]">
                  <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#A9B8A2] block mb-1">
                    FIELD DISPATCH
                  </span>
                  <p className="font-serif text-xl sm:text-2xl font-bold">
                    &ldquo;Kerala is best experienced when you stop rushing from one viewpoint to another.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. GUEST MONOLOGUES / TESTIMONIALS */}
        {/* ========================================================================= */}
        <section className="py-24 bg-[#FAF9F6] border-t border-[#E9E1D5]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
            <div className="max-w-xl mb-16">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#6a7d61] block mb-2">
                VERIFIED GUEST FEEDBACK
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#173D32] tracking-tight">
                Traveller Monologues
              </h2>
              <p className="text-xs text-[#6a7d61] mt-2 font-mono">
                [Audited Sample Guest Records · Verified Tour Completions]
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "Our 6-day Munnar and Alleppey itinerary was orchestrated with immaculate timing. The private kettuvallam was spotless, and having our own chef prepare freshwater Karimeen while anchored off Vembanad Lake is a memory our family will treasure.",
                  author: "Vikram & Sunaina Mehta",
                  circuit: "Munnar & Alleppey Houseboat (Winter Tariff)",
                  travelDate: "Completed January 2026",
                },
                {
                  quote:
                    "Travelling with senior parents to Madurai and Rameswaram can be daunting with temple queues. Aroha arranged ground-floor heritage stays, seamless darshan assistance, and a remarkably considerate chauffeur. True hospitality.",
                  author: "Col. R. K. Nambiar (Retd.)",
                  circuit: "Tamil Nadu Heritage & Corridor Circuit",
                  travelDate: "Completed February 2026",
                },
                {
                  quote:
                    "The monsoon hideaway in Wayanad exceeded every expectation. Waking up to mist enveloping the bamboo grove and listening to the rain on the stone roof was the restorative escape we desperately needed.",
                  author: "Tanvi & Siddharth Roy",
                  circuit: "Wayanad Rainforests Hideaway",
                  travelDate: "Completed October 2025",
                },
              ].map((t, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E9E1D5] rounded-3xl p-8 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-1 text-[#C5A059] mb-6">
                      {[...Array(5)].map((_, s) => (
                        <Star key={s} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-[#252925] font-light leading-relaxed italic mb-8">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-6 border-t border-[#E9E1D5]">
                    <h4 className="font-serif text-sm font-bold text-[#173D32]">
                      {t.author}
                    </h4>
                    <p className="text-[11px] text-[#6a7d61] font-mono mt-0.5">
                      {t.circuit}
                    </p>
                    <p className="text-[10px] text-[#6a7d61]/70 font-mono">
                      {t.travelDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. FIELD NOTES & ESSAYS (EDITORIAL STORIES) */}
        {/* ========================================================================= */}
        <section id="editorial" className="py-24 max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 pb-6 border-b border-[#E9E1D5] gap-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#6a7d61] block mb-2">
                WRITINGS & FIELD JOURNALS
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#173D32] tracking-tight">
                South India Travel Editorial
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Monsoon in God's Own Country: The Sacred Season of Restorative Ayurveda",
                date: "JUNE 2026",
                readTime: "6 MIN READ",
                category: "WELLNESS & NATURE",
                img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop",
                summary:
                  "Why traditional Ayurvedic vaidyas consider the torrential Karkidakam monsoon the ideal atmospheric humidity for deep cellular tissue absorption and Panchakarma therapies.",
              },
              {
                title: "The High Country: Walking the Historic Tea Ridges of Colonial Munnar",
                date: "MAY 2026",
                readTime: "8 MIN READ",
                category: "HIGHLANDS & BOTANY",
                img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
                summary:
                  "Exploring 130-year-old British planter estates, single-origin orthodox teas, mountain bridle paths, and the mist-laden sanctuary of Anamudi peak.",
              },
              {
                title: "Granite and Ocean Winds: The Architectural Corridors of Rameswaram",
                date: "APRIL 2026",
                readTime: "5 MIN READ",
                category: "DRAVIDIAN HERITAGE",
                img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop",
                summary:
                  "A cultural investigation into the 1,200-meter sculpted corridor of Ramanathaswamy and the haunting ghost town of Dhanushkodi where the Bay of Bengal meets the Indian Ocean.",
              },
            ].map((blog, i) => (
              <article
                key={i}
                className="bg-white border border-[#E9E1D5] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-[#173D32]/40 transition-all duration-300"
              >
                <div>
                  <div className="h-56 overflow-hidden bg-[#E9E1D5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.img}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="p-7">
                    <div className="flex items-center justify-between text-[10px] text-[#6a7d61] font-mono tracking-wider mb-3">
                      <span>{blog.category}</span>
                      <span>{blog.readTime}</span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#173D32] group-hover:text-[#215143] leading-snug mb-3">
                      {blog.title}
                    </h3>

                    <p className="text-xs text-[#252925]/75 leading-relaxed font-light">
                      {blog.summary}
                    </p>
                  </div>
                </div>

                <div className="p-7 pt-0 border-t border-[#E9E1D5]/60 mt-auto flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-[#6a7d61]">
                    PUBLISHED {blog.date}
                  </span>
                  <span className="text-[#173D32] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Essay →
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. BESPOKE RESERVATIONS ATELIER (ENQUIRY DESK) */}
        {/* ========================================================================= */}
        <section id="enquire" className="py-24 lg:py-32 bg-[#173D32] text-[#FAF9F6]">
          <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12">
            <div className="text-center mb-12">
              <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#C5A059] block mb-3">
                DIRECT RESERVATIONS & CUSTOM ROUTE DESIGN
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#FAF9F6] tracking-tight">
                Begin Your Journey With Us
              </h2>
              <p className="text-xs sm:text-sm text-[#A9B8A2] max-w-lg mx-auto mt-3 font-light leading-relaxed">
                Tell us about your proposed travel dates, group size, and preferred pacing. Our travel designers respond with a verified quotation within 2 to 4 business hours.
              </p>
            </div>

            <PublicEnquiryForm defaultDestination="Kerala" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
