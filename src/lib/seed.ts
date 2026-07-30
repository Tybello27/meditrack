import type { AppData, DoseLog, Medication, Settings } from "../types";
import { addDays, timeToDate, todayKey } from "./date";
import { isScheduledOn, logKey } from "./schedule";

const SEED_SETTINGS: Settings = {
  userName: "Michael",
  theme: "light",
  notifications: false,
  sound: true,
  reminderLead: 10,
  compactCards: false,
  hideIosBanner: false,
};

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function med(partial: Partial<Medication> & { name: string }): Medication {
  const today = todayKey();
  return {
    id: partial.id ?? `med_${partial.name.toLowerCase().replace(/\s+/g, "")}`,
    name: partial.name,
    dosage: partial.dosage ?? "1 tablet",
    strength: partial.strength ?? "500 mg",
    form: partial.form ?? "tablet",
    color: partial.color ?? "blue",
    times: partial.times ?? ["08:00"],
    frequency: partial.frequency ?? "daily",
    daysOfWeek: partial.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6],
    meal: partial.meal ?? "any",
    instructions: partial.instructions ?? "",
    notes: partial.notes ?? "",
    refillRemaining: partial.refillRemaining ?? 30,
    refillThreshold: partial.refillThreshold ?? 7,
    startDate: partial.startDate ?? addDays(today, -45),
    endDate: partial.endDate ?? null,
    paused: partial.paused ?? false,
    createdAt: partial.createdAt ?? Date.now(),
  };
}

export function seedMeds(): Medication[] {
  const today = todayKey();
  return [
    med({
      id: "med_aspirin",
      name: "Aspirin",
      dosage: "1 tablet",
      strength: "81 mg",
      form: "tablet",
      color: "blue",
      times: ["08:00"],
      meal: "after",
      instructions: "Swallow whole with a full glass of water.",
      notes: "Cardio protection — prescribed by Dr. Reyes.",
      refillRemaining: 26,
      refillThreshold: 8,
      startDate: addDays(today, -60),
    }),
    med({
      id: "med_atorvastatin",
      name: "Atorvastatin",
      dosage: "1 tablet",
      strength: "20 mg",
      form: "tablet",
      color: "emerald",
      times: ["10:00"],
      meal: "with",
      instructions: "Take with breakfast. Avoid grapefruit juice.",
      notes: "Cholesterol management.",
      refillRemaining: 14,
      refillThreshold: 10,
      startDate: addDays(today, -50),
    }),
    med({
      id: "med_metformin",
      name: "Metformin",
      dosage: "1 tablet",
      strength: "500 mg",
      form: "tablet",
      color: "lavender",
      times: ["14:00", "21:00"],
      meal: "with",
      instructions: "Take with meals to reduce stomach upset.",
      notes: "Blood sugar control.",
      refillRemaining: 42,
      refillThreshold: 12,
      startDate: addDays(today, -40),
    }),
    med({
      id: "med_levothyroxine",
      name: "Levothyroxine",
      dosage: "1 tablet",
      strength: "50 mcg",
      form: "tablet",
      color: "teal",
      times: ["07:00"],
      meal: "before",
      instructions: "Take 30 minutes before breakfast on an empty stomach.",
      notes: "Thyroid support.",
      refillRemaining: 5,
      refillThreshold: 7,
      startDate: addDays(today, -30),
    }),
    med({
      id: "med_vitamind",
      name: "Vitamin D3",
      dosage: "1 softgel",
      strength: "2000 IU",
      form: "capsule",
      color: "amber",
      times: ["09:00"],
      frequency: "weekly",
      daysOfWeek: [1, 3, 5],
      meal: "with",
      instructions: "Take with a fat-containing meal for absorption.",
      notes: "Supplement — Mon / Wed / Fri.",
      refillRemaining: 33,
      refillThreshold: 6,
      startDate: addDays(today, -35),
    }),
    med({
      id: "med_amoxicillin",
      name: "Amoxicillin",
      dosage: "1 capsule",
      strength: "500 mg",
      form: "capsule",
      color: "rose",
      times: ["08:00", "16:00", "22:00"],
      meal: "any",
      instructions: "Finish the entire course even if you feel better.",
      notes: "Paused after the course completed.",
      refillRemaining: 0,
      refillThreshold: 5,
      startDate: addDays(today, -22),
      endDate: addDays(today, -12),
      paused: true,
    }),
  ];
}

export function seedLogs(meds: Medication[]): Record<string, DoseLog> {
  const logs: Record<string, DoseLog> = {};
  const random = rng(20260421);
  const today = todayKey();
  const now = Date.now();

  for (let offset = -34; offset <= 0; offset++) {
    const date = addDays(today, offset);
    for (const m of meds) {
      if (!isScheduledOn(m, date)) continue;
      for (const time of m.times) {
        const at = timeToDate(date, time).getTime();
        if (at > now) continue;
        const roll = random();
        let status: DoseLog["status"] = "taken";
        if (offset === 0) {
          status = roll > 0.82 ? "missed" : "taken";
        } else if (roll > 0.955) {
          status = "missed";
        } else if (roll > 0.935) {
          status = "skipped";
        }
        const key = logKey(m.id, date, time);
        logs[key] = {
          id: key,
          medId: m.id,
          date,
          time,
          status,
          loggedAt: at + Math.round(random() * 12 * 60000),
        };
      }
    }
  }
  return logs;
}

export function buildSeed(): AppData {
  const meds = seedMeds();
  return {
    version: 1,
    meds,
    logs: seedLogs(meds),
    settings: { ...SEED_SETTINGS },
  };
}
