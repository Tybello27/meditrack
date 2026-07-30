import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Medication, ScreenId } from "../types";
import { useStore } from "../store/store";
import { addDays, fromKey, todayKey, WEEKDAYS_MIN } from "../lib/date";
import {
  bestStreak,
  currentStreak,
  medAdherence,
  statsForDays,
  upcomingDoses,
} from "../lib/schedule";
import { PALETTES } from "../lib/palette";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { MedTile } from "../components/MedCard";
import { PageHeader } from "../components/PageHeader";
import {
  AnimatedNumber,
  Bars,
  EmptyState,
  ProgressRing,
  SectionHeader,
  Segmented,
} from "../components/ui";
import { cn } from "../utils/cn";

type Range = "week" | "month";

export function ProgressScreen({
  onOpenMed,
  onNavigate,
}: {
  onOpenMed: (med: Medication) => void;
  onNavigate: (id: ScreenId) => void;
}) {
  const { meds, logs, now } = useStore();
  const [range, setRange] = useState<Range>("week");

  const days = useMemo(() => {
    const count = range === "week" ? 7 : 30;
    return Array.from({ length: count }, (_, i) => addDays(todayKey(), -(count - 1) + i));
  }, [range]);

  const stats = useMemo(() => statsForDays(meds, logs, days, now), [meds, logs, days, now]);
  const streak = useMemo(() => currentStreak(meds, logs, now), [meds, logs, now]);
  const best = useMemo(() => bestStreak(meds, logs, now, 90), [meds, logs, now]);
  const upcoming = useMemo(() => upcomingDoses(meds, logs, now, 8), [meds, logs, now]);
  const activeMeds = meds.filter((m) => !m.paused);

  const chartData = useMemo(() => {
    if (range === "week") {
      return stats.days.map((d) => ({
        label: WEEKDAYS_MIN[fromKey(d.date).getDay()],
        value: d.settled ? Math.round((d.taken / d.settled) * 100) : 0,
        highlight: d.date === todayKey(),
      }));
    }
    const chunks: { label: string; value: number; highlight?: boolean }[] = [];
    for (let i = 0; i < stats.days.length; i += 5) {
      const slice = stats.days.slice(i, i + 5);
      const taken = slice.reduce((a, d) => a + d.taken, 0);
      const settled = slice.reduce((a, d) => a + d.settled, 0);
      chunks.push({
        label: `${fromKey(slice[0].date).getDate()}`,
        value: settled ? Math.round((taken / settled) * 100) : 0,
        highlight: i + 5 >= stats.days.length,
      });
    }
    return chunks;
  }, [stats.days, range]);

  const totalTaken = useMemo(
    () => Object.values(logs).filter((l) => l.status === "taken").length,
    [logs]
  );

  const badges = useMemo(
    () => [
      { id: "first", label: "First Dose", icon: "check" as IconName, unlocked: totalTaken >= 1, hint: "Log your first dose" },
      { id: "start", label: "3-Day Spark", icon: "flame" as IconName, unlocked: streak >= 3, hint: "3-day streak" },
      { id: "week", label: "Week Warrior", icon: "shield" as IconName, unlocked: streak >= 7, hint: "7-day streak" },
      { id: "perfect", label: "Perfect Week", icon: "sparkles" as IconName, unlocked: stats.perfectDays >= 7, hint: "7 perfect days" },
      { id: "century", label: "Century Club", icon: "trophy" as IconName, unlocked: totalTaken >= 100, hint: "100 doses taken" },
      { id: "master", label: "Month Master", icon: "target" as IconName, unlocked: streak >= 30, hint: "30-day streak" },
    ],
    [streak, stats.perfectDays, totalTaken]
  );

  if (meds.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="Insights" title="Progress" />
        <div className="rounded-3xl border border-line bg-surface">
          <EmptyState
            variant="history"
            title="No data to analyse yet"
            body="Add medications and log a few doses — your adherence charts and streaks will build up here."
            actionLabel="Add medication"
            onAction={() => onNavigate("meds")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Insights & analytics"
        title="Progress"
        right={
          <button
            type="button"
            onClick={() => onNavigate("history")}
            className="flex h-10 items-center gap-1.5 rounded-2xl border border-line bg-surface px-3 text-xs font-bold text-ink-2 shadow-[var(--shadow-soft)]"
          >
            <Icon name="history" size={15} /> History
          </button>
        }
      />

      <Segmented
        value={range}
        onChange={setRange}
        options={[
          { value: "week", label: "This week" },
          { value: "month", label: "This month" },
        ]}
      />

      <motion.section
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grain relative overflow-hidden rounded-[28px] border border-line bg-surface p-5 text-center shadow-[var(--shadow-card)]"
      >
        <ProgressRing value={stats.adherence} size={168} stroke={14} from="#3B82F6" to="#10B981">
          <div>
            <p className="text-[34px] font-extrabold leading-none text-ink">
              <AnimatedNumber value={stats.adherence} suffix="%" />
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3">
              adherence
            </p>
          </div>
        </ProgressRing>
        <p className="mt-3 text-sm font-bold text-ink">Consistency score</p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-ink-3">
          {stats.adherence >= 90
            ? "Outstanding routine — your body loves the predictability."
            : stats.adherence >= 70
              ? "Solid progress. A few reminders away from excellent."
              : "Let’s rebuild the rhythm — small steps count."}
        </p>
      </motion.section>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatCard icon="checkCircle" tone="mint" label="Completed doses" value={stats.taken} />
        <StatCard icon="xCircle" tone="rose" label="Missed doses" value={stats.missed} />
        <StatCard icon="pill" tone="blue" label="Active meds" value={activeMeds.length} />
        <StatCard icon="bell" tone="lav" label="Upcoming" value={upcoming.length} />
      </div>

      <section className="rounded-3xl border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[15px] font-bold text-ink">Consistency chart</p>
            <p className="text-[11px] text-ink-3">
              {range === "week" ? "Daily adherence, last 7 days" : "Adherence in 5-day blocks"}
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {stats.perfectDays} perfect days
          </span>
        </div>
        <Bars data={chartData} height={140} gradient={["#3B82F6", "#8B5CF6"]} />
      </section>

      <section className="grid gap-2.5 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-amber-500/12 to-rose-500/8 p-4">
          <div className="flex items-center gap-3">
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 text-white shadow-[0_14px_26px_-14px_rgba(244,63,94,.9)]"
            >
              <Icon name="flame" size={24} strokeWidth={1.9} />
            </motion.span>
            <div>
              <p className="text-2xl font-extrabold leading-none text-ink">
                <AnimatedNumber value={streak} /> day{streak === 1 ? "" : "s"}
              </p>
              <p className="text-[11px] font-semibold text-ink-3">Current streak</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-ink-2">
            Personal best: <b className="text-ink">{best} days</b> — keep every dose on time to beat it.
          </p>
        </div>

        <div className="rounded-3xl border border-line bg-surface p-4">
          <p className="mb-2 text-[13px] font-bold text-ink">Dose breakdown</p>
          <Breakdown label="Taken" value={stats.taken} total={stats.total} color="#10B981" />
          <Breakdown label="Missed" value={stats.missed} total={stats.total} color="#F43F5E" />
          <Breakdown label="Skipped" value={stats.skipped} total={stats.total} color="#94A3B8" />
          <Breakdown label="Pending" value={stats.pending} total={stats.total} color="#3B82F6" />
        </div>
      </section>

      <section>
        <SectionHeader title="Achievements" icon="trophy" />
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {badges.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-3xl border p-3 text-center",
                badge.unlocked
                  ? "border-transparent bg-gradient-to-b from-blue-500/12 to-violet-500/10"
                  : "border-dashed border-line-strong bg-surface-2"
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-2xl",
                  badge.unlocked
                    ? "bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-[0_12px_20px_-12px_rgba(99,102,241,.9)]"
                    : "bg-surface-3 text-ink-3"
                )}
              >
                <Icon name={badge.unlocked ? badge.icon : "lock"} size={18} strokeWidth={2} />
              </span>
              <p className="text-[10px] font-bold leading-tight text-ink">{badge.label}</p>
              <p className="text-[9px] leading-tight text-ink-3">{badge.hint}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Adherence by medication" icon="activity" />
        <div className="space-y-2">
          {meds.map((med) => {
            const value = medAdherence(med, logs, days, now);
            const palette = PALETTES[med.color];
            return (
              <button
                key={med.id}
                type="button"
                onClick={() => onOpenMed(med)}
                className="flex w-full items-center gap-3 rounded-3xl border border-line bg-surface p-3 text-left shadow-[var(--shadow-soft)]"
              >
                <MedTile med={med} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13px] font-bold text-ink">{med.name}</p>
                    <span className="text-[11px] font-bold text-ink-2">{value.pct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-track">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value.pct}%` }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: palette.hex }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-ink-3">
                    {value.taken} of {value.settled} doses taken
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: IconName;
  label: string;
  value: number;
  tone: "mint" | "rose" | "blue" | "lav";
}) {
  const tones = {
    mint: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    rose: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
    blue: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    lav: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-line bg-surface p-3.5 shadow-[var(--shadow-card)]"
    >
      <span className={cn("mb-2 grid h-9 w-9 place-items-center rounded-xl", tones[tone])}>
        <Icon name={icon} size={16} />
      </span>
      <p className="text-xl font-extrabold leading-none text-ink">
        <AnimatedNumber value={value} />
      </p>
      <p className="mt-1 text-[10px] font-semibold text-ink-3">{label}</p>
    </motion.div>
  );
}

function Breakdown({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="mb-2 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="font-semibold text-ink-2">{label}</span>
        <span className="font-bold text-ink">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-track">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}
