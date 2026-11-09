import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE_NAME, hashPassword } from "@/lib/auth";
import { AdminLoginSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanitizeText } from "@/lib/sanitize";
import { UserRole } from "@prisma/client";

// Dummy hash for constant-time comparison when user not found (prevents timing side-channel attacks)
const DUMMY_HASH = "$2a$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUU1234567890";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. Rate Limiting: Max 5 attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(ip, "login", 5, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. For security, your IP has been throttled. Please try again in ${rateLimit.resetSeconds} seconds.`,
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
    const sanitizedEmail = sanitizeText(body?.email || "").toLowerCase();
    const rawPassword = body?.password || "";

    const validation = AdminLoginSchema.safeParse({
      email: sanitizedEmail,
      password: rawPassword,
    });

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email and password." },
        { status: 400 }
      );
    }

    // 2. Lookup staff user
    const user = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    // Constant-time check: run bcrypt compare even if user doesn't exist
    const hashToVerify = user?.passwordHash || DUMMY_HASH;
    const isPasswordValid = await verifyPassword(rawPassword, hashToVerify);

    // If user not found, not staff, or password invalid, return identical generic error
    if (!user || user.role !== UserRole.STAFF_ADMIN || !isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // 3. Sign secure JWT
    const token = signToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // 4. Log Security Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        userName: user.name,
        action: "STAFF_LOGIN_SUCCESS",
        entityType: "USER",
        entityId: user.id,
        details: `Successful staff authentication from IP ${ip}.`,
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

    // Set secure HTTP-only cookie
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
  } catch (error: unknown) {
    console.error("[AUTH ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected authentication error occurred." },
      { status: 500 }
    );
  }
}
