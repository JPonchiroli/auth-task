import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/services/auth/auth.constants";
import { readUnverifiedSessionToken } from "@/services/auth/session.edge";

export function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = readUnverifiedSessionToken(token);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/dashboard") && !session) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
