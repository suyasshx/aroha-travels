import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PublicEnquirySchema } from "@/lib/validation";
import { processEnquiryWithAI } from "@/lib/ai";
import { EnquiryStatus } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Validation
    const validation = PublicEnquirySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // 2. Generate unique enquiry number
    const count = await prisma.enquiry.count();
    const year = new Date().getFullYear();
    const enquiryNumber = `ENQ-${year}-${String(count + 1).padStart(3, "0")}`;

    // 3. Save Enquiry in PostgreSQL
    const enquiry = await prisma.enquiry.create({
      data: {
        enquiryNumber,
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        destination: data.destination,
        travelStartDate: data.travelStartDate ? new Date(data.travelStartDate) : null,
        travelEndDate: data.travelEndDate ? new Date(data.travelEndDate) : null,
        duration: data.duration || null,
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

    // 4. Trigger AI Assistant extraction and recommendation engine
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
      console.error("AI extraction error during enquiry creation:", aiErr);
      // Non-blocking: Enquiry is still safely persisted in DB
    }

    // 5. Log activity
    await prisma.activityLog.create({
      data: {
        action: "ENQUIRY_RECEIVED",
        entityType: "ENQUIRY",
        entityId: enquiry.enquiryNumber,
        details: `Public enquiry from ${data.customerName} for ${data.destination} (${data.adults} adults).`,
      },
    });

    // 6. Return response with acknowledgement template
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
  } catch (error: any) {
    console.error("Enquiry API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while saving your enquiry. Please try again or reach us at journeys@aroha-travels.com.",
      },
      { status: 500 }
    );
  }
}

