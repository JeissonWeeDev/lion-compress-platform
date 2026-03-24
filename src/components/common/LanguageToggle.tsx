"use client";

import { useRouter } from "next/navigation";
import { useDict, useLocale } from "@/lib/i18n/context";
import { Button } from "@/components/ui/Button";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function LanguageToggle() {
  const router = useRouter();
  const dict = useDict();
  const locale = useLocale();

  const next = locale === "en" ? "es" : "en";

  const handleSwitch = () => {
    document.cookie = `locale=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={dict.language.switchLabel}
      onClick={handleSwitch}
      className="h-9 px-2.5 font-mono text-xs text-text-secondary hover:text-text-primary"
    >
      {dict.language.switchTo}
    </Button>
  );
}
