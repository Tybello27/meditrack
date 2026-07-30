import type {
  DoseInstance,
  DoseLog,
  DoseStatus,
  Medication,
  Slot,
} from "../types";
import {
  addDays,
  diffDays,
  fromKey,
  minutesFromTime,
  timeToDate,
  todayKey,
} from "./date";

export const DUE_WINDOW_MS = 45 * 60 * 1000;
export const SOON_WINDOW_MS = 30 * 60 * 1000;

export function logKey(medId: string, date: string, time: string): string {
  return `${medId}|${date}|${time}`;
}

export function slotOf(time: string): Slot {
  const m = minutesFromTime(time);
  if (m >= 300 && m < 720) return "morning";
  if (m >= 720 && m < 1020) return "afternoon";
  if (m >= 1020 && m < 1260) return "evening";
  return "night";
}

export function isScheduledOn(med: Medication, dateKey: string): boolean {
  if (med.frequency === "asneeded") return false;
  if (dateKey < med.startDate) return false;
  if (med.endDate && dateKey > med.endDate) return false;
  if (med.frequency === "weekly") {
    return med.daysOfWeek.includes(fromKey(dateKey).getDay());
  }
  if (med.frequency === "alternate") {
    return Math.abs(diffDays(dateKey, med.startDate)) % 2 === 0;
  }
  return true;
}

export function resolveStatus(
  at: number,
  log: DoseLog | undefined,
  now: number
): DoseStatus {
  if (log) return log.status;
  if (at > now) return at - now <= SOON_WINDOW_MS ? "due" : "upcoming";
  return now - at <= DUE_WINDOW_MS ? "due" : "missed";
}

export function dosesForDate(
  meds: Medication[],
  logs: Record<string, DoseLog>,
  dateKey: string,
  now: number,
  includePaused = false
): DoseInstance[] {
  const list: DoseInstance[] = [];
  for (const med of meds) {
    if (med.paused && !includePaused) continue;
    if (!isScheduledOn(med, dateKey)) continue;
    for (const time of med.times) {
      const at = timeToDate(dateKey, time).getTime();
      const key = logKey(med.id, dateKey, time);
      list.push({
        key,
        med,
        date: dateKey,
        time,
        slot: slotOf(time),
        status: resolveStatus(at, logs[key], now),
        at,
      });
    }
  }
  return list.sort((a, b) => a.at - b.at);
}

export interface DayTally {
  date: string;
  taken: number;
  missed: number;
  skipped: number;
  pending: number;
  total: number;
  settled: number;
  pct: number;
}

export function tallyDay(
  meds: Medication[],
  logs: Record<string, DoseLog>,
  dateKey: string,
  now: number
): DayTally {
  const doses = dosesForDate(meds, logs, dateKey, now);
  let taken = 0;
  let missed = 0;
  let skipped = 0;
  let pending = 0;
  for (const dose of doses) {
    if (dose.status === "taken") taken += 1;
    else if (dose.status === "missed") missed += 1;
    else if (dose.status === "skipped") skipped += 1;
    else pending += 1;
  }
  const settled = taken + missed + skipped;
  return {
    date: dateKey,
    taken,
    missed,
    skipped,
    pending,
    total: doses.length,
    settled,
    pct: settled ? Math.round((taken / settled) * 100) : 0,
  };
}

export function rangeKeys(startKey: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addDays(startKey, i));
}

export interface RangeStats {
  taken: number;
  missed: number;
  skipped: number;
  pending: number;
  total: number;
  adherence: number;
  perfectDays: number;
  days: DayTally[];
}

export function statsForDays(
  meds: Medication[],
  logs: Record<string, DoseLog>,
  days: string[],
  now: number
): RangeStats {
  const tallies = days.map((d) => tallyDay(meds, logs, d, now));
  const acc = tallies.reduce(
    (a, t) => {
      a.taken += t.taken;
      a.missed += t.missed;
      a.skipped += t.skipped;
      a.pending += t.pending;
      a.total += t.total;
      if (t.total > 0 && t.taken === t.total) a.perfectDays += 1;
      return a;
    },
    { taken: 0, missed: 0, skipped: 0, pending: 0, total: 0, perfectDays: 0 }
  );
  const settled = acc.taken + acc.missed + acc.skipped;
  return {
    ...acc,
    adherence: settled ? Math.round((acc.taken / settled) * 100) : 0,
    days: tallies,
  };
}

