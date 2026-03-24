"use client";

import { Container } from "./Container";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-primary/80 backdrop-blur-sm">
      <Container className="flex h-14 items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 font-semibold text-text-primary">
          <span className="flex size-7 items-center justify-center rounded-[var(--radius-sm)] bg-accent text-white">
            <Zap size={14} strokeWidth={2.5} />
          </span>
          <span className="text-sm tracking-tight">LionCompress</span>
        </a>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
