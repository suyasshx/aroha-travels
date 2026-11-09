import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/auth";
import { EnquiryStatus } from "@prisma/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

// GET /api/enquiries/[id]
export async function GET(req: NextRequest, props: RouteProps) {
  try {
    await requireStaffAdmin();
    const { id } = await props.params;

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        aiExtraction: true,
        notes: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, enquiry });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}

// PATCH /api/enquiries/[id] - update status, assignment, or edit/approve AI extraction
export async function PATCH(req: NextRequest, props: RouteProps) {
  try {
    const session = await requireStaffAdmin();
    const { id } = await props.params;
    const body = await req.json();

    const existing = await prisma.enquiry.findUnique({
      where: { id },
      include: { aiExtraction: true },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    const {
      status,
      assignedTo,
      priority,
      aiExtractionApproved,
      editedExtractedData,
      editedReplyDraft,
    } = body;

    // Update enquiry fields
    const updatedEnquiry = await prisma.enquiry.update({
      where: { id },
      data: {
        status: status ? (status as EnquiryStatus) : undefined,
        assignedTo: assignedTo !== undefined ? assignedTo : undefined,
        priority: priority || undefined,
      },
    });

    // Update AI Extraction if edits or approval provided
    if (existing.aiExtraction && (aiExtractionApproved !== undefined || editedExtractedData || editedReplyDraft)) {
      await prisma.aIExtraction.update({
        where: { id: existing.aiExtraction.id },
        data: {
          approved: aiExtractionApproved !== undefined ? aiExtractionApproved : existing.aiExtraction.approved,
          extractedData: editedExtractedData || existing.aiExtraction.extractedData,
          replyDraft: editedReplyDraft || existing.aiExtraction.replyDraft,
        },
      });
    }

    // Log Activity
    if (status && status !== existing.status) {
      await prisma.activityLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          action: "ENQUIRY_STATUS_CHANGED",
          entityType: "ENQUIRY",
          entityId: existing.enquiryNumber,
          details: `Changed enquiry status from ${existing.status} to ${status}.`,
        },
      });
    }

    if (aiExtractionApproved && !existing.aiExtraction?.approved) {
      await prisma.activityLog.create({
        data: {
          userId: session.id,
          userName: session.name,
          action: "AI_EXTRACTION_APPROVED",
          entityType: "ENQUIRY",
          entityId: existing.enquiryNumber,
          details: `Staff member approved AI extraction and recommendations for ${existing.enquiryNumber}.`,
        },
      });
    }

    const result = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        aiExtraction: true,
        notes: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({ success: true, enquiry: result });
  } catch (error: any) {
    console.error("Enquiry PATCH error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

