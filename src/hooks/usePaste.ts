"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export function usePaste() {
  const addFiles = useAppStore((s) => s.addFiles);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) addFiles(files);
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [addFiles]);
}
