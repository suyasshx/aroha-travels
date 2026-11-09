import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getLegacyRedirect } from "./lib/legacy-redirects";

const AUTH_COOKIE_NAME = "aroha_auth_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check legacy URL redirects (301 Permanent)
  const legacyTarget = getLegacyRedirect(pathname);
  if (legacyTarget) {
    return NextResponse.redirect(new URL(legacyTarget, request.url), 301);
  }

  // 2. Protect Admin web routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect Admin API endpoints (return 401 JSON if unauthorized)
  if (
    pathname.startsWith("/api/packages") ||
    pathname.startsWith("/api/enquiries/") // /api/enquiries/:id routes require auth; /api/enquiries is public
  ) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "UNAUTHORIZED: Authentication credentials required." },
        { status: 401 }
      );
    }
  }

  // 4. CSRF / Origin Validation for API Mutation Requests
  if (
    pathname.startsWith("/api/") &&
    (request.method === "POST" || request.method === "PUT" || request.method === "DELETE" || request.method === "PATCH")
  ) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { success: false, error: "FORBIDDEN: Cross-origin request rejected." },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: "FORBIDDEN: Malformed origin header." },
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    "/old-tours/:path*",
    "/tours/:path*",
  ],
};
