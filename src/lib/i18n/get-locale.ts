import { cookies } from "next/headers";
import { isValidLocale, DEFAULT_LOCALE, type Locale } from "./dictionaries";

export const LOCALE_COOKIE = "locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LOCALE_COOKIE)?.value;
  return value && isValidLocale(value) ? value : DEFAULT_LOCALE;
}
