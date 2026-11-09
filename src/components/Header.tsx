"use client";

import Link from "next/link";
import { useState } from "react";
import { Compass, Menu, X, ArrowUpRight, ShieldCheck } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6]/95 backdrop-blur-md border-b border-[#E9E1D5] transition-all">
      {/* Top Editorial Bar */}
      <div className="hidden lg:block border-b border-[#E9E1D5]/60 bg-[#FAF9F6] text-[10px] tracking-[0.2em] text-[#6a7d61] uppercase py-1.5 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-mono">
          <span>KERALA & SOUTH INDIA EXPEDITIONS · EST. 2024</span>
          <div className="flex items-center gap-6">
            <span>BOUTIQUE RESORTS · PRIVATE KETTUVALLAMS · HERITAGE RETREATS</span>
            <span className="text-[#173D32] font-semibold">DPDP ACT 2023 COMPLIANT</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Masthead */}
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-full border border-[#173D32] bg-[#FAF9F6] group-hover:bg-[#173D32] flex items-center justify-center text-[#173D32] group-hover:text-[#FAF9F6] transition-all duration-300">
              <Compass className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl sm:text-2xl font-bold tracking-[0.18em] text-[#173D32] leading-none">
                AROHA
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#6a7d61] font-mono mt-1">
                South India Experiences
              </span>
            </div>
          </Link>

          {/* Editorial Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-xs font-medium tracking-[0.12em] uppercase text-[#252925]">
            <Link
              href="/packages"
              className="hover:text-[#173D32] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-[#173D32] after:transition-all"
            >
              <span className="font-serif italic lowercase text-[11px] text-[#6a7d61] mr-1.5">i.</span>
              Curated Journeys
            </Link>
            <Link
              href="/packages?dest=kerala"
              className="hover:text-[#173D32] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-[#173D32] after:transition-all"
            >
              <span className="font-serif italic lowercase text-[11px] text-[#6a7d61] mr-1.5">ii.</span>
              Kerala Highlands & Coast
            </Link>
            <Link
              href="/#manifesto"
              className="hover:text-[#173D32] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-[#173D32] after:transition-all"
            >
              <span className="font-serif italic lowercase text-[11px] text-[#6a7d61] mr-1.5">iii.</span>
              The Atelier
            </Link>
            <Link
              href="/#editorial"
              className="hover:text-[#173D32] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1.5px] after:bg-[#173D32] after:transition-all"
            >
              <span className="font-serif italic lowercase text-[11px] text-[#6a7d61] mr-1.5">iv.</span>
              Field Notes
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              href="/admin"
              className="text-[11px] uppercase tracking-wider text-[#6a7d61] hover:text-[#173D32] flex items-center gap-1.5 py-1 transition-colors"
              title="Staff Operations Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#173D32]" />
              <span>Staff Desk</span>
            </Link>

            <Link
              href="/#enquire"
              className="bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] px-5 py-2.5 rounded-full text-[11px] font-semibold tracking-[0.15em] uppercase transition-all duration-200 flex items-center gap-2 shadow-sm"
            >
              <span>Bespoke Enquiry</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/admin"
              className="text-xs p-2 text-[#173D32]"
              title="Staff Portal"
            >
              <ShieldCheck className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#173D32] hover:bg-[#E9E1D5]/40"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E9E1D5] bg-[#FAF9F6] px-6 py-6 space-y-4">
          <div className="space-y-3 text-sm tracking-wider uppercase">
            <Link
              href="/packages"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#252925] hover:text-[#173D32]"
            >
              Curated Journeys
            </Link>
            <Link
              href="/packages?dest=kerala"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#252925] hover:text-[#173D32]"
            >
              Kerala Circuits
            </Link>
            <Link
              href="/#manifesto"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#252925] hover:text-[#173D32]"
            >
              The Atelier
            </Link>
            <Link
              href="/#editorial"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#252925] hover:text-[#173D32]"
            >
              Field Notes
            </Link>
          </div>

          <div className="pt-4 border-t border-[#E9E1D5] space-y-3">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#6a7d61]"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Staff Operations CMS</span>
            </Link>
            <Link
              href="/#enquire"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center bg-[#173D32] text-[#FAF9F6] py-3 rounded-full text-xs uppercase tracking-widest font-semibold"
            >
              Bespoke Enquiry
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
