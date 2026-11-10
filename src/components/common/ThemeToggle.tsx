"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDict } from "@/lib/i18n/context";

const subscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();
  const dict = useDict();

  // Avoid hydration mismatch with the server-rendered placeholder.
  if (!isClient) return <div className="size-10" />;

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={isDark ? dict.theme.toLight : dict.theme.toDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-9 p-0"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </Button>
  );
}
