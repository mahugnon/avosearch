import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { routing } from "@/i18n/routing";
import {
  getLocaleFromPath,
  localizedPath,
  stripLocalePrefix,
} from "@/lib/i18n";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createIntlMiddleware(routing);

const ROLE_HOME = {
  CLIENT: "/app",
  LAWYER: "/lawyer/missions",
  ADMIN: "/admin",
} as const;

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const locale = getLocaleFromPath(path);
  const barePath = stripLocalePrefix(path);
  const role = req.auth?.user?.role;

  const isProtected =
    barePath.startsWith("/app") ||
    barePath.startsWith("/lawyer") ||
    barePath.startsWith("/admin");
  const isAuthPage = barePath === "/login" || barePath.startsWith("/register");

  if (!req.auth) {
    if (isProtected) {
      const loginUrl = new URL(localizedPath("/login", locale), nextUrl);
      loginUrl.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(loginUrl);
    }
    return intlMiddleware(req);
  }

  const home = localizedPath(ROLE_HOME[role ?? "CLIENT"], locale);

  if (isAuthPage) {
    return NextResponse.redirect(new URL(home, nextUrl));
  }

  if (barePath.startsWith("/app") && role !== "CLIENT") {
    return NextResponse.redirect(new URL(home, nextUrl));
  }
  if (barePath.startsWith("/lawyer") && role !== "LAWYER") {
    return NextResponse.redirect(new URL(home, nextUrl));
  }
  if (barePath.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL(home, nextUrl));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