export function currentStreak(
  meds: Medication[],
  logs: Record<string, DoseLog>,
  now: number
): number {
  let streak = 0;
  let cursor = todayKey();
  for (let i = 0; i < 400; i++) {
    const doses = dosesForDate(meds, logs, cursor, now);
    const settled = doses.filter((d) =>
      ["taken", "missed", "skipped"].includes(d.status)
    );
    if (settled.length === 0) {
      // nothing scheduled / nothing due yet — neutral day
      cursor = addDays(cursor, -1);
      if (i > 0 && doses.length === 0 && streak === 0) continue;
      continue;
    }
    const allTaken = settled.every((d) => d.status === "taken");
    if (!allTaken) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function bestStreak(
  meds: Medication[],
  logs: Record<string, DoseLog>,
  now: number,
  lookback = 120
): number {
  let best = 0;
  let run = 0;
  let cursor = addDays(todayKey(), -lookback);
  for (let i = 0; i <= lookback; i++) {
    const doses = dosesForDate(meds, logs, cursor, now);
    const settled = doses.filter((d) =>
      ["taken", "missed", "skipped"].includes(d.status)
    );
    if (settled.length) {
      if (settled.every((d) => d.status === "taken")) {
        run += 1;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
    }
    cursor = addDays(cursor, 1);
  }
  return best;
}

export function upcomingDoses(
  meds: Medication[],
  logs: Record<string, DoseLog>,
  now: number,
  limit = 6
): DoseInstance[] {
  const today = todayKey();
  const pool = [
    ...dosesForDate(meds, logs, today, now),
    ...dosesForDate(meds, logs, addDays(today, 1), now),
  ];
  return pool
    .filter((d) => (d.status === "upcoming" || d.status === "due" || d.status === "snoozed") && d.at >= now - DUE_WINDOW_MS)
    .sort((a, b) => a.at - b.at)
    .slice(0, limit);
}

export function nextDose(
  meds: Medication[],
  logs: Record<string, DoseLog>,
  now: number
): DoseInstance | null {
  return upcomingDoses(meds, logs, now, 1)[0] ?? null;
}

export function actionableDose(
  meds: Medication[],
  logs: Record<string, DoseLog>,
  now: number
): DoseInstance | null {
  const today = dosesForDate(meds, logs, todayKey(), now);
  const due = today.find((d) => d.status === "due" || d.status === "snoozed");
  if (due) return due;
  const missed = today.find((d) => d.status === "missed");
  if (missed) return missed;
  return today.find((d) => d.status === "upcoming") ?? null;
}

export function medAdherence(
  med: Medication,
  logs: Record<string, DoseLog>,
  days: string[],
  now: number
): { taken: number; settled: number; pct: number } {
  let taken = 0;
  let settled = 0;
  for (const day of days) {
    if (!isScheduledOn(med, day)) continue;
    for (const time of med.times) {
      const at = timeToDate(day, time).getTime();
      const status = resolveStatus(at, logs[logKey(med.id, day, time)], now);
      if (status === "taken") {
        taken += 1;
        settled += 1;
      } else if (status === "missed" || status === "skipped") {
        settled += 1;
      }
    }
  }
  return { taken, settled, pct: settled ? Math.round((taken / settled) * 100) : 0 };
}

export function nextTimeForMed(med: Medication, now: number): string | null {
  const today = todayKey();
  const sorted = [...med.times].sort();
  if (med.paused || med.frequency === "asneeded") return null;
  for (const t of sorted) {
    if (isScheduledOn(med, today) && timeToDate(today, t).getTime() > now) return t;
  }
  for (let i = 1; i <= 8; i++) {
    const day = addDays(today, i);
    if (isScheduledOn(med, day)) return sorted[0] ?? null;
  }
  return null;
}

export function refillState(med: Medication): "ok" | "low" | "empty" {
  if (med.refillRemaining <= 0) return "empty";
  if (med.refillRemaining <= med.refillThreshold) return "low";
  return "ok";
}

export function dosesPerDay(med: Medication): number {
  return med.times.length;
}
