import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isValidLocale, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/dictionaries";

const COOKIE_NAME = "locale";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function detectLocale(request: NextRequest): Locale {
  // 1. Existing cookie — user's explicit manual choice, highest priority
  const cookieValue = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieValue && isValidLocale(cookieValue)) {
    return cookieValue;
  }

  // 2. Accept-Language header — device/browser language preference
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  for (const part of acceptLanguage.split(",")) {
    const lang = part.split(";")[0].trim().split("-")[0].toLowerCase();
    if (isValidLocale(lang)) return lang as Locale;
  }

  // 3. Fallback to default
  return DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const locale = detectLocale(request);
  const existingCookie = request.cookies.get(COOKIE_NAME)?.value;

  // Only set cookie when it's missing or stale — avoids unnecessary Set-Cookie headers
  if (existingCookie === locale) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(COOKIE_NAME, locale, {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: false, // Client needs to read it for LanguageToggle
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
