"use client";

import { useAppStore } from "@/store/app-store";
import { useDict } from "@/lib/i18n/context";
import { DropZone } from "@/components/drop-zone/DropZone";
import { FileList } from "@/components/file-list/FileList";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { usePaste } from "@/hooks/usePaste";

export function AppShell() {
  usePaste();
  const hasFiles = useAppStore((s) => s.files.length > 0);
  const dict = useDict();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      {/* Settings + Drop zone layout */}
      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <DropZone />
          <FileList />
        </div>
        <aside className="lg:self-start">
          <SettingsPanel />
        </aside>
      </div>

      {/* Privacy note — shown before any file is added */}
      {!hasFiles && (
        <p className="text-center text-xs text-text-tertiary">
          {dict.privacy.note}{" "}
          <span className="font-medium text-text-secondary">
            {dict.privacy.noteHighlight}
          </span>
        </p>
      )}
    </div>
  );
}
