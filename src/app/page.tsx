import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicEnquiryForm from "@/components/PublicEnquiryForm";
import { prisma } from "@/lib/prisma";
import { PackageStatus } from "@prisma/client";
import {
  Compass,
  ArrowRight,
  Clock,
  Sparkles,
  ShieldCheck,
  Award,
  Leaf,
  Calendar,
  CheckCircle,
  Star,
  Quote,
} from "lucide-react";

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  // Query only PUBLISHED packages from PostgreSQL
  const publishedPackages = await prisma.package.findMany({
    where: {
      status: PackageStatus.PUBLISHED,
    },
    include: {
      seasonalPrices: {
        orderBy: {
          pricePerPerson: "asc",
        },
      },
    },
    orderBy: {
      featured: "desc",
    },
    take: 3,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#173D32]">
          {/* Background Cinematic Image with Subtle Parallax feel */}
          <div className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2000&auto=format&fit=crop"
              alt="Misty tea gardens of Munnar, Kerala"
              className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#173D32] via-[#173D32]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#173D32]/90 via-transparent to-[#173D32]/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center sm:text-left">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF9F6]/10 backdrop-blur-md border border-[#FAF9F6]/20 text-[#FAF9F6] text-xs uppercase tracking-widest font-medium mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Curated Kerala & South India Experiences</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAF9F6] leading-[1.1] mb-6">
                Some journeys stay with you forever.
              </h1>

              <p className="text-base sm:text-xl text-[#A9B8A2] font-normal leading-relaxed max-w-2xl mb-10">
                Discover the quiet poetry of God’s Own Country. From emerald tea hills in Munnar and private backwater houseboats in Alleppey, to centuries-old temple sanctuaries in Tamil Nadu.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/packages"
                  className="w-full sm:w-auto bg-[#FAF9F6] text-[#173D32] hover:bg-[#E9E1D5] px-8 py-4 rounded-full font-semibold text-sm tracking-wide uppercase shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Explore Journeys</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#enquire"
                  className="w-full sm:w-auto bg-[#215143]/80 hover:bg-[#215143] text-[#FAF9F6] border border-[#FAF9F6]/30 px-8 py-4 rounded-full font-semibold text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Plan Your Trip</span>
                </a>
              </div>

              {/* Verified Trust Badges */}
              <div className="mt-14 pt-8 border-t border-[#FAF9F6]/15 grid grid-cols-2 sm:grid-cols-3 gap-6 text-left">
                <div>
                  <p className="text-xs text-[#A9B8A2] uppercase tracking-wider font-medium">Boutique Stays</p>
                  <p className="text-sm font-serif font-bold text-[#FAF9F6] mt-0.5">Heritage & 4/5-Star</p>
                </div>
                <div>
                  <p className="text-xs text-[#A9B8A2] uppercase tracking-wider font-medium">Private Fleet</p>
                  <p className="text-sm font-serif font-bold text-[#FAF9F6] mt-0.5">AC Sedans & Kettuvallams</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-[#A9B8A2] uppercase tracking-wider font-medium">Pricing Integrity</p>
                  <p className="text-sm font-serif font-bold text-[#FAF9F6] mt-0.5">Direct Seasonal Rates</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* POPULAR CURATED PACKAGES */}
        <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#6a7d61] block mb-2">
                Signature Itineraries
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
                Popular Curated Packages
              </h2>
            </div>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#173D32] hover:text-[#215143] group"
            >
              <span>View All Packages</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedPackages.map((pkg) => {
              const startingPrice = pkg.seasonalPrices[0]?.pricePerPerson;
              return (
                <div
                  key={pkg.id}
                  className="bg-white border border-[#E9E1D5] rounded-2xl overflow-hidden card-hover flex flex-col group shadow-sm"
                >
                  <div className="relative h-64 overflow-hidden bg-[#E9E1D5]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pkg.heroImage}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 bg-[#173D32]/90 backdrop-blur-sm text-[#FAF9F6] text-xs font-semibold rounded-full tracking-wide">
                        {pkg.duration}
                      </span>
                      {pkg.featured && (
                        <span className="px-3 py-1 bg-[#C5A059] text-[#FAF9F6] text-xs font-semibold rounded-full tracking-wide">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[#6a7d61] font-semibold mb-1">
                        {pkg.destination}
                      </p>
                      <h3 className="font-serif text-xl font-bold text-[#173D32] group-hover:text-[#215143] transition-colors line-clamp-2 mb-3">
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-[#252925]/75 line-clamp-2 leading-relaxed mb-4">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#E9E1D5]/60 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-[#252925]/60 block">Starting from</span>
                        <span className="text-lg font-serif font-bold text-[#173D32]">
                          ₹{startingPrice ? startingPrice.toLocaleString("en-IN") : "Price on Request"}
                        </span>
                        <span className="text-[10px] text-[#6a7d61] block -mt-1">
                          per person / twin sharing
                        </span>
                      </div>

                      <Link
                        href={`/packages/${pkg.slug}`}
                        className="px-4 py-2 bg-[#FAF9F6] group-hover:bg-[#173D32] group-hover:text-[#FAF9F6] text-[#173D32] border border-[#E9E1D5] rounded-full text-xs font-semibold transition-all"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* FEATURED DESTINATIONS */}
        <section className="py-16 bg-[#FAF9F6] border-y border-[#E9E1D5]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#6a7d61] block mb-2">
                Geographic Highlights
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
                Destinations of South India
              </h2>
              <p className="text-sm text-[#252925]/70 mt-2">
                Each landscape offers its own rhythm, architectural traditions, and seasonal culinary wonders.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Munnar Highlands",
                  tag: "Tea Plantations & Mist",
                  img: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=800&auto=format&fit=crop",
                  desc: "Rolling emerald tea carpets, Anamudi peak, and colonial planters' bungalows.",
                },
                {
                  title: "Alleppey Backwaters",
                  tag: "Kettuvallam Houseboats",
                  img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
                  desc: "Vembanad Lake, paddy fields below sea level, and tranquil village waterways.",
                },
                {
                  title: "Wayanad Rainforests",
                  tag: "Waterfalls & Wildlife",
                  img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop",
                  desc: "Canopy treehouses, prehistoric petroglyphs at Edakkal, and bamboo river rafts.",
                },
                {
                  title: "Tamil Nadu Temples",
                  tag: "Dravidian Heritage",
                  img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop",
                  desc: "Madurai gopurams, the engineering marvel of Pamban bridge, and sacred oceans.",
                },
              ].map((dest, idx) => (
                <div
                  key={idx}
                  className="group relative rounded-2xl overflow-hidden bg-white border border-[#E9E1D5] shadow-sm card-hover"
                >
                  <div className="h-56 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dest.img}
                      alt={dest.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6a7d61]">
                      {dest.tag}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#173D32] mt-0.5 mb-1.5">
                      {dest.title}
                    </h3>
                    <p className="text-xs text-[#252925]/75 leading-relaxed">
                      {dest.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY TRAVEL WITH US */}
        <section id="why-us" className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#6a7d61] block">
                The Aroha Difference
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32] leading-tight">
                Authentic, respectful travel without shortcuts.
              </h2>
              <p className="text-sm text-[#252925]/80 leading-relaxed">
                Most travel aggregators outsource your trip to random subcontractors. At Aroha Travels, we own our fleet relationships, inspect every boutique estate, and ensure direct seasonal pricing without hidden commissions.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: "Contracted Seasonal Rates",
                    desc: "Transparent room tariffs directly synced with hotel inventory. No artificially inflated pricing.",
                  },
                  {
                    title: "Dedicated Local Chauffeur-Concierge",
                    desc: "Courteous, verified drivers who know scenic mountain passes, clean dining stops, and cultural nuances.",
                  },
                  {
                    title: "Private Traditional Houseboats",
                    desc: "Handcrafted wooden Kettuvallams with private chefs preparing traditional Karimeen and Kerala sadhya.",
                  },
                  {
                    title: "DPDP Data Protection Compliance",
                    desc: "Your phone number and travel budget remain strictly confidential between you and our reservations desk.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div className="w-6 h-6 rounded-full bg-[#173D32]/10 text-[#173D32] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#173D32]">{item.title}</h4>
                      <p className="text-xs text-[#252925]/70 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop"
                alt="Kerala backwaters"
                className="rounded-2xl object-cover h-64 sm:h-80 w-full shadow-sm"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop"
                alt="Munnar plantation"
                className="rounded-2xl object-cover h-64 sm:h-80 w-full shadow-sm mt-8"
              />
            </div>
          </div>
        </section>

        {/* TESTIMONIALS (Sample / Demo Content clearly identified) */}
        <section className="py-20 bg-[#FAF9F6] border-t border-[#E9E1D5]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#6a7d61] block mb-2">
                Traveller Experiences
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
                What our guests remember.
              </h2>
              <p className="text-xs text-[#6a7d61] mt-2">
                [Verified Guest Feedback – Sample Demo Content]
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "Our 6-day Munnar and Alleppey trip was flawless. The private houseboat in Alleppey was spotless and the chef cooked the best pearl spot fish we’ve ever tasted.",
                  name: "Vikram & Sunaina Mehta",
                  travel: "Munnar & Alleppey Houseboat (Winter)",
                  rating: 5,
                },
                {
                  quote:
                    "As senior citizens visiting Madurai and Rameswaram, we were worried about crowds. Aroha provided ground-floor rooms and a wonderfully patient driver.",
                  name: "Col. R. K. Nambiar",
                  travel: "Tamil Nadu Heritage Circuit",
                  rating: 5,
                },
                {
                  quote:
                    "The monsoon trek in Wayanad was pure magic. Waking up to mist over the canopy and bamboo river rafting was unforgettable.",
                  name: "Tanvi & Siddharth Roy",
                  travel: "Wayanad Rainforests Hideaway",
                  rating: 5,
                },
              ].map((t, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E9E1D5] rounded-2xl p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex gap-1 text-[#C5A059] mb-4">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <Quote className="w-6 h-6 text-[#A9B8A2] mb-3" />
                    <p className="text-xs text-[#252925] leading-relaxed italic mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#E9E1D5]/60">
                    <p className="text-xs font-bold text-[#173D32]">{t.name}</p>
                    <p className="text-[11px] text-[#6a7d61]">{t.travel}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* EDITORIAL BLOG SECTION */}
        <section id="editorial" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#6a7d61] block mb-2">
                Field Notes & Stories
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
                South India Travel Editorial
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Monsoon in God's Own Country: The Sacred Season of Ayurveda",
                date: "June 2026",
                category: "Wellness & Nature",
                img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop",
                summary:
                  "Why traditional Ayurvedic vaidyas consider the July monsoon the optimal atmospheric condition for restorative Panchakarma therapies.",
              },
              {
                title: "The Solitude of Tea Country: Walking Munnar’s Historic Ridge Trails",
                date: "May 2026",
                category: "Highlands",
                img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=800&auto=format&fit=crop",
                summary:
                  "Exploring 130-year-old British planter bungalows, organic single-origin orthodox teas, and the sanctuary of Anamudi.",
              },
              {
                title: "Behind the Corbelled Gopurams: Architectural Wonders of Rameswaram",
                date: "April 2026",
                category: "Architectural Heritage",
                img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=800&auto=format&fit=crop",
                summary:
                  "A guide to the world's longest granite corridor and the dramatic coastal ghost town of Dhanushkodi.",
              },
            ].map((blog, i) => (
              <article
                key={i}
                className="bg-white border border-[#E9E1D5] rounded-2xl overflow-hidden shadow-sm card-hover flex flex-col"
              >
                <div className="h-48 overflow-hidden bg-[#E9E1D5]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blog.img}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#6a7d61] font-semibold mb-2">
                      <span>{blog.category}</span>
                      <span>{blog.date}</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#173D32] hover:text-[#215143] leading-snug mb-2">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-[#252925]/75 leading-relaxed">
                      {blog.summary}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ENQUIRY ANCHOR SECTION */}
        <section id="enquire" className="py-20 lg:py-24 bg-[#173D32] text-[#FAF9F6]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#A9B8A2] block mb-2">
                Direct Reservations & Custom Quotes
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#FAF9F6]">
                Begin Your Journey With Us
              </h2>
              <p className="text-sm text-[#A9B8A2] max-w-lg mx-auto mt-2">
                Our reservations team responds with a detailed quotation and verified room availability within 2 to 4 business hours.
              </p>
            </div>

            <PublicEnquiryForm defaultDestination="Kerala" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
