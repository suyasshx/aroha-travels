import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/auth";
import {
  MapPin,
  Clock,
  Calendar,
  Check,
  X,
  Hotel as HotelIcon,
  Eye,
  ArrowLeft,
  Navigation,
  ChevronDown,
  Info,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PackagePreviewPage({ params }: PageProps) {
  // Enforce staff admin privileges
  await requireStaffAdmin();
  const { id } = await params;

  const pkg = await prisma.package.findUnique({
    where: { id },
    include: {
      seasonalPrices: {
        orderBy: { startDate: "asc" },
      },
      itineraryDays: {
        orderBy: { dayNumber: "asc" },
      },
      hotels: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!pkg) {
    notFound();
  }

  const lowestPrice = pkg.seasonalPrices[0]?.pricePerPerson;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      {/* PREVIEW MODE TOP BANNER */}
      <div className="sticky top-0 z-50 bg-[#C5A059] text-[#173D32] px-4 py-2.5 text-xs font-semibold shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>
            STAFF PREVIEW MODE — Package Status: <strong className="uppercase">{pkg.status}</strong> (Not visible to public unless Published)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/packages/${pkg.id}/edit`}
            className="bg-[#173D32] text-[#FAF9F6] px-3.5 py-1 rounded-full text-xs hover:bg-[#215143] transition-colors"
          >
            ← Return to Editor
          </Link>
          <Link
            href="/admin/packages"
            className="underline hover:text-black text-xs"
          >
            All Packages
          </Link>
        </div>
      </div>

      <Header />

      <main className="flex-grow pb-24">
        {/* DESTINATION HERO */}
        <section className="relative h-[60vh] min-h-[420px] bg-[#173D32] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pkg.heroImage}
            alt={pkg.title}
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#173D32] via-[#173D32]/50 to-black/30" />

          <div className="absolute bottom-0 inset-x-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 text-[#FAF9F6]">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-[#FAF9F6]/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider">
                  {pkg.duration}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#173D32] border border-[#A9B8A2]/30 text-xs font-mono font-bold">
                  {pkg.packageCode}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#A9B8A2] font-medium">
                  <MapPin className="w-3.5 h-3.5" />
                  {pkg.destination}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight mb-3">
                {pkg.title}
              </h1>

              <p className="text-sm text-[#FAF9F6]/85 max-w-3xl leading-relaxed">
                {pkg.description}
              </p>
            </div>
          </div>
        </section>

        {/* DETAILS BODY */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              {/* Tariff Banner */}
              <div className="bg-white border border-[#E9E1D5] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#6a7d61] font-semibold block mb-1">
                    Verified Package Tariff
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-serif font-bold text-[#173D32]">
                      ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "---"}
                    </span>
                    <span className="text-xs text-[#252925]/75 font-medium">per person</span>
                  </div>
                  <p className="text-xs text-[#173D32] font-semibold mt-1">
                    Starting from ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "---"} per person, based on twin sharing. GST as applicable.
                  </p>
                </div>
              </div>

              {/* Seasonal Pricing */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#173D32] mb-4">
                  Seasonal Pricing & Hotel Categories
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.seasonalPrices.map((season) => (
                    <div
                      key={season.id}
                      className="bg-white border border-[#E9E1D5] rounded-xl p-5 shadow-sm space-y-2"
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
                          <strong>Dates:</strong> {new Date(season.startDate).toLocaleDateString("en-IN")} to {new Date(season.endDate).toLocaleDateString("en-IN")}
                        </p>
                        <p><strong>Category:</strong> {season.hotelCategory}</p>
                        <p><strong>Basis:</strong> {season.sharingBasis} ({season.gstDetails})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day-Wise Itinerary */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#173D32] mb-6">
                  Day-Wise Travel Itinerary
                </h2>
                <div className="space-y-4">
                  {pkg.itineraryDays.map((day) => (
                    <div
                      key={day.id}
                      className="bg-white border border-[#E9E1D5] rounded-2xl p-6 shadow-sm space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-[#173D32] text-[#FAF9F6] text-xs font-bold flex items-center justify-center shrink-0">
                          D{day.dayNumber}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-[#173D32]">
                          {day.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-[#252925]/80 leading-relaxed">
                        {day.description}
                      </p>
                      {day.activities && day.activities.length > 0 && (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2">
                          {day.activities.map((act, i) => (
                            <li key={i} className="text-xs text-[#252925]/75 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#173D32] mt-1 shrink-0" />
                              <span>{act}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hotels */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#173D32] mb-4">
                  Hotels & Accommodations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {pkg.hotels.map((h) => (
                    <div key={h.id} className="bg-white border border-[#E9E1D5] rounded-xl p-4 shadow-sm">
                      <span className="text-[10px] font-bold uppercase text-[#C5A059] block">{h.category}</span>
                      <h4 className="font-serif font-bold text-sm text-[#173D32] mt-1">{h.name}</h4>
                      <p className="text-xs text-[#6a7d61]">📍 {h.location}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inclusions / Exclusions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white border border-[#E9E1D5] rounded-2xl p-6 shadow-sm">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#173D32] mb-3">Inclusions</h4>
                  <ul className="space-y-1.5 text-xs text-[#252925]/80">
                    {pkg.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#173D32] mb-3">Exclusions</h4>
                  <ul className="space-y-1.5 text-xs text-[#252925]/80">
                    {pkg.exclusions.map((exc, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Preview Info Card */}
            <div className="lg:col-span-4">
              <div className="bg-white border border-[#E9E1D5] rounded-2xl p-6 shadow-sm sticky top-20 space-y-5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6a7d61] block">
                  Staff Publishing Inspector
                </span>
                <div>
                  <p className="text-xs text-[#252925]/60">Status</p>
                  <p className="text-sm font-bold text-[#173D32] uppercase">{pkg.status}</p>
                </div>
                <div>
                  <p className="text-xs text-[#252925]/60">Package Code</p>
                  <p className="text-sm font-mono font-bold text-[#173D32]">{pkg.packageCode}</p>
                </div>
                <div>
                  <p className="text-xs text-[#252925]/60">Public URL Slug</p>
                  <p className="text-xs font-mono text-[#6a7d61]">/packages/{pkg.slug}</p>
                </div>
                <div className="pt-3 border-t border-[#E9E1D5]/60 space-y-2">
                  <Link
                    href={`/admin/packages/${pkg.id}/edit`}
                    className="block w-full bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] text-center py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                  >
                    Edit Package & Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

