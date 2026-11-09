import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PackageStatus, EnquiryStatus } from "@prisma/client";
import {
  Inbox,
  Package,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // 1. Execute Real Database Queries for Metrics
  const [
    totalEnquiries,
    newEnquiries,
    awaitingResponse,
    publishedPackages,
    draftPackages,
    recentEnquiries,
    recentActivities,
  ] = await Promise.all([
    prisma.enquiry.count(),
    prisma.enquiry.count({ where: { status: EnquiryStatus.NEW } }),
    prisma.enquiry.count({
      where: { status: { in: [EnquiryStatus.NEW, EnquiryStatus.QUALIFIED] } },
    }),
    prisma.package.count({ where: { status: PackageStatus.PUBLISHED } }),
    prisma.package.count({ where: { status: PackageStatus.DRAFT } }),
    prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        aiExtraction: true,
      },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  // Helper for human-readable elapsed response time
  const getElapsedTime = (createdDate: Date) => {
    const diffMs = Date.now() - new Date(createdDate).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h ago`;
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m ago`;
    return `${Math.max(1, diffMins)}m ago`;
  };

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case EnquiryStatus.NEW:
        return "bg-amber-100 text-amber-900 border-amber-300";
      case EnquiryStatus.CONTACTED:
        return "bg-blue-100 text-blue-900 border-blue-300";
      case EnquiryStatus.QUALIFIED:
        return "bg-purple-100 text-purple-900 border-purple-300";
      case EnquiryStatus.QUOTATION_SENT:
        return "bg-indigo-100 text-indigo-900 border-indigo-300";
      case EnquiryStatus.CONVERTED:
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case EnquiryStatus.LOST:
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6a7d61] block mb-1">
            Operations & Reservations Dashboard
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
            Operations Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/packages/new"
            className="bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] px-4 py-2 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Package</span>
          </Link>
          <Link
            href="/admin/enquiries"
            className="bg-white border border-[#E9E1D5] hover:bg-[#FAF9F6] text-[#173D32] px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-colors"
          >
            Open Inbox
          </Link>
        </div>
      </div>

      {/* METRIC KPI CARDS (Real DB Data) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Enquiries */}
        <div className="bg-white border border-[#E9E1D5] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#6a7d61] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Enquiries</span>
            <Inbox className="w-4 h-4 text-[#173D32]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#173D32]">{totalEnquiries}</p>
          <span className="text-[11px] text-[#6a7d61] mt-1 block">Lifetime in CRM</span>
        </div>

        {/* New Unhandled Enquiries */}
        <div className="bg-white border border-[#E9E1D5] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">New Enquiries</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-amber-900">{newEnquiries}</p>
          <span className="text-[11px] text-amber-700 mt-1 block">Awaiting First Contact</span>
        </div>

        {/* Enquiries In Pipeline */}
        <div className="bg-white border border-[#E9E1D5] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-indigo-700 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending Quotes</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-indigo-900">{awaitingResponse}</p>
          <span className="text-[11px] text-indigo-600 mt-1 block">Active In Pipeline</span>
        </div>

        {/* Published Packages */}
        <div className="bg-white border border-[#E9E1D5] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Published</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#173D32]">{publishedPackages}</p>
          <span className="text-[11px] text-emerald-700 mt-1 block">Live on Public Site</span>
        </div>

        {/* Draft Packages */}
        <div className="bg-white border border-[#E9E1D5] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-[#6a7d61] mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Draft Packages</span>
            <Package className="w-4 h-4 text-[#C5A059]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#252925]">{draftPackages}</p>
          <span className="text-[11px] text-[#6a7d61] mt-1 block">Pending Review</span>
        </div>
      </div>

      {/* RECENT ENQUIRIES + ACTIVITY LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Enquiries (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#E9E1D5] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#173D32]">
                Recent Inbound Enquiries
              </h2>
              <p className="text-xs text-[#6a7d61]">
                Elapsed response time calculated from creation
              </p>
            </div>
            <Link
              href="/admin/enquiries"
              className="text-xs font-semibold text-[#173D32] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E9E1D5]/60">
            {recentEnquiries.map((enq) => (
              <div
                key={enq.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F6] rounded-xl px-2.5 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#173D32]">
                      {enq.enquiryNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                        enq.status
                      )}`}
                    >
                      {enq.status}
                    </span>
                    {enq.aiExtraction && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#173D32]/10 text-[#173D32] font-medium flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-[#C5A059]" />
                        <span>AI Ready</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-[#252925]">
                    {enq.customerName}
                  </h4>
                  <p className="text-xs text-[#6a7d61]">
                    {enq.destination} • {enq.adults} Adults {enq.children > 0 && `+ ${enq.children} Kids`} • {enq.duration || "5-6 days"}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-xs">
                  <span className="text-[11px] font-mono text-[#6a7d61] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{getElapsedTime(enq.createdAt)}</span>
                  </span>
                  <Link
                    href={`/admin/enquiries?selected=${enq.id}`}
                    className="mt-1 text-xs font-semibold text-[#173D32] hover:underline"
                  >
                    Process →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Log (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E9E1D5] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#173D32]">
                Staff Activity Audit Trail
              </h2>
              <p className="text-xs text-[#6a7d61]">
                Real-time security and operations logs
              </p>
            </div>
            <Link
              href="/admin/activity"
              className="text-xs font-semibold text-[#173D32] hover:underline flex items-center gap-1"
            >
              <span>Audit Logs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivities.map((act) => (
              <div key={act.id} className="text-xs flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#173D32] mt-1.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#173D32]">{act.action}</span>
                    <span className="text-[10px] text-[#6a7d61] font-mono">
                      {getElapsedTime(act.createdAt)}
                    </span>
                  </div>
                  <p className="text-[#252925]/80 mt-0.5 leading-relaxed">
                    {act.details || `Updated ${act.entityType} ${act.entityId}`}
                  </p>
                  {act.userName && (
                    <span className="text-[10px] text-[#6a7d61] block mt-0.5">
                      By {act.userName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

