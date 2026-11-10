"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { Zap } from "lucide-react";
import { clsx } from "clsx";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={clsx(
        "sticky top-0 z-40 w-full transition-all duration-300",
        isScrolled 
          ? "border-b border-border bg-bg-primary/80 backdrop-blur-md py-0" 
          : "border-b border-transparent bg-transparent py-2"
      )}
    >
      <Container className="flex h-14 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-text-primary">
          <span className="flex size-7 items-center justify-center rounded-[var(--radius-sm)] bg-accent text-white shadow-sm">
            <Zap size={14} strokeWidth={2.5} />
          </span>
          <span className="text-sm tracking-tight">LionCompress</span>
        </Link>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  );
}
