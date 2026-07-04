import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const ROLE_HOME = {
  CLIENT: "/app",
  LAWYER: "/lawyer",
  ADMIN: "/admin",
} as const;

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const role = req.auth?.user?.role;

  const isProtected =
    path.startsWith("/app") || path.startsWith("/lawyer") || path.startsWith("/admin");
  const isAuthPage = path === "/login" || path.startsWith("/register");

  if (!req.auth) {
    if (isProtected) {
      const loginUrl = new URL("/login", nextUrl);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const home = ROLE_HOME[role ?? "CLIENT"];

  // Signed-in users don't need the auth pages
  if (isAuthPage) {
    return NextResponse.redirect(new URL(home, nextUrl));
  }

  // Each area is restricted to its role; send strays to their own home
  if (path.startsWith("/app") && role !== "CLIENT") {
    return NextResponse.redirect(new URL(home, nextUrl));
  }
  if (path.startsWith("/lawyer") && role !== "LAWYER") {
    return NextResponse.redirect(new URL(home, nextUrl));
  }
  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(home, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/app/:path*", "/lawyer/:path*", "/admin/:path*", "/login", "/register/:path*", "/register"],
};
