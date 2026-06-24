"use client";

import Link from "next/link";
import { Container } from "./Container";
import { useDict } from "@/lib/i18n/context";

export function Footer() {
  const dict = useDict();

  return (
    <footer className="mt-auto border-t border-border py-6">
      <Container className="flex flex-col items-center justify-between gap-4 text-[11px] text-text-tertiary sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} {dict.footer.designedBy}. {dict.footer.privacy}
        </p>
        <div className="flex items-center gap-3 font-medium">
          <Link
            href="/privacy"
            className="transition-colors hover:text-text-primary"
          >
            {dict.footer.privacyLink}
          </Link>
          <span className="opacity-30" aria-hidden="true">•</span>
          <Link
            href="/terms"
            className="transition-colors hover:text-text-primary"
          >
            {dict.footer.termsLink}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
