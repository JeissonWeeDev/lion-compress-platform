"use client";

import { useAppStore } from "@/store/app-store";
import { DropZone } from "@/components/drop-zone/DropZone";
import { FileList } from "@/components/file-list/FileList";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { usePaste } from "@/hooks/usePaste";

export function AppShell() {
  usePaste();
  const hasFiles = useAppStore((s) => s.files.length > 0);

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
          Tus archivos se procesan exclusivamente en tu dispositivo.{" "}
          <span className="font-medium text-text-secondary">
            Nunca se suben a ningún servidor.
          </span>
        </p>
      )}
    </div>
  );
}
