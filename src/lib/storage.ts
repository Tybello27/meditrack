import type { AppData, Settings } from "../types";
import { buildSeed } from "./seed";

export const STORAGE_KEY = "meditrack.data.v1";

export const DEFAULT_SETTINGS: Settings = {
  userName: "Michael",
  theme: "light",
  notifications: false,
  sound: true,
  reminderLead: 10,
  compactCards: false,
  hideIosBanner: false,
};

function prefersDark(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = buildSeed();
      seeded.settings.theme = prefersDark() ? "dark" : "light";
      saveData(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      version: 1,
      meds: Array.isArray(parsed.meds) ? parsed.meds : [],
      logs: parsed.logs && typeof parsed.logs === "object" ? parsed.logs : {},
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    const seeded = buildSeed();
    return seeded;
  }
}

export function saveData(data: AppData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage may be unavailable (private mode) */
  }
}

export function clearData() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now()
    .toString(36)
    .slice(-4)}`;
}
