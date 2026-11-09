import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PublicEnquirySchema } from "@/lib/validation";
import { processEnquiryWithAI } from "@/lib/ai";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { safeErrorResponse } from "@/lib/security";
import { EnquiryStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. Rate Limiting: Max 5 submissions per 10 minutes per IP address
    const rateLimit = checkRateLimit(ip, "public_enquiry", 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many enquiry submissions from your network. Please wait ${rateLimit.resetSeconds} seconds before submitting again.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSeconds),
          },
        }
      );
    }

    const body = await req.json();

    // 2. Input Sanitization against XSS and script injection
    const sanitizedBody = {
      ...body,
      customerName: sanitizeText(body?.customerName || ""),
      destination: sanitizeText(body?.destination || ""),
      specialRequirements: body?.specialRequirements ? sanitizeText(body.specialRequirements) : null,
      originalMessage: sanitizeText(body?.originalMessage || ""),
      phone: sanitizeText(body?.phone || ""),
      email: sanitizeText(body?.email || "").toLowerCase(),
    };

    // 3. Zod Schema Validation
    const validation = PublicEnquirySchema.safeParse(sanitizedBody);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed. Please verify the submitted details.",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 4. Generate unique enquiry number
    const count = await prisma.enquiry.count();
    const year = new Date().getFullYear();
    const enquiryNumber = `ENQ-${year}-${String(count + 1).padStart(3, "0")}`;

    // 5. Save Enquiry in PostgreSQL
    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        destination: data.destination,
        travelStartDate: data.travelStartDate ? new Date(data.travelStartDate) : null,
        travelEndDate: data.travelEndDate ? new Date(data.travelEndDate) : null,
        duration: data.duration ? sanitizeText(data.duration) : null,
        adults: data.adults,
        children: data.children,
        budget: data.budget || null,
        specialRequirements: data.specialRequirements || null,
        originalMessage: data.originalMessage,
        preferredContactMethod: data.preferredContactMethod,
        whatsappConsent: data.whatsappConsent,
        status: EnquiryStatus.NEW,
        priority: (data.budget && data.budget >= 100000) ? "HIGH" : "MEDIUM",
      },
    });

    // 6. Trigger AI Assistant extraction and recommendation engine
    try {
      const aiResult = await processEnquiryWithAI(data.customerName, data.originalMessage);
      
      await prisma.aIExtraction.create({
        data: {
          enquiryId: enquiry.id,
          extractedData: aiResult.extractedData as any,
          confidence: aiResult.confidence,
          recommendations: aiResult.recommendations as any,
          replyDraft: aiResult.replyDraft,
          approved: false,
          provider: aiResult.provider,
        },
      });
    } catch (aiErr) {
      console.error("[SECURITY LOG - AI EXTRACTION NON-FATAL ERROR]:", aiErr);
    }

    // 7. Log activity
    await prisma.activityLog.create({
      data: {
        action: "ENQUIRY_RECEIVED",
        entityType: "ENQUIRY",
        entityId: enquiry.enquiryNumber,
        details: `Public enquiry from ${data.customerName} for ${data.destination} (${data.adults} adults) from IP ${ip}.`,
      },
    });

    // 8. Return response with acknowledgement template
    return NextResponse.json({
      success: true,
      enquiryNumber: enquiry.enquiryNumber,
      customerName: enquiry.customerName,
      destination: enquiry.destination,
      acknowledgement: {
        title: "Enquiry Successfully Recorded",
        referenceNumber: enquiry.enquiryNumber,
        message: `Thank you, ${enquiry.customerName}. Your travel request has been logged in our reservations system. Our South India destination specialist will review resort availability and contact you via ${data.preferredContactMethod.toLowerCase()} within 2 to 4 business hours.`,
        disclaimer: "This acknowledgement confirms your request has been logged in our secure database. No external promotional dispatch has occurred.",
      },
    });
  } catch (error: unknown) {
    return safeErrorResponse(
      error,
      "An unexpected error occurred while saving your enquiry. Please try again or reach us at journeys@aroha-travels.com."
    );
  }
}
