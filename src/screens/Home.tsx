import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Medication, ScreenId } from "../types";
import { useStore } from "../store/store";
import { useInstall } from "../hooks/useInstall";
import {
  actionableDose,
  currentStreak,
  dosesForDate,
  nextDose,
  refillState,
  tallyDay,
} from "../lib/schedule";
import { countdown, formatDateFull, formatTimeShort, greeting, todayKey } from "../lib/date";
import { SLOTS, SLOT_META } from "../lib/palette";
import { Icon } from "../components/Icon";
import { DoseRow, MedTile } from "../components/MedCard";
import {
  AnimatedNumber,
  Button,
  EmptyState,
  ProgressRing,
  SectionHeader,
} from "../components/ui";
import { EmbeddedNotice, InstallButton, IosInstallBanner } from "../components/PWA";
import { cn } from "../utils/cn";

export function HomeScreen({
  onOpenMed,
  onAdd,
  onNavigate,
  onOpenNotifications,
  notificationCount,
  install,
}: {
  onOpenMed: (med: Medication) => void;
  onAdd: () => void;
  onNavigate: (id: ScreenId) => void;
  onOpenNotifications: () => void;
  notificationCount: number;
  install: ReturnType<typeof useInstall>;
}) {
  const { meds, logs, now, settings, patchSettings, logDose, pushToast } = useStore();
  const today = todayKey();

  const doses = useMemo(() => dosesForDate(meds, logs, today, now), [meds, logs, today, now]);
  const tally = useMemo(() => tallyDay(meds, logs, today, now), [meds, logs, today, now]);
  const streak = useMemo(() => currentStreak(meds, logs, now), [meds, logs, now]);
  const next = useMemo(() => nextDose(meds, logs, now), [meds, logs, now]);
  const actionable = useMemo(() => actionableDose(meds, logs, now), [meds, logs, now]);
  const refills = meds.filter((m) => !m.paused && refillState(m) !== "ok");

  const completion = tally.total ? Math.round((tally.taken / tally.total) * 100) : 0;
  const g = greeting();

  const act = (status: "taken" | "snoozed" | "skipped") => {
    if (!actionable) {
      pushToast({ title: "No dose to update right now", tone: "warn" });
      return;
    }
    logDose(actionable.med.id, actionable.date, actionable.time, status);
    pushToast({
      title:
        status === "taken"
          ? `${actionable.med.name} taken 🎉`
          : status === "snoozed"
            ? `${actionable.med.name} snoozed`
            : `${actionable.med.name} skipped`,
      body: `${formatTimeShort(actionable.time)} dose updated`,
      tone: status === "taken" ? "success" : status === "snoozed" ? "warn" : "default",
    });
  };

  return (
    <div className="space-y-5">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-3"
      >
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
            {formatDateFull(today)}
          </p>
          <h1 className="mt-1 text-[27px] font-extrabold leading-tight text-ink">
            {g.title}{" "}
            {settings.userName ? (
              <span className="text-brand">{settings.userName}</span>
            ) : null}{" "}
            <span>{g.emoji}</span>
          </h1>
          <p className="mt-1 text-[13px] text-ink-2">Welcome back 💙 Here’s your care plan today.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 lg:hidden">
          <InstallButton install={install} />
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => patchSettings({ theme: settings.theme === "dark" ? "light" : "dark" })}
            className="grid h-10 w-10 place-items-center rounded-2xl border border-line bg-surface text-ink-2 shadow-[var(--shadow-soft)]"
          >
            <Icon name={settings.theme === "dark" ? "sun" : "moon"} size={18} />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="relative grid h-10 w-10 place-items-center rounded-2xl border border-line bg-surface text-ink-2 shadow-[var(--shadow-soft)]"
          >
            <Icon name="bell" size={18} />
            {notificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-[color:var(--canvas)]">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </button>
        </div>
      </motion.header>

      <EmbeddedNotice install={install} />
      <IosInstallBanner install={install} />

      {meds.length === 0 ? (
        <div className="rounded-3xl border border-line bg-surface shadow-[var(--shadow-card)]">
          <EmptyState
            variant="meds"
            title="No medications yet"
            body="Add your first medication to build a calm daily routine with gentle reminders."
            actionLabel="Add medication"
            onAction={onAdd}
          />
        </div>
      ) : (
        <>
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="grain relative overflow-hidden rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center gap-5">
              <ProgressRing value={completion} size={126} stroke={12}>
                <div>
                  <p className="text-[26px] font-extrabold leading-none text-ink">
                    <AnimatedNumber value={completion} suffix="%" />
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ink-3">
                    complete
                  </p>
                </div>
              </ProgressRing>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-3">
                  Today’s progress
                </p>
                <p className="mt-1 text-[15px] font-bold text-ink">
                  {tally.taken} of {tally.total} doses taken
                </p>
                <div className="mt-3 space-y-2">
                  <HeroStat
                    icon="checkCircle"
                    tone="mint"
                    label="Completed"
                    value={`${tally.taken} taken`}
                  />
                  <HeroStat
                    icon="alert"
                    tone="rose"
                    label="Missed"
                    value={`${tally.missed} missed`}
                  />
                  <HeroStat
                    icon="flame"
                    tone="amber"
                    label="Streak"
                    value={`${streak} day${streak === 1 ? "" : "s"}`}
                  />
                </div>
              </div>
            </div>

            {next ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface-3 p-3">
                <MedTile med={next.med} size={40} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">
                    Next reminder
                  </p>
                  <p className="truncate text-sm font-bold text-ink">
                    {next.med.name} · {formatTimeShort(next.time)}
                  </p>
                </div>
                <span className="rounded-full bg-blue-500/12 px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                  {countdown(next.at - now)}
                </span>
              </div>
            ) : (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/8 p-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-white">
                  <Icon name="check" size={18} strokeWidth={2.6} />
                </span>
                <p className="text-sm font-bold text-ink">All doses handled for today 🎉</p>
              </div>
            )}
          </motion.section>

          <section>
            <SectionHeader title="Quick actions" icon="bolt" />
            <div className="grid grid-cols-3 gap-2.5">
              <QuickTile
                icon="check"
                label="Take"
                tone="mint"
                sub={actionable ? formatTimeShort(actionable.time) : "—"}
                onClick={() => act("taken")}
              />
              <QuickTile
                icon="snooze"
                label="Snooze"
                tone="amber"
                sub="10 min"
                onClick={() => act("snoozed")}
              />
              <QuickTile
                icon="close"
                label="Skip"
                tone="slate"
                sub="This dose"
                onClick={() => act("skipped")}
              />
            </div>
          </section>

          <section>
            <SectionHeader
              title="Today’s medication schedule"
              icon="activity"
              action="History"
              onAction={() => onNavigate("history")}
            />
            {doses.length === 0 ? (
              <div className="rounded-3xl border border-line bg-surface">
                <EmptyState
                  variant="calendar"
                  title="Nothing scheduled today"
                  body="Enjoy the day off — your upcoming doses will appear here automatically."
                />
              </div>
            ) : (
              <div className="space-y-4">
                {SLOTS.map((slot) => {
                  const slotDoses = doses.filter((d) => d.slot === slot);
                  if (!slotDoses.length) return null;
                  const meta = SLOT_META[slot];
                  const takenCount = slotDoses.filter((d) => d.status === "taken").length;
                  return (
                    <div key={slot}>
                      <div className="mb-2 flex items-center gap-2 px-1">
                        <span className="text-base">{meta.emoji}</span>
                        <p className="text-[13px] font-bold text-ink">{meta.label}</p>
                        <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-bold text-ink-3">
                          {takenCount}/{slotDoses.length}
                        </span>
                        <span className="ml-auto text-[10px] font-medium text-ink-3">
                          {meta.range}
                        </span>
                      </div>
                      <AnimatePresence initial={false}>
                        {slotDoses.map((dose, i) => (
                          <DoseRow
                            key={dose.key}
                            dose={dose}
                            index={i}
                            showLine={i < slotDoses.length - 1}
                            onOpen={() => onOpenMed(dose.med)}
                            onAction={
                              dose.status === "due" ||
                              dose.status === "missed" ||
                              dose.status === "snoozed"
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
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {refills.length ? (
            <section>
              <SectionHeader title="Refill alerts" icon="package" action="Medications" onAction={() => onNavigate("meds")} />
              <div className="space-y-2">
                {refills.map((med) => (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => onOpenMed(med)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/8 p-3 text-left"
                  >
                    <MedTile med={med} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">{med.name}</p>
                      <p className="text-[11px] text-ink-2">
                        {med.refillRemaining <= 0
                          ? "Out of stock — time to refill"
                          : `${med.refillRemaining} doses left`}
                      </p>
                    </div>
                    <Icon name="chevronRight" size={16} className="text-ink-3" />
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          <Button variant="soft" full icon="plus" onClick={onAdd} className="lg:hidden">
            Add another medication
          </Button>
        </>
      )}
    </div>
  );
}

function HeroStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: "checkCircle" | "alert" | "flame";
  label: string;
  value: string;
  tone: "mint" | "rose" | "amber";
}) {
  const tones = {
    mint: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    rose: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
    amber: "bg-amber-500/14 text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="flex items-center gap-2">
      <span className={cn("grid h-7 w-7 place-items-center rounded-lg", tones[tone])}>
        <Icon name={icon} size={14} strokeWidth={2.2} />
      </span>
      <p className="text-[12px] text-ink-3">
        {label} · <span className="font-bold text-ink">{value}</span>
      </p>
    </div>
  );
}

function QuickTile({
  icon,
  label,
  sub,
  tone,
  onClick,
}: {
  icon: "check" | "snooze" | "close";
  label: string;
  sub: string;
  tone: "mint" | "amber" | "slate";
  onClick: () => void;
}) {
  const tones = {
    mint: "from-emerald-500/14 to-emerald-500/4 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    amber: "from-amber-500/14 to-amber-500/4 text-amber-600 dark:text-amber-400 border-amber-500/25",
    slate: "from-slate-500/12 to-slate-500/4 text-ink-2 border-line",
  };
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-3xl border bg-gradient-to-b px-2 py-4 shadow-[var(--shadow-soft)]",
        tones[tone]
      )}
    >
      <Icon name={icon} size={22} strokeWidth={2.4} />
      <span className="text-[13px] font-bold text-ink">{label}</span>
      <span className="text-[10px] font-medium text-ink-3">{sub}</span>
    </motion.button>
  );
}
