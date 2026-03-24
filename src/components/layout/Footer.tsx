"use client";

import { Container } from "./Container";
import { useDict } from "@/lib/i18n/context";

export function Footer() {
  const dict = useDict();

  return (
    <footer className="mt-auto border-t border-border py-6">
      <Container className="flex flex-col items-center justify-between gap-3 text-xs text-text-tertiary sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} Lion Labs. {dict.footer.privacy}
        </p>
        <p>{dict.footer.builtWith}</p>
      </Container>
    </footer>
  );
}
