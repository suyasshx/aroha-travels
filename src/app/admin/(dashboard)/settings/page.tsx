import { ShieldCheck, Database, Key, Server, CheckCircle2 } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-[#6a7d61] block mb-1">
          Configuration
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
          Operations & System Settings
        </h1>
      </div>

      <div className="bg-white border border-[#E9E1D5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-[#173D32] mb-1">
            Tour Operator Information
          </h2>
          <p className="text-xs text-[#6a7d61]">
            Official business entity registered with Kerala Tourism Department.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E9E1D5]">
            <span className="text-[10px] uppercase font-bold text-[#6a7d61] block mb-1">Brand Name</span>
            <p className="font-bold text-sm text-[#173D32]">AROHA TRAVELS</p>
            <p className="text-[#6a7d61] mt-0.5">Tagline: Discover South India, Beautifully.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E9E1D5]">
            <span className="text-[10px] uppercase font-bold text-[#6a7d61] block mb-1">Accreditation</span>
            <p className="font-bold text-sm text-[#173D32]">Certified Kerala Tour Operator</p>
            <p className="text-[#6a7d61] mt-0.5">Reg #KL-TOUR-8942 • GSTIN: 32AABCA1234F1Z9</p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#E9E1D5]/60 space-y-4">
          <h3 className="font-serif text-base font-bold text-[#173D32] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#173D32]" />
            <span>Digital Personal Data Protection (DPDP) Act Compliance</span>
          </h3>

          <div className="text-xs text-[#252925]/80 space-y-2 leading-relaxed bg-[#FAF9F6] p-4 rounded-2xl border border-[#E9E1D5]">
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Explicit consent collected on all public contact forms.</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>WhatsApp follow-up consent is strictly optional and tracked as a separate boolean field.</span>
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>No customer data is shared with unverified third parties.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

