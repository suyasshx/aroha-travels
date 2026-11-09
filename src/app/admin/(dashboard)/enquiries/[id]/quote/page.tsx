import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Compass, Printer, ArrowLeft, ShieldCheck, Mail, Phone, Calendar, MapPin, Check, FileText } from "lucide-react";
import PrintButton from "./PrintButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EnquiryQuotePage({ params }: PageProps) {
  const { id } = await params;

  const enquiry = await prisma.enquiry.findUnique({
    where: { id },
    include: {
      aiExtraction: true,
    },
  });

  if (!enquiry) {
    notFound();
  }

  // Find top matched package recommendation if available
  const recommendations = (enquiry.aiExtraction?.recommendations as any[]) || [];
  const topRec = recommendations[0];
  let matchedPackage = null;

  if (topRec?.packageId) {
    matchedPackage = await prisma.package.findUnique({
      where: { id: topRec.packageId },
      include: {
        itineraryDays: { orderBy: { dayNumber: "asc" } },
        hotels: true,
        seasonalPrices: true,
      },
    });
  }

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const quoteNumber = `QT-${enquiry.enquiryNumber.replace("ENQ-", "")}`;
  const pricePerPerson = topRec?.pricePerPerson || (enquiry.budget ? Math.round(enquiry.budget / (enquiry.adults || 2)) : 32500);
  const adults = enquiry.adults || 2;
  const baseTotal = pricePerPerson * adults;
  const gstAmount = Math.round(baseTotal * 0.05);
  const grandTotal = baseTotal + gstAmount;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Navigation & Action Bar (Hidden during print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/admin/enquiries?selected=${enquiry.id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#173D32] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Enquiry Dossier ({enquiry.enquiryNumber})</span>
        </Link>

        <div className="flex items-center gap-3">
          <PrintButton />
        </div>
      </div>

      {/* Printable Quotation Document */}
      <div className="bg-white border border-[#E9E1D5] rounded-3xl p-8 sm:p-12 shadow-sm text-[#252925] print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b-2 border-[#173D32] pb-8 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#173D32] text-[#FAF9F6] flex items-center justify-center">
                <Compass className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-[0.18em] text-[#173D32] block">
                  AROHA TRAVELS
                </span>
                <span className="text-[9px] uppercase tracking-[0.25em] text-[#6a7d61] font-mono block">
                  South India Experiences & Expeditions
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#6a7d61] max-w-sm pt-2 leading-relaxed">
              Riverview Pavilion, Fort Kochi, Kerala 682001<br />
              Accreditation: KL-TOUR-8942 · GSTIN: 32AABCA1234F1Z8
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-[#173D32] text-[#FAF9F6] text-[10px] font-mono font-bold tracking-widest uppercase rounded">
              OFFICIAL TRAVEL PROPOSAL
            </span>
            <p className="font-mono text-sm font-bold text-[#173D32] pt-1">
              REF: {quoteNumber}
            </p>
            <p className="text-[11px] text-[#6a7d61]">
              Issue Date: {currentDate}
            </p>
            <p className="text-[11px] text-[#6a7d61]">
              Validity: 14 Days from Issue
            </p>
          </div>
        </div>

        {/* Client & Dossier Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-[#E9E1D5] text-xs">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6a7d61] block mb-1">
              PREPARED FOR GUEST
            </span>
            <p className="font-serif text-lg font-bold text-[#173D32]">{enquiry.customerName}</p>
            <div className="text-[#252925]/80 space-y-0.5 mt-1 font-mono text-[11px]">
              <p>Email: {enquiry.email}</p>
              <p>Phone: {enquiry.phone}</p>
              <p>Contact Preference: {enquiry.preferredContactMethod}</p>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6a7d61] block mb-1">
              EXPEDITION PARAMETERS
            </span>
            <div className="text-[#252925]/80 space-y-1 mt-1">
              <p>
                <strong className="text-[#173D32]">Destinations:</strong> {enquiry.destination}
              </p>
              <p>
                <strong className="text-[#173D32]">Party Size:</strong> {enquiry.adults} Adults
                {enquiry.children > 0 ? `, ${enquiry.children} Children` : ""}
              </p>
              <p>
                <strong className="text-[#173D32]">Proposed Duration:</strong> {enquiry.duration || "6 Days / 5 Nights"}
              </p>
              <p>
                <strong className="text-[#173D32]">Consultant:</strong> {enquiry.assignedTo || "Aroha Senior Reservations Desk"}
              </p>
            </div>
          </div>
        </div>

        {/* Proposed Itinerary Section */}
        <div className="py-8 border-b border-[#E9E1D5] space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6a7d61] block mb-1">
              RECOMMENDED ITINERARY
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#173D32]">
              {matchedPackage ? matchedPackage.title : `${enquiry.destination} Curated Circuit`}
            </h3>
            {matchedPackage && (
              <p className="text-xs text-[#252925]/75 mt-1 leading-relaxed font-light">
                {matchedPackage.description}
              </p>
            )}
          </div>

          {/* Day Milestones */}
          {matchedPackage?.itineraryDays && (
            <div className="space-y-3 pt-2">
              {matchedPackage.itineraryDays.map((day) => (
                <div key={day.id} className="flex items-start gap-4 text-xs">
                  <span className="w-7 h-7 rounded-full bg-[#173D32]/10 text-[#173D32] font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">
                    D{day.dayNumber}
                  </span>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#173D32]">{day.title}</h4>
                    <p className="text-[11px] text-[#252925]/75 leading-relaxed font-light mt-0.5">
                      {day.description}
                    </p>
                    {day.stay && (
                      <span className="inline-block text-[10px] font-mono text-[#6a7d61] mt-1">
                        Overnight: {day.stay} · Meals: {day.meals || "Breakfast"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commercial Tariff Schedule */}
        <div className="py-8 border-b border-[#E9E1D5] space-y-4">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#6a7d61] block">
            COMMERCIAL TARIFF SCHEDULE
          </span>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E9E1D5] text-[#6a7d61] font-mono text-[10px]">
                  <th className="py-2">DESCRIPTION</th>
                  <th className="py-2 text-center">BASIS</th>
                  <th className="py-2 text-right">TARIFF (INR)</th>
                  <th className="py-2 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E1D5]/60">
                <tr>
                  <td className="py-3">
                    <strong className="text-[#173D32] block">
                      {matchedPackage ? matchedPackage.title : `${enquiry.destination} Custom Tour`}
                    </strong>
                    <span className="text-[10px] text-[#6a7d61]">
                      Includes boutique accommodations, private chauffeur AC sedan, fuel, permits & tolls
                    </span>
                  </td>
                  <td className="py-3 text-center text-xs font-mono">{adults} Guests (Twin-Sharing)</td>
                  <td className="py-3 text-right font-mono">₹{pricePerPerson.toLocaleString("en-IN")}</td>
                  <td className="py-3 text-right font-mono font-semibold">₹{baseTotal.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 text-right text-xs text-[#6a7d61]">
                    Subtotal Base Tariff:
                  </td>
                  <td className="py-2 text-right font-mono font-semibold">
                    ₹{baseTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 text-right text-xs text-[#6a7d61]">
                    Goods & Services Tax (GST 5% as per Indian Tourism Tariff Act):
                  </td>
                  <td className="py-2 text-right font-mono">
                    ₹{gstAmount.toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr className="border-t-2 border-[#173D32]">
                  <td colSpan={3} className="py-3 text-right font-serif font-bold text-base text-[#173D32]">
                    Total Inclusive Amount:
                  </td>
                  <td className="py-3 text-right font-serif font-bold text-lg text-[#173D32]">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Inclusions & Booking Formalities */}
        <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-[#252925]/80 font-light border-b border-[#E9E1D5]">
          <div>
            <h4 className="font-serif font-bold text-[#173D32] mb-3">Key Inclusions:</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Private dedicated AC Sedan with verified local chauffeur for all transfers.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Daily continental / traditional breakfast at all boutique estates.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>All highway toll taxes, parking permits, and driver allowances.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                <span>Dedicated 24/7 concierge assistance throughout travel.</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-bold text-[#173D32] mb-3">Confirmation & Remittance:</h4>
            <p className="text-[11px] leading-relaxed">
              To confirm this reservation, a 30% advance deposit is required. Balance is payable 15 days prior to arrival. Bank transfers accepted via NEFT/RTGS/UPI.
            </p>
            <div className="mt-3 p-3 rounded-xl bg-[#FAF9F6] border border-[#E9E1D5] text-[10px] font-mono text-[#6a7d61]">
              BANK: HDFC BANK LTD · AROHA TRAVELS PVT LTD<br />
              ACCOUNT: 50200089123456 · IFSC: HDFC0000484
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-6 text-center text-[10px] text-[#6a7d61] font-mono">
          <p>
            AROHA TRAVELS · KERALA ACCREDITATION REG: KL-TOUR-8942 · DPDP ACT 2023 COMPLIANT
          </p>
          <p className="mt-0.5">
            Thank you for choosing Aroha Travels. We look forward to welcoming you to South India.
          </p>
        </div>
      </div>
    </div>
  );
}

