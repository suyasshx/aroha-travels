import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/auth";
import { processEnquiryWithAI } from "@/lib/ai";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, props: RouteProps) {
  try {
    const session = await requireStaffAdmin();
    const { id } = await props.params;

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    // Run AI / fallback pipeline
    const aiResult = await processEnquiryWithAI(enquiry.customerName, enquiry.originalMessage);

    // Upsert AI extraction
    const updatedAi = await prisma.aIExtraction.upsert({
      where: { enquiryId: id },
      create: {
        enquiryId: id,
        extractedData: aiResult.extractedData as any,
        confidence: aiResult.confidence,
        recommendations: aiResult.recommendations as any,
        replyDraft: aiResult.replyDraft,
        approved: false,
        provider: aiResult.provider,
      },
      update: {
        extractedData: aiResult.extractedData as any,
        confidence: aiResult.confidence,
        recommendations: aiResult.recommendations as any,
        replyDraft: aiResult.replyDraft,
        approved: false,
        provider: aiResult.provider,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: "AI_EXTRACTION_REGENERATED",
        entityType: "ENQUIRY",
        entityId: enquiry.enquiryNumber,
        details: `Regenerated AI analysis using ${aiResult.provider}.`,
      },
    });

    return NextResponse.json({ success: true, aiExtraction: updatedAi });
  } catch (error: any) {
    console.error("Regenerate AI error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

