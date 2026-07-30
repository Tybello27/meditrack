import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Medication } from "../types";
import { useStore } from "../store/store";
import {
  MONTHS,
  WEEKDAYS_MIN,
  addDays,
  formatDateFull,
  fromKey,
  monthMatrix,
  relativeDayLabel,
  todayKey,
  weekDays,
} from "../lib/date";
import { dosesForDate, statsForDays, tallyDay } from "../lib/schedule";
import { SLOTS, SLOT_META } from "../lib/palette";
import { Icon } from "../components/Icon";
import { DoseRow } from "../components/MedCard";
import { PageHeader } from "../components/PageHeader";
import { EmptyState, ProgressRing, Segmented } from "../components/ui";
import { cn } from "../utils/cn";

type View = "day" | "week" | "month";

export function ScheduleScreen({ onOpenMed }: { onOpenMed: (med: Medication) => void }) {
  const { meds, logs, now, logDose, pushToast } = useStore();
  const [view, setView] = useState<View>("month");
  const [selected, setSelected] = useState<string>(todayKey());
  const [cursor, setCursor] = useState<Date>(() => fromKey(todayKey()));

  const cells = useMemo(
    () => monthMatrix(cursor.getFullYear(), cursor.getMonth()),
    [cursor]
  );
  const week = useMemo(() => weekDays(selected), [selected]);
  const dayStrip = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(selected, i - 3)),
    [selected]
  );

  const doses = useMemo(
    () => dosesForDate(meds, logs, selected, now),
    [meds, logs, selected, now]
  );
  const monthDays = useMemo(() => cells.filter(Boolean) as string[], [cells]);
  const monthStats = useMemo(
    () => statsForDays(meds, logs, monthDays, now),
    [meds, logs, monthDays, now]
  );
  const weekStats = useMemo(() => statsForDays(meds, logs, week, now), [meds, logs, week, now]);

  const shiftMonth = (delta: number) => {
    const next = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1);
    setCursor(next);
  };

  const stats = view === "week" ? weekStats : monthStats;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Medication planner"
        title="Schedule"
        right={
          <button
            type="button"
            onClick={() => {
              setSelected(todayKey());
              setCursor(fromKey(todayKey()));
            }}
            className="flex h-10 items-center gap-1.5 rounded-2xl border border-line bg-surface px-3 text-xs font-bold text-ink-2 shadow-[var(--shadow-soft)]"
          >
            <Icon name="calendar" size={15} /> Today
          </button>
        }
      />

      <Segmented
        value={view}
        onChange={setView}
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
      />

      <AnimatePresence mode="wait">
        {view === "month" ? (
          <motion.section
            key="month"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-3xl border border-line bg-surface p-4 shadow-[var(--shadow-card)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => shiftMonth(-1)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-surface-3 text-ink-2"
              >
                <Icon name="chevronLeft" size={16} strokeWidth={2.3} />
              </button>
              <p className="text-sm font-extrabold text-ink">
                {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
              </p>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => shiftMonth(1)}
                className="grid h-9 w-9 place-items-center rounded-xl bg-surface-3 text-ink-2"
              >
                <Icon name="chevronRight" size={16} strokeWidth={2.3} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS_MIN.map((d, i) => (
                <span
                  key={`${d}-${i}`}
                  className="py-1 text-center text-[10px] font-bold uppercase text-ink-3"
                >
                  {d}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, i) => {
                if (!cell) return <span key={`empty-${i}`} />;
                const tally = tallyDay(meds, logs, cell, now);
                const isSelected = cell === selected;
                const isToday = cell === todayKey();
                const dotColor =
                  tally.total === 0
                    ? "transparent"
                    : tally.missed > 0
                      ? "#F43F5E"
                      : tally.settled === 0
                        ? "#94A3B8"
                        : tally.taken === tally.total
                          ? "#10B981"
                          : "#F59E0B";
                return (
                  <button
                    key={cell}
                    type="button"
                    onClick={() => setSelected(cell)}
                    className={cn(
                      "relative flex aspect-square flex-col items-center justify-center rounded-2xl text-[13px] font-semibold transition",
                      isSelected
                        ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_10px_20px_-12px_rgba(59,130,246,1)]"
                        : isToday
                          ? "bg-blue-500/10 text-brand"
                          : "text-ink-2 hover:bg-surface-3"
                    )}
                  >
                    {fromKey(cell).getDate()}
                    <span
                      className="mt-1 h-1.5 w-1.5 rounded-full"
                      style={{
                        background: isSelected ? "rgba(255,255,255,.9)" : dotColor,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </motion.section>
        ) : view === "week" ? (
          <motion.section
            key="week"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-3xl border border-line bg-surface p-4 shadow-[var(--shadow-card)]"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelected(addDays(selected, -7))}
                className="grid h-9 w-9 place-items-center rounded-xl bg-surface-3 text-ink-2"
                aria-label="Previous week"
              >
                <Icon name="chevronLeft" size={16} strokeWidth={2.3} />
              </button>
              <p className="text-sm font-extrabold text-ink">Week of {relativeDayLabel(week[0])}</p>
              <button
                type="button"
                onClick={() => setSelected(addDays(selected, 7))}
                className="grid h-9 w-9 place-items-center rounded-xl bg-surface-3 text-ink-2"
                aria-label="Next week"
              >
                <Icon name="chevronRight" size={16} strokeWidth={2.3} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {week.map((day) => {
                const tally = tallyDay(meds, logs, day, now);
                const pct = tally.total ? Math.round((tally.taken / tally.total) * 100) : 0;
                const isSelected = day === selected;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelected(day)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 transition",
                      isSelected ? "bg-blue-500/10" : "hover:bg-surface-3"
                    )}
                  >
                    <span className="text-[10px] font-bold uppercase text-ink-3">
                      {WEEKDAYS_MIN[fromKey(day).getDay()]}
                    </span>
                    <ProgressRing
                      value={pct}
                      size={38}
                      stroke={4}
                      delay={0}
                      from={tally.missed ? "#F43F5E" : "#3B82F6"}
                      to={tally.missed ? "#F59E0B" : "#10B981"}
                    >
                      <span
                        className={cn(
                          "text-[11px] font-bold",
                          isSelected ? "text-brand" : "text-ink"
                        )}
                      >
                        {fromKey(day).getDate()}
                      </span>
                    </ProgressRing>
                    <span className="text-[9px] font-semibold text-ink-3">
                      {tally.taken}/{tally.total}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="day"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1"
          >
            {dayStrip.map((day) => {
              const tally = tallyDay(meds, logs, day, now);
              const isSelected = day === selected;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelected(day)}
                  className={cn(
                    "flex min-w-[62px] shrink-0 flex-col items-center gap-1 rounded-2xl border px-3 py-2.5 transition",
                    isSelected
                      ? "border-transparent bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_12px_22px_-14px_rgba(59,130,246,1)]"
                      : "border-line bg-surface text-ink-2"
                  )}
                >
                  <span className="text-[10px] font-bold uppercase opacity-80">
                    {WEEKDAYS_MIN[fromKey(day).getDay()]}
                  </span>
                  <span className={cn("text-lg font-extrabold", isSelected ? "text-white" : "text-ink")}>
                    {fromKey(day).getDate()}
                  </span>
                  <span className="text-[9px] font-semibold opacity-80">
                    {tally.taken}/{tally.total || 0}
                  </span>
                </button>
              );
            })}
          </motion.section>
        )}
      </AnimatePresence>

      {view !== "day" ? (
        <div className="grid grid-cols-3 gap-2.5">
          <StatBox label={view === "week" ? "Week adherence" : "Month adherence"} value={`${stats.adherence}%`} tone="blue" icon="target" />
          <StatBox label="Doses taken" value={`${stats.taken}`} tone="mint" icon="checkCircle" />
          <StatBox label="Perfect days" value={`${stats.perfectDays}`} tone="lav" icon="sparkles" />
        </div>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <h2 className="text-[15px] font-bold text-ink">{relativeDayLabel(selected)}</h2>
            <p className="text-[11px] text-ink-3">{formatDateFull(selected)}</p>
          </div>
          <span className="rounded-full bg-surface-3 px-2.5 py-1 text-[11px] font-bold text-ink-2">
            {doses.filter((d) => d.status === "taken").length}/{doses.length} taken
          </span>
        </div>

        {doses.length === 0 ? (
          <div className="rounded-3xl border border-line bg-surface">
            <EmptyState
              variant="calendar"
              title="No doses scheduled"
              body="Pick another date on the calendar or add a medication to plan this day."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {SLOTS.map((slot) => {
              const slotDoses = doses.filter((d) => d.slot === slot);
              if (!slotDoses.length) return null;
              return (
                <div key={slot}>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <span className="text-base">{SLOT_META[slot].emoji}</span>
                    <p className="text-[13px] font-bold text-ink">{SLOT_META[slot].label}</p>
                    <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-bold text-ink-3">
                      {slotDoses.length}
                    </span>
                  </div>
                  {slotDoses.map((dose, i) => (
                    <DoseRow
                      key={dose.key}
                      dose={dose}
                      index={i}
                      showLine={i < slotDoses.length - 1}
                      onOpen={() => onOpenMed(dose.med)}
                      onAction={
                        dose.at <= now + 12 * 3600_000
                          ? (status) => {
                              logDose(dose.med.id, dose.date, dose.time, status);
                              pushToast({
                                title: `${dose.med.name} ${status === "taken" ? "taken" : status}`,
                                tone: status === "taken" ? "success" : "default",
                              });
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatBox({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "blue" | "mint" | "lav";
  icon: "target" | "checkCircle" | "sparkles";
}) {
  const tones = {
    blue: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    mint: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    lav: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
  };
  return (
    <div className="rounded-3xl border border-line bg-surface p-3 shadow-[var(--shadow-card)]">
      <span className={cn("mb-2 grid h-8 w-8 place-items-center rounded-xl", tones[tone])}>
        <Icon name={icon} size={15} />
      </span>
      <p className="text-lg font-extrabold leading-none text-ink">{value}</p>
      <p className="mt-1 text-[10px] font-semibold text-ink-3">{label}</p>
    </div>
  );
}
