import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getLegacyRedirect } from "./lib/legacy-redirects";

const AUTH_COOKIE_NAME = "aroha_auth_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check legacy URL redirects
  const legacyTarget = getLegacyRedirect(pathname);
  if (legacyTarget) {
    return NextResponse.redirect(new URL(legacyTarget, request.url), 301);
  }

  // 2. Protect Admin routes (except login)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/old-tours/:path*",
    "/tours/:path*",
  ],
};
