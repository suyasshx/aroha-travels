import Link from "next/link";
import { Compass, Mail, Phone, MapPin, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#173D32] text-[#FAF9F6] border-t border-[#215143]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF9F6] flex items-center justify-center text-[#173D32]">
                <Compass className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-[#FAF9F6] block">
                  AROHA TRAVELS
                </span>
                <span className="text-xs uppercase tracking-widest text-[#A9B8A2] block">
                  Discover South India, Beautifully.
                </span>
              </div>
            </div>
            <p className="text-sm text-[#A9B8A2] leading-relaxed max-w-sm pt-2">
              A boutique Kerala & South India tour operator dedicated to meaningful travel, architectural heritage, restorative Ayurvedic retreats, and private backwater voyages.
            </p>
            <div className="pt-2 text-xs text-[#A9B8A2]/80 space-y-1">
              <p>Certified Kerala Tourism Accredited Operator • Reg #KL-TOUR-8942</p>
              <p>Fully compliant with India Digital Personal Data Protection (DPDP) Act 2023</p>
            </div>
          </div>

          {/* Journeys */}
          <div>
            <h4 className="font-serif text-base font-semibold tracking-wide text-[#FAF9F6] mb-4">
              Featured Journeys
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A9B8A2]">
              <li>
                <Link href="/packages/munnar-thekkady-alleppey-houseboat" className="hover:text-[#FAF9F6] transition-colors">
                  Munnar & Alleppey Houseboat
                </Link>
              </li>
              <li>
                <Link href="/packages/grand-kerala-odyssey-kochi-munnar-alleppey-marari" className="hover:text-[#FAF9F6] transition-colors">
                  Grand Kerala Odyssey (8D)
                </Link>
              </li>
              <li>
                <Link href="/packages/wayanad-rainforests-heritage-hideaway" className="hover:text-[#FAF9F6] transition-colors">
                  Wayanad Rainforests
                </Link>
              </li>
              <li>
                <Link href="/packages" className="hover:text-[#FAF9F6] transition-colors">
                  All South India Circuits
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="font-serif text-base font-semibold tracking-wide text-[#FAF9F6] mb-4">
              Destinations
            </h4>
            <ul className="space-y-2.5 text-sm text-[#A9B8A2]">
              <li>
                <Link href="/packages?dest=munnar" className="hover:text-[#FAF9F6] transition-colors">
                  Munnar Highlands
                </Link>
              </li>
              <li>
                <Link href="/packages?dest=alleppey" className="hover:text-[#FAF9F6] transition-colors">
                  Alleppey Backwaters
                </Link>
              </li>
              <li>
                <Link href="/packages?dest=thekkady" className="hover:text-[#FAF9F6] transition-colors">
                  Periyar Wildlife
                </Link>
              </li>
              <li>
                <Link href="/packages?dest=kochi" className="hover:text-[#FAF9F6] transition-colors">
                  Historic Fort Kochi
                </Link>
              </li>
              <li>
                <Link href="/packages?dest=tamilnadu" className="hover:text-[#FAF9F6] transition-colors">
                  Madurai & Rameswaram
                </Link>
              </li>
            </ul>
          </div>

          {/* Direct Concierge Contact */}
          <div>
            <h4 className="font-serif text-base font-semibold tracking-wide text-[#FAF9F6] mb-4">
              Concierge Desk
            </h4>
            <div className="space-y-3 text-sm text-[#A9B8A2]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A9B8A2] mt-0.5 shrink-0" />
                <span>Riverview Road, Near Mattancherry Jetty, Fort Kochi, Kerala 682002</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A9B8A2] shrink-0" />
                <span>+91 484 290 1234 / +91 94470 54321</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#A9B8A2] shrink-0" />
                <span>journeys@aroha-travels.com</span>
              </div>
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-[#FAF9F6] bg-[#215143] hover:bg-[#2c6957] px-3 py-1.5 rounded-full transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Staff Operations Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-[#215143]/80 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A9B8A2] gap-4">
          <p>© {new Date().getFullYear()} Aroha Travels. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>DPDP Conscious Consent</span>
            <span>Accredited Operator</span>
            <span className="flex items-center gap-1">
              Crafted with <Heart className="w-3 h-3 text-[#C16B4D] fill-current" /> for South India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

