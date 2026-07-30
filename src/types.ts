export type Slot = "morning" | "afternoon" | "evening" | "night";

export type MedForm =
  | "tablet"
  | "capsule"
  | "liquid"
  | "injection"
  | "drops"
  | "inhaler";

export type ColorKey =
  | "blue"
  | "emerald"
  | "lavender"
  | "teal"
  | "amber"
  | "rose";

export type Frequency = "daily" | "alternate" | "weekly" | "asneeded";

export type MealPreference = "before" | "with" | "after" | "any";

export type DoseStatus =
  | "taken"
  | "missed"
  | "skipped"
  | "snoozed"
  | "upcoming"
  | "due";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  strength: string;
  form: MedForm;
  color: ColorKey;
  times: string[];
  frequency: Frequency;
  daysOfWeek: number[];
  meal: MealPreference;
  instructions: string;
  notes: string;
  refillRemaining: number;
  refillThreshold: number;
  startDate: string;
  endDate: string | null;
  paused: boolean;
  createdAt: number;
}

export interface DoseLog {
  id: string;
  medId: string;
  date: string;
  time: string;
  status: "taken" | "missed" | "skipped" | "snoozed";
  loggedAt: number;
}

export interface Settings {
  userName: string;
  theme: "light" | "dark";
  notifications: boolean;
  sound: boolean;
  reminderLead: number;
  compactCards: boolean;
  hideIosBanner: boolean;
}

export interface AppData {
  version: 1;
  meds: Medication[];
  logs: Record<string, DoseLog>;
  settings: Settings;
}

export interface DoseInstance {
  key: string;
  med: Medication;
  date: string;
  time: string;
  slot: Slot;
  status: DoseStatus;
  at: number;
}

export type ScreenId =
  | "home"
  | "meds"
  | "schedule"
  | "progress"
  | "settings"
  | "history";
