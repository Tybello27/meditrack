export const DAY_MS = 86_400_000;

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const WEEKDAYS_MIN = ["S", "M", "T", "W", "T", "F", "S"];
export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, amount: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + amount);
  return toKey(d);
}

export function diffDays(a: string, b: string): number {
  return Math.round((fromKey(a).getTime() - fromKey(b).getTime()) / DAY_MS);
}

export function startOfWeek(key: string): string {
  const d = fromKey(key);
  d.setDate(d.getDate() - d.getDay());
  return toKey(d);
}

export function weekDays(key: string): string[] {
  const start = startOfWeek(key);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthMatrix(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = first.getDay();
  const cells: (string | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(toKey(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function minutesFromTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function timeToDate(dateKey: string, time: string): Date {
  const d = fromKey(dateKey);
  const [h, m] = time.split(":").map(Number);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

export function formatTime(time: string): string {
  const [hRaw, mRaw] = time.split(":").map(Number);
  const h = hRaw ?? 0;
  const m = mRaw ?? 0;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}:00 ${suffix}` : `${hour}:${`${m}`.padStart(2, "0")} ${suffix}`;
}

export function formatTimeShort(time: string): string {
  const [hRaw, mRaw] = time.split(":").map(Number);
  const h = hRaw ?? 0;
  const m = mRaw ?? 0;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${`${m}`.padStart(2, "0")}${suffix}`;
}

export function formatDateLong(key: string): string {
  const d = fromKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

export function formatDateFull(key: string): string {
  const d = fromKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function relativeDayLabel(key: string): string {
  const today = todayKey();
  const delta = diffDays(key, today);
  if (delta === 0) return "Today";
  if (delta === 1) return "Tomorrow";
  if (delta === -1) return "Yesterday";
  return formatDateLong(key);
}

export function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

export function greeting(): { title: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 12) return { title: "Good Morning", emoji: "💊" };
  if (h < 17) return { title: "Good Afternoon", emoji: "💊" };
  if (h < 21) return { title: "Good Evening", emoji: "💊" };
  return { title: "Good Night", emoji: "💊" };
}

export function countdown(ms: number): string {
  if (ms <= 0) return "now";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `in ${mins} min`;
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (hours < 24) return rest ? `in ${hours}h ${rest}m` : `in ${hours}h`;
  const days = Math.round(hours / 24);
  return `in ${days}d`;
}
