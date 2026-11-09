"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Copy,
  Trash2,
  Archive,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  ExternalLink,
  History,
} from "lucide-react";
import { PackageStatus } from "@prisma/client";

interface SeasonalPrice {
  id: string;
  seasonName: string;
  pricePerPerson: number;
}

interface PackageVersion {
  id: string;
  versionNumber: number;
  changeSummary: string;
  createdAt: string;
}

interface PackageItem {
  id: string;
  packageCode: string;
  slug: string;
  title: string;
  destination: string;
  duration: string;
  status: PackageStatus;
  heroImage: string;
  featured: boolean;
  seasonalPrices: SeasonalPrice[];
  versions: PackageVersion[];
  createdAt: string;
  updatedAt: string;
}

export default function PackageTableClient({
  initialPackages,
}: {
  initialPackages: PackageItem[];
}) {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>(initialPackages);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{
    id: string;
    title: string;
    code: string;
  } | null>(null);

  // Filter packages
  const filtered = packages.filter((pkg) => {
    if (statusFilter !== "ALL" && pkg.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const text = (pkg.title + " " + pkg.packageCode + " " + pkg.destination).toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  // Handle Quick Status Change
  const handleStatusChange = async (id: string, newStatus: PackageStatus) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          changeSummary: `Status changed to ${newStatus}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPackages((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
        router.refresh();
      } else {
        alert(data.error || "Failed to update package status");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Duplicate
  const handleDuplicate = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/packages/${id}/duplicate`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        router.refresh();
        // Add to local state or navigate
        router.push(`/admin/packages/${data.package.id}/edit`);
      } else {
        alert(data.error || "Failed to duplicate package");
      }
    } catch {
      alert("Network error duplicating package");
    } finally {
      setActionLoading(null);
    }
  };

  // Handle Delete Confirmation
  const confirmDelete = async (archiveOnly: boolean) => {
    if (!confirmDeleteModal) return;
    const { id } = confirmDeleteModal;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/packages/${id}?archive=${archiveOnly}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setConfirmDeleteModal(null);
        if (archiveOnly) {
          setPackages((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: PackageStatus.ARCHIVED } : p))
          );
        } else {
          setPackages((prev) => prev.filter((p) => p.id !== id));
        }
        router.refresh();
      } else {
        alert(data.error || "Failed to delete/archive package");
      }
    } catch {
      alert("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: PackageStatus) => {
    switch (status) {
      case PackageStatus.PUBLISHED:
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case PackageStatus.DRAFT:
        return "bg-amber-100 text-amber-800 border-amber-300";
      case PackageStatus.ARCHIVED:
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white border border-[#E9E1D5] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6a7d61] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, code or destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: `All (${packages.length})` },
            { id: "PUBLISHED", label: `Published (${packages.filter(p => p.status === "PUBLISHED").length})` },
            { id: "DRAFT", label: `Draft (${packages.filter(p => p.status === "DRAFT").length})` },
            { id: "ARCHIVED", label: `Archived (${packages.filter(p => p.status === "ARCHIVED").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? "bg-[#173D32] text-[#FAF9F6]"
                  : "bg-[#FAF9F6] text-[#252925] hover:bg-[#E9E1D5]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Package Table */}
      <div className="bg-white border border-[#E9E1D5] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F6] border-b border-[#E9E1D5] text-[#6a7d61] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Code & Title</th>
                <th className="px-4 py-3.5">Destination</th>
                <th className="px-4 py-3.5">Duration</th>
                <th className="px-4 py-3.5">Starting Price</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Version</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E1D5]/60 text-[#252925]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-[#6a7d61]">
                    No packages match your search filter.
                  </td>
                </tr>
              ) : (
                filtered.map((pkg) => {
                  const lowestPrice = pkg.seasonalPrices[0]?.pricePerPerson;
                  const latestVersion = pkg.versions[0]?.versionNumber || 1;

                  return (
                    <tr key={pkg.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                      {/* Code & Title */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[#E9E1D5] overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={pkg.heroImage}
                              alt={pkg.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-mono text-[10px] font-bold text-[#173D32] bg-[#FAF9F6] px-1.5 py-0.5 rounded border border-[#E9E1D5]">
                              {pkg.packageCode}
                            </span>
                            <h4 className="font-serif font-bold text-sm text-[#173D32] mt-0.5 line-clamp-1 max-w-xs">
                              {pkg.title}
                            </h4>
                            <span className="text-[10px] text-[#6a7d61] font-mono">
                              /packages/{pkg.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Destination */}
                      <td className="px-4 py-4 text-[#252925]/80 font-medium">
                        {pkg.destination}
                      </td>

                      {/* Duration */}
                      <td className="px-4 py-4 text-[#252925]/80">
                        {pkg.duration}
                      </td>

                      {/* Price */}
                      <td className="px-4 py-4">
                        <span className="font-serif font-bold text-sm text-[#173D32]">
                          ₹{lowestPrice ? lowestPrice.toLocaleString("en-IN") : "---"}
                        </span>
                        <span className="text-[10px] text-[#6a7d61] block">
                          {pkg.seasonalPrices.length} season tier(s)
                        </span>
                      </td>

                      {/* Status Selector */}
                      <td className="px-4 py-4">
                        <select
                          value={pkg.status}
                          disabled={actionLoading === pkg.id}
                          onChange={(e) =>
                            handleStatusChange(pkg.id, e.target.value as PackageStatus)
                          }
                          className={`text-[11px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(
                            pkg.status
                          )}`}
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="PUBLISHED">PUBLISHED</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </td>

                      {/* Version */}
                      <td className="px-4 py-4 font-mono text-xs text-[#6a7d61]">
                        <span className="inline-flex items-center gap-1 bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E9E1D5]">
                          <History className="w-3 h-3 text-[#173D32]" />
                          <span>v{latestVersion}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Preview Link */}
                          <Link
                            href={`/admin/packages/${pkg.id}/preview`}
                            className="p-1.5 rounded-lg text-[#6a7d61] hover:text-[#173D32] hover:bg-[#FAF9F6]"
                            title="Preview Public Render"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Edit Link */}
                          <Link
                            href={`/admin/packages/${pkg.id}/edit`}
                            className="p-1.5 rounded-lg text-[#6a7d61] hover:text-[#173D32] hover:bg-[#FAF9F6]"
                            title="Edit Package & Itinerary"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(pkg.id)}
                            disabled={actionLoading === pkg.id}
                            className="p-1.5 rounded-lg text-[#6a7d61] hover:text-[#173D32] hover:bg-[#FAF9F6]"
                            title="Duplicate Package"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Delete / Archive */}
                          <button
                            onClick={() =>
                              setConfirmDeleteModal({
                                id: pkg.id,
                                title: pkg.title,
                                code: pkg.packageCode,
                              })
                            }
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete or Archive Package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL FOR DELETE / ARCHIVE */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E1D5] rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#173D32]">
                  Confirm Action
                </h3>
                <p className="text-xs text-[#6a7d61]">
                  Package: {confirmDeleteModal.code}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#252925] leading-relaxed">
              How would you like to handle &ldquo;{confirmDeleteModal.title}&rdquo;? You can safely archive it (removing from public view while preserving history) or delete it permanently.
            </p>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => confirmDelete(true)}
                disabled={actionLoading !== null}
                className="w-full bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Archive Package (Safe & Recommended)
              </button>

              <button
                onClick={() => confirmDelete(false)}
                disabled={actionLoading !== null}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors"
              >
                Permanently Delete
              </button>

              <button
                onClick={() => setConfirmDeleteModal(null)}
                className="w-full border border-[#E9E1D5] text-[#252925] py-2 rounded-full text-xs font-semibold hover:bg-[#FAF9F6]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

