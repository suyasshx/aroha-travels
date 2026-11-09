"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all shadow flex items-center gap-2 cursor-pointer"
    >
      <Printer className="w-3.5 h-3.5" />
      <span>Print Quotation / PDF</span>
    </button>
  );
}

