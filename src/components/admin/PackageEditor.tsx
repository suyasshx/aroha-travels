"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Calendar,
  Clock,
  Hotel as HotelIcon,
  Check,
  X,
  Plus,
  Trash2,
  Save,
  Eye,
  History,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { validateSeasonalPeriods } from "@/lib/validation";

interface SeasonalPriceInput {
  id?: string;
  seasonName: string;
  startDate: string;
  endDate: string;
  pricePerPerson: number;
  hotelCategory: string;
  gstDetails: string;
  sharingBasis: string;
}

interface ItineraryDayInput {
  id?: string;
  dayNumber: number;
  title: string;
  description: string;
  activities: string[];
  stay?: string;
  meals?: string;
}

interface HotelInput {
  id?: string;
  name: string;
  category: string;
  location: string;
  roomType?: string;
}

interface PackageVersion {
  id: string;
  versionNumber: number;
  snapshot: any;
  changeSummary: string;
  updatedBy: string;
  createdAt: string;
}

interface PackageEditorProps {
  initialData?: {
    id: string;
    packageCode: string;
    slug: string;
    title: string;
    destination: string;
    duration: string;
    description: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    heroImage: string;
    featured: boolean;
    bestTimeToVisit?: string | null;
    inclusions: string[];
    exclusions: string[];
    gallery: string[];
    seasonalPrices: SeasonalPriceInput[];
    itineraryDays: ItineraryDayInput[];
    hotels: HotelInput[];
    versions?: PackageVersion[];
  };
}

