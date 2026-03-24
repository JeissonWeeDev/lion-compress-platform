"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="size-10" />;

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-9 p-0"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
}
