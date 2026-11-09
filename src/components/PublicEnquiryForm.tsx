"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PublicEnquirySchema } from "@/lib/validation";
import { CheckCircle2, Send, Loader2, Sparkles, Shield, AlertCircle } from "lucide-react";

interface PublicEnquiryFormProps {
  defaultDestination?: string;
  defaultPackageTitle?: string;
}

export default function PublicEnquiryForm({
  defaultDestination = "Kerala",
  defaultPackageTitle,
}: PublicEnquiryFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<any | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(PublicEnquirySchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      destination: defaultDestination,
      travelStartDate: "",
      travelEndDate: "",
      duration: "6 Days / 5 Nights",
      adults: 2,
      children: 0,
      budget: undefined,
      specialRequirements: defaultPackageTitle ? `Interested in: ${defaultPackageTitle}` : "",
      originalMessage: defaultPackageTitle
        ? `Hi, interested in booking the '${defaultPackageTitle}' package for 2 adults. Please share latest seasonal availability.`
        : "Looking to plan a curated holiday in South India. Please get in touch.",
      preferredContactMethod: "EMAIL" as const,
      whatsappConsent: false,
      dpdpConsent: true,
    },
  });

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        setServerError(result.error || "Failed to submit enquiry. Please check your inputs.");
      } else {
        setSubmissionSuccess(result);
        reset();
      }
    } catch (err: any) {
      setServerError("Network error. Please check your internet connection.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submissionSuccess) {
    return (
      <div className="bg-[#FAF9F6] border border-[#E9E1D5] rounded-3xl p-8 sm:p-10 shadow-sm text-center">
        <div className="w-16 h-16 bg-[#173D32]/10 text-[#173D32] rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="inline-block px-3.5 py-1 bg-[#173D32]/10 text-[#173D32] text-[10px] font-mono font-bold rounded-full tracking-[0.2em] uppercase mb-3">
          RESERVATION REQUEST REGISTERED
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32] mb-3">
          {submissionSuccess.acknowledgement.title}
        </h3>
        <div className="bg-[#FFFFFF] border border-[#E9E1D5] rounded-2xl p-5 my-6 inline-block text-left max-w-md w-full">
          <p className="text-[10px] text-[#6a7d61] font-mono font-semibold uppercase tracking-wider">
            OFFICIAL ENQUIRY DOSSIER REFERENCE
          </p>
          <p className="text-2xl font-mono font-bold text-[#173D32] tracking-wider mt-1">
            {submissionSuccess.acknowledgement.referenceNumber}
          </p>
          <div className="mt-3 pt-3 border-t border-[#E9E1D5]/60 text-xs text-[#252925]/80 space-y-1">
            <p><strong>Traveller Name:</strong> {submissionSuccess.customerName}</p>
            <p><strong>Circuits:</strong> {submissionSuccess.destination}</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#252925]/80 leading-relaxed max-w-lg mx-auto mb-6 font-light">
          {submissionSuccess.acknowledgement.message}
        </p>

        <div className="text-[11px] text-[#6a7d61] bg-[#FAF9F6] border border-[#E9E1D5] rounded-xl p-3.5 max-w-lg mx-auto mb-6">
          <Shield className="w-3.5 h-3.5 inline mr-1 text-[#173D32]" />
          {submissionSuccess.acknowledgement.disclaimer}
        </div>

        <button
          onClick={() => setSubmissionSuccess(null)}
          className="text-xs text-[#173D32] font-semibold underline underline-offset-4 hover:text-[#215143]"
        >
          Submit Another Expedition Request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-[#FAF9F6] border border-[#E9E1D5] rounded-3xl p-6 sm:p-10 shadow-sm space-y-6 text-[#252925]"
    >
      <div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#6a7d61] mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>BESPOKE SOUTH INDIA ITINERARY DESK</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
          Plan Your Handcrafted Journey
        </h3>
        <p className="text-xs text-[#252925]/70 mt-1 font-light leading-relaxed">
          Share your travel ideas below. Our destination specialists curate exact itineraries backed by real contracted resort rates.
        </p>
      </div>

      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Row 1: Name and Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("customerName")}
            type="text"
            placeholder="e.g. Rahul Sharma"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E9E1D5] bg-white text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
          {errors.customerName && (
            <p className="text-xs text-red-600 mt-1">{errors.customerName.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="e.g. rahul@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E9E1D5] bg-white text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email.message as string}</p>
          )}
        </div>
      </div>

      {/* Row 2: Phone and Preferred Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="e.g. +91 98201 12345"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E9E1D5] bg-white text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
          {errors.phone && (
            <p className="text-xs text-red-600 mt-1">{errors.phone.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
            Preferred Contact Method
          </label>
          <select
            {...register("preferredContactMethod")}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E9E1D5] bg-white text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          >
            <option value="EMAIL">Email Dispatch</option>
            <option value="PHONE">Direct Telephone Call</option>
            <option value="WHATSAPP">WhatsApp Dispatch</option>
          </select>
        </div>
      </div>

      {/* Row 3: Destination and Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
            Destination / Region <span className="text-red-500">*</span>
          </label>
          <input
            {...register("destination")}
            type="text"
            placeholder="e.g. Munnar, Alleppey, Wayanad"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E9E1D5] bg-white text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
          {errors.destination && (
            <p className="text-xs text-red-600 mt-1">{errors.destination.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
            Estimated Start Date
          </label>
          <input
            {...register("travelStartDate")}
            type="date"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E9E1D5] bg-white text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
            Estimated End Date
          </label>
          <input
            {...register("travelEndDate")}
            type="date"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E9E1D5] bg-white text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
        </div>
      </div>

      {/* Row 4: Pax & Budget */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
            Adults (12+ yrs) <span className="text-red-500">*</span>
          </label>
          <input
            {...register("adults")}
            type="number"
            min={1}
            max={30}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E9E1D5] bg-white text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
          {errors.adults && (
            <p className="text-xs text-red-600 mt-1">{errors.adults.message as string}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
            Children (0-11 yrs)
          </label>
          <input
            {...register("children")}
            type="number"
            min={0}
            max={20}
            className="w-full px-4 py-2.5 rounded-xl border border-[#E9E1D5] bg-white text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
            Budget (₹ INR)
          </label>
          <input
            {...register("budget")}
            type="number"
            step="1000"
            placeholder="e.g. 120000"
            className="w-full px-4 py-2.5 rounded-xl border border-[#E9E1D5] bg-white text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
          />
        </div>
      </div>

      {/* Row 5: Message & Special Requirements */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-[#6a7d61] mb-1.5">
          Travel Vision & Preferences <span className="text-red-500">*</span>
        </label>
        <textarea
          {...register("originalMessage")}
          rows={3}
          placeholder="e.g. 2 adults and 1 kid, Kerala 5-6 nights in December, budget around 1.2 lakh total, private houseboat a must."
          className="w-full px-4 py-3 rounded-xl border border-[#E9E1D5] bg-white text-xs sm:text-sm text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/20 focus:border-[#173D32]"
        />
        {errors.originalMessage && (
          <p className="text-xs text-red-600 mt-1">{errors.originalMessage.message as string}</p>
        )}
      </div>

      {/* Row 6: Consent Checkboxes */}
      <div className="space-y-3 pt-3 text-xs text-[#252925]/85 border-t border-[#E9E1D5]">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register("whatsappConsent")}
            type="checkbox"
            className="mt-0.5 rounded border-[#E9E1D5] text-[#173D32] focus:ring-[#173D32]"
          />
          <span>
            Optional: I consent to receive itinerary updates, PDF brochures, and quotes via WhatsApp.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            {...register("dpdpConsent")}
            type="checkbox"
            className="mt-0.5 rounded border-[#E9E1D5] text-[#173D32] focus:ring-[#173D32]"
          />
          <span>
            <strong className="text-[#173D32]">DPDP Act Consent:</strong> I agree that Aroha Travels may collect and securely process my contact details solely for answering this travel enquiry under India's Digital Personal Data Protection Act 2023. We never sell data or send unsolicited marketing. <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.dpdpConsent && (
          <p className="text-xs text-red-600">{errors.dpdpConsent.message as string}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] py-4 px-6 rounded-full font-semibold text-xs tracking-[0.18em] uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Your Travel Request...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Request Curated Itinerary & Rates</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-[#6a7d61] font-mono pt-1">
        <Shield className="w-3.5 h-3.5 text-[#173D32]" />
        <span>INSTANT DOSSIER REFERENCE PROVIDED UPON SUBMISSION</span>
      </div>
    </form>
  );
}
