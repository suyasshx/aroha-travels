import { prisma } from "@/lib/prisma";
import { History, ShieldCheck, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminActivityPage() {
  const activities = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-[#6a7d61] block mb-1">
          Security & Operations
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
          Activity Logs & Audit Trail
        </h1>
        <p className="text-xs text-[#252925]/70 mt-0.5">
          Immutable audit log recording package updates, logins, status modifications, and AI approvals.
        </p>
      </div>

      <div className="bg-white border border-[#E9E1D5] rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="divide-y divide-[#E9E1D5]/60">
          {activities.length === 0 ? (
            <p className="text-xs text-[#6a7d61] py-8 text-center">No activity records logged yet.</p>
          ) : (
            activities.map((act) => (
              <div key={act.id} className="py-4 flex items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#173D32] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E9E1D5] text-[11px]">
                      {act.action}
                    </span>
                    <span className="text-[10px] text-[#6a7d61] font-mono">
                      {act.entityType} • {act.entityId}
                    </span>
                  </div>
                  <p className="text-[#252925] leading-relaxed">{act.details}</p>
                  {act.userName && (
                    <span className="text-[10px] text-[#6a7d61] flex items-center gap-1">
                      <User className="w-3 h-3 text-[#173D32]" />
                      <span>By {act.userName}</span>
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-mono text-[#6a7d61] shrink-0">
                  {new Date(act.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

