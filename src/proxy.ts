import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const AUTH_ROUTES = ["/login", "/signup"];

// The manifest and generated PWA icons must be reachable with no session at all -- browsers
// (and OS install-prompt logic) fetch these before/without auth, and a redirect to /login
// instead of real manifest/icon bytes breaks installability outright.
const PUBLIC_ROUTES = ["/manifest.webmanifest", "/icon", "/apple-icon", "/icons/"];

// Next.js 16 renamed Middleware to Proxy (same mechanics, new file convention/export name).
// This only does optimistic redirects; RLS is still the real authorization boundary.
export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const path = request.nextUrl.pathname;
  if (PUBLIC_ROUTES.some((route) => path === route || path.startsWith(route))) {
    return supabaseResponse;
  }

  const isAuthRoute = AUTH_ROUTES.some((route) => path.startsWith(route));

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
