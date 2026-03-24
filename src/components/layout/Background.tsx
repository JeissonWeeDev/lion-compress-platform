"use client";

import dynamic from "next/dynamic";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const Orb = dynamic(() => import("@/components/ui/Orb"), { ssr: false });

export function Background() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Adapt background color to theme
  const bgColor = resolvedTheme === "dark" ? "#0a0a0a" : "#fafafa";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none opacity-40">
      <div className="absolute top-[-25%] left-[-10%] w-[120%] h-[120%] blur-3xl">
        <Orb
          hue={260} // Purple-ish to match LionMedia
          hoverIntensity={0.5}
          rotateOnHover={true}
          backgroundColor={bgColor}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
