import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER || "clerk";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

function localMiddleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const isDashboard = hostname.startsWith("dashboard.");

  if (isDashboard && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isProtectedRoute(req)) {
    const token = req.cookies.get("lifygo_token")?.value;
    if (!token) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
}

const clerkMw = clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get("host") || "";
  const isDashboard = hostname.startsWith("dashboard.");

  if (isDashboard && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default function middleware(req: NextRequest, event: any) {
  if (AUTH_PROVIDER === "local") {
    return localMiddleware(req);
  }
  return clerkMw(req, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};