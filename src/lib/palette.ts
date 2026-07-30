import type { ColorKey, MedForm, Slot } from "../types";

export interface Palette {
  key: ColorKey;
  label: string;
  hex: string;
  soft: string;
  softDark: string;
  gradient: string;
  text: string;
  ring: string;
}

export const PALETTES: Record<ColorKey, Palette> = {
  blue: {
    key: "blue",
    label: "Medical Blue",
    hex: "#3B82F6",
    soft: "bg-blue-50",
    softDark: "dark:bg-blue-500/12",
    gradient: "from-blue-500 to-blue-600",
    text: "text-blue-600 dark:text-blue-400",
    ring: "ring-blue-500/25",
  },
  emerald: {
    key: "emerald",
    label: "Emerald Green",
    hex: "#10B981",
    soft: "bg-emerald-50",
    softDark: "dark:bg-emerald-500/12",
    gradient: "from-emerald-500 to-emerald-600",
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "ring-emerald-500/25",
  },
  lavender: {
    key: "lavender",
    label: "Soft Lavender",
    hex: "#8B5CF6",
    soft: "bg-violet-50",
    softDark: "dark:bg-violet-500/12",
    gradient: "from-violet-500 to-violet-600",
    text: "text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/25",
  },
  teal: {
    key: "teal",
    label: "Calm Teal",
    hex: "#14B8A6",
    soft: "bg-teal-50",
    softDark: "dark:bg-teal-500/12",
    gradient: "from-teal-500 to-teal-600",
    text: "text-teal-600 dark:text-teal-400",
    ring: "ring-teal-500/25",
  },
  amber: {
    key: "amber",
    label: "Warm Amber",
    hex: "#F59E0B",
    soft: "bg-amber-50",
    softDark: "dark:bg-amber-500/12",
    gradient: "from-amber-500 to-amber-600",
    text: "text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/25",
  },
  rose: {
    key: "rose",
    label: "Soft Rose",
    hex: "#F43F5E",
    soft: "bg-rose-50",
    softDark: "dark:bg-rose-500/12",
    gradient: "from-rose-500 to-rose-600",
    text: "text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/25",
  },
};

export const COLOR_KEYS = Object.keys(PALETTES) as ColorKey[];

export const FORM_LABELS: Record<MedForm, string> = {
  tablet: "Tablet",
  capsule: "Capsule",
  liquid: "Liquid",
  injection: "Injection",
  drops: "Drops",
  inhaler: "Inhaler",
};

export const SLOT_META: Record<
  Slot,
  { label: string; range: string; hex: string; emoji: string }
> = {
  morning: { label: "Morning", range: "5:00 – 11:59 AM", hex: "#F59E0B", emoji: "🌅" },
  afternoon: { label: "Afternoon", range: "12:00 – 4:59 PM", hex: "#3B82F6", emoji: "☀️" },
  evening: { label: "Evening", range: "5:00 – 8:59 PM", hex: "#8B5CF6", emoji: "🌆" },
  night: { label: "Night", range: "9:00 PM – 4:59 AM", hex: "#0EA5E9", emoji: "🌙" },
};

export const SLOTS: Slot[] = ["morning", "afternoon", "evening", "night"];

export const STATUS_META = {
  taken: { label: "Taken", hex: "#10B981", chip: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400" },
  missed: { label: "Missed", hex: "#F43F5E", chip: "bg-rose-500/12 text-rose-600 dark:text-rose-400" },
  skipped: { label: "Skipped", hex: "#94A3B8", chip: "bg-slate-500/12 text-slate-500 dark:text-slate-400" },
  snoozed: { label: "Snoozed", hex: "#F59E0B", chip: "bg-amber-500/12 text-amber-600 dark:text-amber-400" },
  upcoming: { label: "Upcoming", hex: "#3B82F6", chip: "bg-blue-500/12 text-blue-600 dark:text-blue-400" },
  due: { label: "Due now", hex: "#8B5CF6", chip: "bg-violet-500/14 text-violet-600 dark:text-violet-400" },
} as const;
