import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaffAdmin } from "@/lib/auth";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, props: RouteProps) {
  try {
    const session = await requireStaffAdmin();
    const { id } = await props.params;
    const body = await req.json();

    const { note } = body;
    if (!note || note.trim().length === 0) {
      return NextResponse.json({ success: false, error: "Note cannot be empty." }, { status: 400 });
    }

    const createdNote = await prisma.enquiryNote.create({
      data: {
        enquiryId: id,
        userId: session.id,
        authorName: session.name,
        note: note.trim(),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: session.id,
        userName: session.name,
        action: "NOTE_ADDED",
        entityType: "ENQUIRY",
        entityId: id,
        details: `Added note: "${note.trim().slice(0, 50)}..."`,
      },
    });

    return NextResponse.json({ success: true, note: createdNote });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

