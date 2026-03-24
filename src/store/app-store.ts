"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import {
  FileItem,
  CompressionSettings,
  FileStatus,
  DEFAULT_SETTINGS,
} from "@/types/compression";

interface AppStore {
  // State
  files: FileItem[];
  settings: CompressionSettings;
  isFirstVisit: boolean;

  // File actions
  addFiles: (newFiles: File[]) => string[];
  removeFile: (id: string) => void;
  clearAll: () => void;
  updateFile: (id: string, updates: Partial<FileItem>) => void;

  // Settings actions
  updateSettings: (updates: Partial<CompressionSettings>) => void;

  // UI actions
  markVisited: () => void;

  // Download helpers
  getCompletedFiles: () => FileItem[];
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      files: [],
      settings: DEFAULT_SETTINGS,
      isFirstVisit: true,

      addFiles: (newFiles) => {
        const existing = get().files;
        const ids: string[] = [];

        const items: FileItem[] = newFiles
          .filter((file) => {
            // Deduplicate by name + size
            const duplicate = existing.some(
              (f) => f.name === file.name && f.size === file.size
            );
            return !duplicate;
          })
          .map((file) => {
            const id = nanoid();
            ids.push(id);
            return {
              id,
              file,
              name: file.name,
              size: file.size,
              type: file.type.startsWith("video/") ? "video" : "image",
              mimeType: file.type,
              status: "queued" as FileStatus,
              progress: 0,
            };
          });

        set((state) => ({ files: [...state.files, ...items] }));
        return ids;
      },

      removeFile: (id) => {
        const file = get().files.find((f) => f.id === id);
        if (file?.thumbnail) URL.revokeObjectURL(file.thumbnail);
        if (file?.result?.blob) {
          // blob URL is managed externally, just cleanup
        }
        set((state) => ({ files: state.files.filter((f) => f.id !== id) }));
      },

      clearAll: () => {
        get().files.forEach((f) => {
          if (f.thumbnail) URL.revokeObjectURL(f.thumbnail);
        });
        set({ files: [] });
      },

      updateFile: (id, updates) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        }));
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      markVisited: () => set({ isFirstVisit: false }),

      getCompletedFiles: () =>
        get().files.filter((f) => f.status === "completed" && f.result),
    }),
    {
      name: "lionmedia-settings",
      // Only persist settings and UI prefs, never file data (privacy)
      partialize: (state) => ({
        settings: state.settings,
        isFirstVisit: state.isFirstVisit,
      }),
    }
  )
);
