"use client";

import Link from "next/link";
import { useState } from "react";
import { Compass, Menu, X, Phone, ShieldCheck } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#FAF9F6]/90 backdrop-blur-md border-b border-[#E9E1D5]/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#173D32] flex items-center justify-center text-[#FAF9F6] shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 stroke-[1.8]" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wider text-[#173D32] block">
                AROHA
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#6a7d61] block -mt-1 font-medium">
                South India Experiences
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#252925]">
            <Link
              href="/packages"
              className="hover:text-[#173D32] transition-colors py-1 relative after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[2px] after:bg-[#173D32] after:transition-all"
            >
              Curated Journeys
            </Link>
            <Link
              href="/packages?dest=kerala"
              className="hover:text-[#173D32] transition-colors py-1"
            >
              Kerala
            </Link>
            <Link
              href="/packages?dest=tamilnadu"
              className="hover:text-[#173D32] transition-colors py-1"
            >
              Tamil Nadu
            </Link>
            <Link
              href="/#why-us"
              className="hover:text-[#173D32] transition-colors py-1"
            >
              The Aroha Difference
            </Link>
            <Link
              href="/#editorial"
              className="hover:text-[#173D32] transition-colors py-1"
            >
              Stories & Guides
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/admin"
              className="text-xs px-3 py-1.5 rounded-full border border-[#A9B8A2]/60 text-[#173D32] hover:bg-[#A9B8A2]/20 flex items-center gap-1.5 transition-colors"
              title="Staff Operations Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Staff CMS</span>
            </Link>

            <Link
              href="/packages"
              className="bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide uppercase shadow-sm transition-all hover:shadow"
            >
              Plan Your Journey
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
        <div className="md:hidden border-b border-[#E9E1D5] bg-[#FAF9F6] px-6 py-6 space-y-4">
          <Link
            href="/packages"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#173D32] py-2 border-b border-[#E9E1D5]/50"
          >
            Curated Journeys
          </Link>
          <Link
            href="/packages?dest=kerala"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#252925] py-2 border-b border-[#E9E1D5]/50"
          >
            Kerala Experiences
          </Link>
          <Link
            href="/packages?dest=tamilnadu"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#252925] py-2 border-b border-[#E9E1D5]/50"
          >
            Tamil Nadu Heritage
          </Link>
          <Link
            href="/#why-us"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-[#252925] py-2 border-b border-[#E9E1D5]/50"
          >
            The Aroha Difference
          </Link>
          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/packages"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full bg-[#173D32] text-[#FAF9F6] py-3 rounded-full text-center text-sm font-semibold tracking-wide uppercase"
            >
              Explore All Journeys
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full border border-[#173D32] text-[#173D32] py-2.5 rounded-full text-center text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Staff Login & Management CMS
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