export default function PackageEditor({ initialData }: PackageEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData?.id);

  // Form States
  const [packageCode, setPackageCode] = useState(initialData?.packageCode || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [destination, setDestination] = useState(initialData?.destination || "Kerala");
  const [duration, setDuration] = useState(initialData?.duration || "6 Days / 5 Nights");
  const [description, setDescription] = useState(initialData?.description || "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">(
    initialData?.status || "DRAFT"
  );
  const [heroImage, setHeroImage] = useState(
    initialData?.heroImage ||
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1600&auto=format&fit=crop"
  );
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [bestTimeToVisit, setBestTimeToVisit] = useState(initialData?.bestTimeToVisit || "");

  // Seasonal Prices
  const [seasonalPrices, setSeasonalPrices] = useState<SeasonalPriceInput[]>(
    initialData?.seasonalPrices && initialData.seasonalPrices.length > 0
      ? initialData.seasonalPrices.map((sp) => ({
          ...sp,
          startDate: new Date(sp.startDate).toISOString().split("T")[0],
          endDate: new Date(sp.endDate).toISOString().split("T")[0],
        }))
      : [
          {
            seasonName: "Peak Season",
            startDate: "2026-10-01",
            endDate: "2027-03-31",
            pricePerPerson: 32500,
            hotelCategory: "4-Star Deluxe",
            gstDetails: "5% GST applicable",
            sharingBasis: "Twin Sharing Basis",
          },
        ]
  );

  // Itinerary Days
  const [itineraryDays, setItineraryDays] = useState<ItineraryDayInput[]>(
    initialData?.itineraryDays && initialData.itineraryDays.length > 0
      ? initialData.itineraryDays
      : [
          {
            dayNumber: 1,
            title: "Arrival & Scenic Transfer",
            description: "Arrive at airport. Transfer to resort and evening plantation walk.",
            activities: ["Airport pickup", "Scenic valley drive", "Resort check-in"],
            stay: "Premium Valley Resort",
            meals: "Dinner",
          },
        ]
  );

  // Hotels
  const [hotels, setHotels] = useState<HotelInput[]>(
    initialData?.hotels && initialData.hotels.length > 0
      ? initialData.hotels
      : [
          {
            name: "Fragrant Nature Munnar",
            category: "4-Star Deluxe",
            location: "Munnar",
            roomType: "Tropic Green Room",
          },
        ]
  );

  // Inclusions & Exclusions
  const [inclusions, setInclusions] = useState<string[]>(
    initialData?.inclusions && initialData.inclusions.length > 0
      ? initialData.inclusions
      : [
          "Accommodation on twin sharing basis",
          "Daily buffet breakfast & scheduled dinners",
          "All transfers and sightseeing by private AC vehicle",
        ]
  );
  const [exclusions, setExclusions] = useState<string[]>(
    initialData?.exclusions && initialData.exclusions.length > 0
      ? initialData.exclusions
      : ["Airfare or train fare", "Personal tips and laundry", "GST at 5%"]
  );

  // Gallery
  const [gallery, setGallery] = useState<string[]>(
    initialData?.gallery && initialData.gallery.length > 0
      ? initialData.gallery
      : [
          "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1200&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop",
        ]
  );

  // Version History Inspection & Change Summary
  const [changeSummary, setChangeSummary] = useState(
    isEditing ? "Updated seasonal rates and hotel specifications" : "Initial package creation"
  );
  const [inspectVersion, setInspectVersion] = useState<PackageVersion | null>(null);

  // Submission States
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Quick slug generator
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  // Add/Remove helpers
  const addSeason = () => {
    setSeasonalPrices([
      ...seasonalPrices,
      {
        seasonName: `Season ${seasonalPrices.length + 1}`,
        startDate: "2026-06-01",
        endDate: "2026-09-30",
        pricePerPerson: 25000,
        hotelCategory: "4-Star Deluxe",
        gstDetails: "5% GST applicable",
        sharingBasis: "Twin Sharing Basis",
      },
    ]);
  };

  const removeSeason = (index: number) => {
    setSeasonalPrices(seasonalPrices.filter((_, i) => i !== index));
  };

  const addItineraryDay = () => {
    const nextDayNum = itineraryDays.length + 1;
    setItineraryDays([
      ...itineraryDays,
      {
        dayNumber: nextDayNum,
        title: `Day ${nextDayNum} Experience`,
        description: "Full day sightseeing and immersive cultural exploration.",
        activities: ["Morning guided nature walk", "Cultural demonstration"],
        stay: "Partner Resort",
        meals: "Breakfast & Dinner",
      },
    ]);
  };

  const removeItineraryDay = (index: number) => {
    const updated = itineraryDays
      .filter((_, i) => i !== index)
      .map((d, i) => ({ ...d, dayNumber: i + 1 }));
    setItineraryDays(updated);
  };

  const addHotel = () => {
    setHotels([
      ...hotels,
      {
        name: "New Partner Hotel",
        category: "4-Star",
        location: destination || "Kerala",
        roomType: "Deluxe AC Room",
      },
    ]);
  };

  const removeHotel = (index: number) => {
    setHotels(hotels.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSave = async (publishImmediate = false) => {
    setSaving(true);
    setErrorMessage(null);
    setSuccessToast(null);

    // 1. Seasonal overlap validation
    const seasonalValidation = validateSeasonalPeriods(seasonalPrices);
    if (!seasonalValidation.valid) {
      setErrorMessage(seasonalValidation.error || "Seasonal pricing period error.");
      setSaving(false);
      return;
    }

    const payload = {
      packageCode,
      slug,
      title,
      destination,
      duration,
      description,
      status: publishImmediate ? "PUBLISHED" : status,
      heroImage,
      featured,
      bestTimeToVisit,
      inclusions,
      exclusions,
      gallery,
      seasonalPrices,
      itineraryDays,
      hotels,
      changeSummary,
    };

    try {
      const url = isEditing ? `/api/packages/${initialData!.id}` : "/api/packages";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to save package.");
      } else {
        setSuccessToast(
          isEditing
            ? `Package updated successfully! Version history snapshot saved.`
            : `New package ${data.package.packageCode} created successfully!`
        );
        router.refresh();
        if (!isEditing) {
          router.push(`/admin/packages/${data.package.id}/edit`);
        }
      }
    } catch {
      setErrorMessage("Network error occurred while saving package.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/packages"
            className="inline-flex items-center gap-1.5 text-xs text-[#6a7d61] hover:text-[#173D32] mb-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Packages</span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
            {isEditing ? `Edit: ${title || packageCode}` : "Create New Curated Package"}
          </h1>
          <p className="text-xs text-[#6a7d61]">
            All updates generate immutable version snapshots in PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isEditing && (
            <Link
              href={`/admin/packages/${initialData!.id}/preview`}
              className="bg-white border border-[#E9E1D5] hover:bg-[#FAF9F6] text-[#173D32] px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Public View</span>
            </Link>
          )}

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center gap-2 shadow-sm transition-all disabled:opacity-60 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Package</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error or Success Alerts */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold mb-0.5">Validation / Persistence Error</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* SECTION 1: BASIC INFORMATION */}
      <div className="bg-white border border-[#E9E1D5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="font-serif text-lg font-bold text-[#173D32] flex items-center gap-2">
          <Package className="w-4 h-4 text-[#173D32]" />
          <span>Package Overview & Identifiers</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#252925] mb-1.5">
              Package Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={packageCode}
              onChange={(e) => setPackageCode(e.target.value)}
              placeholder="e.g. PKG-KL-07"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs font-mono font-bold text-[#173D32] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#252925] mb-1.5">
              URL Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. munnar-thekkady-alleppey-houseboat"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs font-mono text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#252925] mb-1.5">
              Publication Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs font-bold text-[#173D32] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
            >
              <option value="DRAFT">DRAFT (Admin only)</option>
              <option value="PUBLISHED">PUBLISHED (Visible to Public)</option>
              <option value="ARCHIVED">ARCHIVED (Historical)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#252925] mb-1.5">
              Package Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Munnar, Thekkady and Alleppey Houseboat"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#252925] mb-1.5">
              Duration <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 6 Days / 5 Nights"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#252925] mb-1.5">
              Destination Circuit <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Munnar, Thekkady & Alleppey, Kerala"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#252925] mb-1.5">
              Best Time to Visit
            </label>
            <input
              type="text"
              value={bestTimeToVisit}
              onChange={(e) => setBestTimeToVisit(e.target.value)}
              placeholder="e.g. October to March for pleasant weather"
              className="w-full px-3.5 py-2 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#252925] mb-1.5">
            Hero Photography URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={heroImage}
            onChange={(e) => setHeroImage(e.target.value)}
            placeholder="https://..."
            className="w-full px-3.5 py-2 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#252925] mb-1.5">
            Package Editorial Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed luxury narrative of the journey..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30 leading-relaxed"
          />
        </div>

        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded border-[#E9E1D5] text-[#173D32] focus:ring-[#173D32]"
          />
          <label htmlFor="featured" className="text-xs font-semibold text-[#173D32] cursor-pointer">
            Mark as Featured Journey on Homepage
          </label>
        </div>
      </div>

      {/* SECTION 2: SEASONAL PRICING MANAGEMENT WITH OVERLAP VALIDATION */}
      <div className="bg-white border border-[#E9E1D5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#173D32] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#173D32]" />
              <span>Seasonal Pricing Management</span>
            </h2>
            <p className="text-xs text-[#6a7d61]">
              Strict relational data model. Validates start/end dates to prevent overlapping pricing periods.
            </p>
          </div>

          <button
            type="button"
            onClick={addSeason}
            className="bg-[#FAF9F6] border border-[#E9E1D5] hover:bg-[#E9E1D5] text-[#173D32] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Season Tier</span>
          </button>
        </div>

        <div className="space-y-4">
          {seasonalPrices.map((season, idx) => (
            <div
              key={idx}
              className="bg-[#FAF9F6] border border-[#E9E1D5] rounded-2xl p-5 space-y-4 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#173D32] bg-white px-2.5 py-0.5 rounded border border-[#E9E1D5]">
                  Tier {idx + 1}
                </span>
                {seasonalPrices.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSeason(idx)}
                    className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#252925] mb-1">
                    Season Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={season.seasonName}
                    onChange={(e) => {
                      const updated = [...seasonalPrices];
                      updated[idx].seasonName = e.target.value;
                      setSeasonalPrices(updated);
                    }}
                    placeholder="e.g. Peak Season"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E9E1D5] bg-white text-xs text-[#252925]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#252925] mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={season.startDate}
                    onChange={(e) => {
                      const updated = [...seasonalPrices];
                      updated[idx].startDate = e.target.value;
                      setSeasonalPrices(updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E9E1D5] bg-white text-xs text-[#252925]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#252925] mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={season.endDate}
                    onChange={(e) => {
                      const updated = [...seasonalPrices];
                      updated[idx].endDate = e.target.value;
                      setSeasonalPrices(updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E9E1D5] bg-white text-xs text-[#252925]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#252925] mb-1">
                    Price / Person (₹ INR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={season.pricePerPerson}
                    onChange={(e) => {
                      const updated = [...seasonalPrices];
                      updated[idx].pricePerPerson = Number(e.target.value);
                      setSeasonalPrices(updated);
                    }}
                    placeholder="32500"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E9E1D5] bg-white text-xs font-mono font-bold text-[#173D32]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#252925] mb-1">
                    Hotel Category
                  </label>
                  <input
                    type="text"
                    value={season.hotelCategory}
                    onChange={(e) => {
                      const updated = [...seasonalPrices];
                      updated[idx].hotelCategory = e.target.value;
                      setSeasonalPrices(updated);
                    }}
                    placeholder="4-Star Deluxe Resorts"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E9E1D5] bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#252925] mb-1">
                    Sharing Basis
                  </label>
                  <input
                    type="text"
                    value={season.sharingBasis}
                    onChange={(e) => {
                      const updated = [...seasonalPrices];
                      updated[idx].sharingBasis = e.target.value;
                      setSeasonalPrices(updated);
                    }}
                    placeholder="Twin Sharing Basis"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E9E1D5] bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#252925] mb-1">
                    GST Details
                  </label>
                  <input
                    type="text"
                    value={season.gstDetails}
                    onChange={(e) => {
                      const updated = [...seasonalPrices];
                      updated[idx].gstDetails = e.target.value;
                      setSeasonalPrices(updated);
                    }}
                    placeholder="5% GST applicable"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E9E1D5] bg-white text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: DAY-WISE ITINERARY MANAGEMENT */}
      <div className="bg-white border border-[#E9E1D5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#173D32] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#173D32]" />
              <span>Day-Wise Itinerary</span>
            </h2>
            <p className="text-xs text-[#6a7d61]">
              Add day titles, descriptions, activities, meals and overnight stays.
            </p>
          </div>

          <button
            type="button"
            onClick={addItineraryDay}
            className="bg-[#FAF9F6] border border-[#E9E1D5] hover:bg-[#E9E1D5] text-[#173D32] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Next Day</span>
          </button>
        </div>

        <div className="space-y-4">
          {itineraryDays.map((day, idx) => (
            <div
              key={idx}
              className="bg-[#FAF9F6] border border-[#E9E1D5] rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#173D32] bg-white px-2.5 py-0.5 rounded border border-[#E9E1D5]">
                  Day {day.dayNumber}
                </span>
                {itineraryDays.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItineraryDay(idx)}
                    className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Day</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#252925] mb-1">
                  Day Title
                </label>
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => {
                    const updated = [...itineraryDays];
                    updated[idx].title = e.target.value;
                    setItineraryDays(updated);
                  }}
                  placeholder="e.g. Munnar Tea Gardens & Eravikulam Sanctuary"
                  className="w-full px-3 py-1.5 rounded-lg border border-[#E9E1D5] bg-white text-xs font-medium text-[#252925]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#252925] mb-1">
                  Day Narrative
                </label>
                <textarea
                  rows={3}
                  value={day.description}
                  onChange={(e) => {
                    const updated = [...itineraryDays];
                    updated[idx].description = e.target.value;
                    setItineraryDays(updated);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#E9E1D5] bg-white text-xs text-[#252925] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#252925] mb-1">
                    Overnight Stay
                  </label>
                  <input
                    type="text"
                    value={day.stay || ""}
                    onChange={(e) => {
                      const updated = [...itineraryDays];
                      updated[idx].stay = e.target.value;
                      setItineraryDays(updated);
                    }}
                    placeholder="e.g. Fragrant Nature Resort, Munnar"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E9E1D5] bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#252925] mb-1">
                    Included Meals
                  </label>
                  <input
                    type="text"
                    value={day.meals || ""}
                    onChange={(e) => {
                      const updated = [...itineraryDays];
                      updated[idx].meals = e.target.value;
                      setItineraryDays(updated);
                    }}
                    placeholder="e.g. Breakfast & Dinner"
                    className="w-full px-3 py-1.5 rounded-lg border border-[#E9E1D5] bg-white text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: HOTEL SPECIFICATIONS */}
      <div className="bg-white border border-[#E9E1D5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#173D32] flex items-center gap-2">
              <HotelIcon className="w-4 h-4 text-[#173D32]" />
              <span>Hotels & Properties</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={addHotel}
            className="bg-[#FAF9F6] border border-[#E9E1D5] hover:bg-[#E9E1D5] text-[#173D32] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Hotel</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hotels.map((h, idx) => (
            <div
              key={idx}
              className="bg-[#FAF9F6] border border-[#E9E1D5] rounded-2xl p-4 space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-[#C5A059]">
                  Hotel {idx + 1}
                </span>
                {hotels.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeHotel(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#252925] mb-0.5">Hotel Name</label>
                <input
                  type="text"
                  value={h.name}
                  onChange={(e) => {
                    const updated = [...hotels];
                    updated[idx].name = e.target.value;
                    setHotels(updated);
                  }}
                  className="w-full px-2.5 py-1 rounded border border-[#E9E1D5] bg-white text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#252925] mb-0.5">Category</label>
                <input
                  type="text"
                  value={h.category}
                  onChange={(e) => {
                    const updated = [...hotels];
                    updated[idx].category = e.target.value;
                    setHotels(updated);
                  }}
                  placeholder="4-Star Deluxe"
                  className="w-full px-2.5 py-1 rounded border border-[#E9E1D5] bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#252925] mb-0.5">Location</label>
                <input
                  type="text"
                  value={h.location}
                  onChange={(e) => {
                    const updated = [...hotels];
                    updated[idx].location = e.target.value;
                    setHotels(updated);
                  }}
                  placeholder="Munnar"
                  className="w-full px-2.5 py-1 rounded border border-[#E9E1D5] bg-white text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: CHANGE SUMMARY & VERSION CREATION */}
      <div className="bg-white border border-[#E9E1D5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#173D32] flex items-center gap-2">
          <History className="w-4 h-4 text-[#173D32]" />
          <span>Version Snapshot Audit Note</span>
        </h2>
        <p className="text-xs text-[#6a7d61]">
          Every time you click &ldquo;Save Package&rdquo;, an immutable version snapshot is recorded with your staff identity and timestamp.
        </p>

        <div>
          <label className="block text-xs font-semibold text-[#252925] mb-1.5">
            Change Summary / Version Log Note <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="e.g. Updated winter peak seasonal rate from ₹32,500 to ₹34,000"
            className="w-full px-3.5 py-2.5 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
          />
        </div>

        {/* Existing Version History Inspection */}
        {initialData?.versions && initialData.versions.length > 0 && (
          <div className="pt-4 border-t border-[#E9E1D5]/60">
            <h4 className="text-xs font-bold text-[#173D32] uppercase tracking-wider mb-3">
              Historical Package Versions ({initialData.versions.length})
            </h4>
            <div className="space-y-2">
              {initialData.versions.map((ver) => (
                <div
                  key={ver.id}
                  className="bg-[#FAF9F6] border border-[#E9E1D5] rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-[#173D32] mr-2">
                      Version {ver.versionNumber}
                    </span>
                    <span className="text-[#252925]">{ver.changeSummary}</span>
                    <span className="text-[10px] text-[#6a7d61] block mt-0.5">
                      By {ver.updatedBy} on {new Date(ver.createdAt).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInspectVersion(ver)}
                    className="text-xs text-[#173D32] font-semibold underline hover:text-[#215143]"
                  >
                    Inspect Snapshot
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* VERSION INSPECTION MODAL */}
      {inspectVersion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E1D5] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9E1D5]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#173D32]">
                  Package Version {inspectVersion.versionNumber} Snapshot
                </h3>
                <p className="text-xs text-[#6a7d61]">
                  Recorded on {new Date(inspectVersion.createdAt).toLocaleString("en-IN")} by {inspectVersion.updatedBy}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectVersion(null)}
                className="p-1 rounded-lg text-[#6a7d61] hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#FAF9F6] border border-[#E9E1D5] rounded-xl p-4 font-mono text-[11px] text-[#252925]">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(inspectVersion.snapshot, null, 2)}
              </pre>
            </div>

            <div className="pt-2 text-right">
              <button
                type="button"
                onClick={() => setInspectVersion(null)}
                className="bg-[#173D32] text-[#FAF9F6] px-5 py-2 rounded-full text-xs font-semibold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 bg-white/95 backdrop-blur-md border border-[#E9E1D5] rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
        <div className="text-xs text-[#6a7d61]">
          Current Status: <strong className="uppercase text-[#173D32]">{status}</strong>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/packages"
            className="px-4 py-2 border border-[#E9E1D5] text-[#252925] rounded-full text-xs font-semibold hover:bg-[#FAF9F6]"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="bg-[#FAF9F6] border border-[#173D32] text-[#173D32] px-5 py-2 rounded-full text-xs font-semibold hover:bg-[#E9E1D5] transition-all cursor-pointer"
          >
            Save as {status}
          </button>

          {status !== "PUBLISHED" && (
            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow cursor-pointer"
            >
              Save & Publish Publicly
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

