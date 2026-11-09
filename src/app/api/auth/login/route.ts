import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { AdminLoginSchema } from "@/lib/validation";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = AdminLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email and password." },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find staff user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please verify your staff email and password." },
        { status: 401 }
      );
    }

    // Check staff role
    if (user.role !== UserRole.STAFF_ADMIN) {
      return NextResponse.json(
        { success: false, error: "Access denied. Only authorized staff members can enter the admin portal." },
        { status: 403 }
      );
    }

    // Verify password hash
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. Please verify your staff email and password." },
        { status: 401 }
      );
    }

    // Sign JWT
    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: "STAFF_LOGIN",
        entityType: "USER",
        entityId: user.id,
        details: `Staff member ${user.name} logged in successfully.`,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set secure httpOnly cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected server error occurred during authentication." },
      { status: 500 }
    );
  }
}

