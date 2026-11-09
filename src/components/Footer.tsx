import Link from "next/link";
import { Compass, ShieldCheck, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#173D32] text-[#FAF9F6] border-t border-[#215143]">
      {/* Upper Colophon Banner */}
      <div className="border-b border-[#215143]/80 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#A9B8A2]/40 flex items-center justify-center text-[#FAF9F6]">
              <Compass className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-[0.2em] text-[#FAF9F6] block">
                AROHA TRAVELS
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#A9B8A2] font-mono">
                Discover South India, Beautifully.
              </span>
            </div>
          </div>
          <p className="text-xs text-[#A9B8A2] max-w-xl font-normal leading-relaxed">
            Curated journeys through God’s Own Country and the Dravidian temple sanctuaries of Tamil Nadu. Handcrafted itineraries, transparent seasonal tariffs, and verified boutique stays.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 text-xs">
          {/* Column 1: Expeditions */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider text-[#FAF9F6] uppercase mb-4 text-[#C5A059]">
              Curated Circuits
            </h4>
            <ul className="space-y-3 text-[#A9B8A2]">
              <li>
                <Link href="/packages/munnar-thekkady-alleppey-houseboat" className="hover:text-[#FAF9F6] transition-colors flex items-center justify-between group">
                  <span>Munnar & Alleppey (6D)</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/packages/grand-kerala-odyssey-kochi-munnar-alleppey-marari" className="hover:text-[#FAF9F6] transition-colors flex items-center justify-between group">
                  <span>Grand Kerala Odyssey (8D)</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/packages/wayanad-rainforests-heritage-hideaway" className="hover:text-[#FAF9F6] transition-colors flex items-center justify-between group">
                  <span>Wayanad Rainforests (4D)</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-[#FAF9F6] transition-colors flex items-center justify-between group">
                  <span>Complete Journey Archive</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Geographic Regions */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider text-[#FAF9F6] uppercase mb-4 text-[#C5A059]">
              Regional Studies
            </h4>
            <ul className="space-y-3 text-[#A9B8A2]">
              <li>
                <Link href="/packages?dest=munnar" className="hover:text-[#FAF9F6] transition-colors">
                  Munnar Tea Plantations
                </Link>
              </li>
              <li>
                <Link href="/packages?dest=alleppey" className="hover:text-[#FAF9F6] transition-colors">
                  Vembanad Backwaters
                </Link>
              </li>
              <li>
                <Link href="/packages?dest=thekkady" className="hover:text-[#FAF9F6] transition-colors">
                  Periyar Tiger Reserve
                </Link>
              </li>
              <li>
                <Link href="/packages?dest=kochi" className="hover:text-[#FAF9F6] transition-colors">
                  Historic Fort Kochi
                </Link>
              </li>
              <li>
                <Link href="/packages?dest=tamilnadu" className="hover:text-[#FAF9F6] transition-colors">
                  Madurai & Temple Corridors
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: The Atelier */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider text-[#FAF9F6] uppercase mb-4 text-[#C5A059]">
              The Atelier
            </h4>
            <ul className="space-y-3 text-[#A9B8A2]">
              <li>
                <Link href="/#manifesto" className="hover:text-[#FAF9F6] transition-colors">
                  Our Travel Philosophy
                </Link>
              </li>
              <li>
                <Link href="/#editorial" className="hover:text-[#FAF9F6] transition-colors">
                  Field Notes & Essays
                </Link>
              </li>
              <li>
                <Link href="/#enquire" className="hover:text-[#FAF9F6] transition-colors">
                  Custom Route Design
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#FAF9F6] transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Staff Concierge Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 & 5: Direct Concierge & Statutory */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif text-sm font-semibold tracking-wider text-[#FAF9F6] uppercase mb-4 text-[#C5A059]">
              Reservations & Advisory Desk
            </h4>
            <div className="space-y-2.5 text-[#A9B8A2]">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>Riverview Pavilion, Fort Kochi, Kochi, Kerala 682001</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>+91 (0) 484 221 8940 · Mon–Sat 09:00 – 19:00 IST</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span>concierge@aroha-travels.com</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#215143] text-[11px] text-[#A9B8A2]/80 space-y-1">
              <p>Kerala Tourism Accredited Tour Operator · Reg KL-2024-EXP-8942</p>
              <p>Certified DPDP Act 2023 Compliant · Traveller Privacy Guarantee</p>
            </div>
          </div>
        </div>

        {/* Bottom Colophon / Copyright */}
        <div className="mt-14 pt-8 border-t border-[#215143] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A9B8A2]/70 gap-4">
          <p>© {new Date().getFullYear()} Aroha Travels Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Disclosures & Privacy Notice</span>
            <span>Terms of Carriage</span>
            <span>Bespoke Booking Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
