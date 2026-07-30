import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Medication } from "../types";
import { useStore } from "../store/store";
import { PALETTES, SLOT_META, STATUS_META } from "../lib/palette";
import { FORM_LABELS } from "../lib/palette";
import { addDays, formatDateLong, formatTime, todayKey } from "../lib/date";
import { medAdherence, nextTimeForMed, refillState, slotOf } from "../lib/schedule";
import { cn } from "../utils/cn";
import { Icon } from "./Icon";
import { MedTile } from "./MedCard";
import { Button, ProgressRing, Sheet, Tag } from "./ui";

const FREQ_LABEL: Record<string, string> = {
  daily: "Every day",
  alternate: "Every other day",
  weekly: "Selected weekdays",
  asneeded: "As needed",
};

const MEAL_LABEL: Record<string, string> = {
  any: "Anytime",
  before: "Before meal",
  with: "With meal",
  after: "After meal",
};

export function MedDetailSheet({
  med,
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  med: Medication | null;
  open: boolean;
  onClose: () => void;
  onEdit: (med: Medication) => void;
  onDelete: (med: Medication) => void;
}) {
  const { logs, now, setPaused, refill, logDose, pushToast } = useStore();

  const week = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(todayKey(), -6 + i)),
    []
  );
  const month = useMemo(
    () => Array.from({ length: 30 }, (_, i) => addDays(todayKey(), -29 + i)),
    []
  );

  const stats = useMemo(
    () => (med ? medAdherence(med, logs, week, now) : null),
    [med, logs, week, now]
  );
  const monthStats = useMemo(
    () => (med ? medAdherence(med, logs, month, now) : null),
    [med, logs, month, now]
  );

  const history = useMemo(() => {
    if (!med) return [];
    return Object.values(logs)
      .filter((l) => l.medId === med.id)
      .sort((a, b) => (a.date === b.date ? b.time.localeCompare(a.time) : b.date.localeCompare(a.date)))
      .slice(0, 6);
  }, [logs, med]);

  if (!med) return null;

  const palette = PALETTES[med.color];
  const refillStatus = refillState(med);
  const refillPct = Math.min(
    100,
    Math.round((med.refillRemaining / Math.max(med.refillThreshold * 4, 1)) * 100)
  );
  const next = nextTimeForMed(med, now);

  return (
    <Sheet open={open} onClose={onClose} maxWidth="max-w-xl">
      <div className="space-y-4 pb-3">
        <div
          className="relative overflow-hidden rounded-3xl p-4 text-white"
          style={{
            background: `linear-gradient(135deg, ${palette.hex}, ${palette.hex}cc 55%, ${palette.hex}99)`,
          }}
        >
          <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/15 blur-xl" />
          <div className="relative flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
              <MedTile med={med} size={40} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-xl font-extrabold">{med.name}</h3>
              <p className="text-xs text-white/85">
                {med.dosage} · {med.strength} · {FORM_LABELS[med.form]}
              </p>
            </div>
            {med.paused ? (
              <span className="rounded-full bg-white/22 px-2.5 py-1 text-[11px] font-bold">
                Paused
              </span>
            ) : null}
          </div>
          <div className="relative mt-3 flex flex-wrap gap-1.5">
            <Pill icon="calendar">{FREQ_LABEL[med.frequency]}</Pill>
            <Pill icon="meal">{MEAL_LABEL[med.meal]}</Pill>
            <Pill icon="clock">
              {med.paused || !next ? "No upcoming dose" : `Next ${formatTime(next)}`}
            </Pill>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-3xl border border-line bg-surface-2 p-4">
          <ProgressRing value={stats?.pct ?? 0} size={104} stroke={10} from={palette.hex} to="#10B981">
            <div>
              <p className="text-xl font-extrabold text-ink">{stats?.pct ?? 0}%</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-3">7 days</p>
            </div>
          </ProgressRing>
          <div className="space-y-2">
            <MiniStat label="Doses taken (7d)" value={`${stats?.taken ?? 0}/${stats?.settled ?? 0}`} icon="checkCircle" tone="mint" />
            <MiniStat label="Adherence (30d)" value={`${monthStats?.pct ?? 0}%`} icon="activity" tone="blue" />
            <MiniStat label="Doses per day" value={`${med.times.length}`} icon="clock" tone="lav" />
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-4">
          <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-ink-3">
            Reminder schedule
          </p>
          <div className="flex flex-wrap gap-2">
            {med.times.length === 0 ? (
              <span className="text-sm text-ink-3">As needed — no fixed times</span>
            ) : (
              med.times.map((t) => {
                const slot = slotOf(t);
                return (
                  <div
                    key={t}
                    className="flex items-center gap-2 rounded-2xl border border-line bg-surface-3 px-3 py-2"
                  >
                    <span className="text-base">{SLOT_META[slot].emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-ink">{formatTime(t)}</p>
                      <p className="text-[10px] text-ink-3">{SLOT_META[slot].label}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-3">Refill status</p>
            {refillStatus === "empty" ? (
              <Tag tone="rose">Out of stock</Tag>
            ) : refillStatus === "low" ? (
              <Tag tone="amber">Running low</Tag>
            ) : (
              <Tag tone="mint">Well stocked</Tag>
            )}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-track">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(refillPct, 3)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "h-full rounded-full",
                  refillStatus === "ok"
                    ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                    : refillStatus === "low"
                      ? "bg-gradient-to-r from-amber-400 to-amber-500"
                      : "bg-gradient-to-r from-rose-400 to-rose-500"
                )}
              />
            </div>
            <span className="text-xs font-bold text-ink">{med.refillRemaining} left</span>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="soft"
              icon="package"
              onClick={() => {
                refill(med.id, 30);
                pushToast({ title: "Refill added", body: `+30 doses of ${med.name}`, tone: "success" });
              }}
            >
              Add 30 doses
            </Button>
            <Button
              size="sm"
              variant="soft"
              icon="plus"
              onClick={() => refill(med.id, 10)}
            >
              +10
            </Button>
          </div>
        </div>

        {(med.instructions || med.notes) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {med.instructions ? (
              <InfoCard icon="info" title="Instructions" body={med.instructions} tone="blue" />
            ) : null}
            {med.notes ? (
              <InfoCard icon="edit" title="Notes" body={med.notes} tone="lav" />
            ) : null}
          </div>
        )}

        <div className="rounded-3xl border border-line bg-surface p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-3">Recent log</p>
          {history.length === 0 ? (
            <p className="py-3 text-center text-xs text-ink-3">No doses logged yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {history.map((log) => {
                const meta = STATUS_META[log.status];
                return (
                  <li
                    key={log.id}
                    className="flex items-center gap-3 rounded-2xl bg-surface-3 px-3 py-2"
                  >
                    <span
                      className="grid h-7 w-7 place-items-center rounded-full"
                      style={{ background: `${meta.hex}22`, color: meta.hex }}
                    >
                      <Icon
                        name={
                          log.status === "taken"
                            ? "check"
                            : log.status === "missed"
                              ? "close"
                              : log.status === "snoozed"
                                ? "snooze"
                                : "undo"
                        }
                        size={13}
                        strokeWidth={2.6}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink">
                        {meta.label} · {formatTime(log.time)}
                      </p>
                      <p className="text-[10px] text-ink-3">{formatDateLong(log.date)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="mint"
            icon="check"
            onClick={() => {
              const time = med.times[0] ?? "08:00";
              logDose(med.id, todayKey(), time, "taken");
              pushToast({ title: `${med.name} marked as taken`, tone: "success" });
            }}
          >
            Mark taken
          </Button>
          <Button
            variant="soft"
            icon={med.paused ? "play" : "pause"}
            onClick={() => {
              setPaused(med.id, !med.paused);
              pushToast({
                title: med.paused ? `${med.name} resumed` : `${med.name} paused`,
                tone: med.paused ? "success" : "warn",
              });
            }}
          >
            {med.paused ? "Resume" : "Pause"}
          </Button>
          <Button variant="outline" icon="edit" onClick={() => onEdit(med)}>
            Edit details
          </Button>
          <Button variant="danger" icon="trash" onClick={() => onDelete(med)}>
            Delete
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

function Pill({ children, icon }: { children: React.ReactNode; icon: "calendar" | "meal" | "clock" }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
      <Icon name={icon} size={12} strokeWidth={2.2} />
      {children}
    </span>
  );
}

function MiniStat({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: "checkCircle" | "activity" | "clock";
  tone: "mint" | "blue" | "lav";
}) {
  const tones = {
    mint: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    lav: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  };
  return (
    <div className="flex items-center gap-2.5">
      <span className={cn("grid h-8 w-8 place-items-center rounded-xl", tones[tone])}>
        <Icon name={icon} size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-ink-3">{label}</p>
        <p className="text-sm font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  body,
  tone,
}: {
  icon: "info" | "edit";
  title: string;
  body: string;
  tone: "blue" | "lav";
}) {
  const tones = {
    blue: "bg-blue-500/8 text-blue-600 dark:text-blue-400",
    lav: "bg-violet-500/8 text-violet-600 dark:text-violet-400",
  };
  return (
    <div className="rounded-3xl border border-line bg-surface p-4">
      <p className={cn("mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold", tones[tone])}>
        <Icon name={icon} size={12} /> {title}
      </p>
      <p className="text-[13px] leading-relaxed text-ink-2">{body}</p>
    </div>
  );
}
