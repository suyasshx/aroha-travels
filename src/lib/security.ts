import { NextRequest, NextResponse } from "next/server";

/**
 * Validates request Origin and Referer headers against Host to protect
 * against Cross-Site Request Forgery (CSRF) on state-modifying requests.
 */
export function validateSameOrigin(req: NextRequest): { valid: boolean; reason?: string } {
  // Safe read-only HTTP methods
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    return { valid: true };
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (!origin) {
    // If no origin header is present, check referer
    const referer = req.headers.get("referer");
    if (!referer) {
      // In same-site direct or server action calls, proceed if host matches
      return { valid: true };
    }
    try {
      const refererUrl = new URL(referer);
      if (host && refererUrl.host !== host) {
        return { valid: false, reason: "Cross-origin referer header mismatch" };
      }
      return { valid: true };
    } catch {
      return { valid: false, reason: "Malformed referer URL" };
    }
  }

  try {
    const originUrl = new URL(origin);
    if (host && originUrl.host !== host) {
      return { valid: false, reason: "Cross-origin request rejected: origin does not match host" };
    }
    return { valid: true };
  } catch {
    return { valid: false, reason: "Malformed origin header" };
  }
}

/**
 * Generates a safe API error response without exposing internal stack traces,
 * database schema details, or server system paths.
 */
export function safeErrorResponse(
  error: unknown,
  fallbackMessage = "An unexpected server error occurred. Please try again later.",
  statusCode = 500
): NextResponse {
  // Always log full detailed error on the server side
  console.error("[SECURITY LOG - SERVER ERROR]:", error);

  // Return sanitized generic message to client in production
  let clientMessage = fallbackMessage;
  if (error instanceof Error) {
    // If it's a known validation or permission error, pass safe message
    if (
      error.message.startsWith("UNAUTHORIZED") ||
      error.message.startsWith("FORBIDDEN") ||
      error.message.includes("Validation failed") ||
      error.message.includes("Invalid credentials")
    ) {
      clientMessage = error.message;
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: clientMessage,
    },
    { status: statusCode }
  );
}

