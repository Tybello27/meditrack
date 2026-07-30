import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/store";
import type { Medication } from "../types";
import { countdown, formatTimeShort, todayKey } from "../lib/date";
import { currentStreak, dosesForDate, refillState, upcomingDoses } from "../lib/schedule";
import { PALETTES } from "../lib/palette";
import { cn } from "../utils/cn";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";
import { EmptyState } from "./ui";

export function useNotificationCount() {
  const { meds, logs, now } = useStore();
  return useMemo(() => {
    const today = dosesForDate(meds, logs, todayKey(), now);
    const missed = today.filter((d) => d.status === "missed").length;
    const due = today.filter((d) => d.status === "due").length;
    const refills = meds.filter((m) => !m.paused && refillState(m) !== "ok").length;
    return missed + due + refills;
  }, [meds, logs, now]);
}

export function NotificationCenter({
  open,
  onClose,
  onOpenMed,
}: {
  open: boolean;
  onClose: () => void;
  onOpenMed: (med: Medication) => void;
}) {
  const { meds, logs, now, settings, patchSettings, pushToast, logDose } = useStore();

  const today = todayKey();
  const doses = useMemo(() => dosesForDate(meds, logs, today, now), [meds, logs, today, now]);
  const upcoming = useMemo(() => upcomingDoses(meds, logs, now, 5), [meds, logs, now]);
  const missed = doses.filter((d) => d.status === "missed");
  const refills = meds.filter((m) => !m.paused && refillState(m) !== "ok");
  const streak = useMemo(() => currentStreak(meds, logs, now), [meds, logs, now]);

  const total = upcoming.length + missed.length + refills.length;

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      pushToast({ title: "Notifications unsupported", tone: "warn" });
      return;
    }
    const permission = await Notification.requestPermission();
    patchSettings({ notifications: permission === "granted" });
    pushToast({
      title: permission === "granted" ? "Reminders enabled" : "Permission not granted",
      tone: permission === "granted" ? "success" : "warn",
    });
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="relative flex h-full w-full max-w-sm flex-col border-l border-line bg-surface shadow-[var(--shadow-float)]"
          >
            <header className="flex items-center gap-3 border-b border-line px-4 pb-3 pt-[max(env(safe-area-inset-top),1rem)]">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white">
                <Icon name="bellRing" size={19} strokeWidth={2} />
              </span>
              <div className="flex-1">
                <h2 className="text-base font-extrabold text-ink">Notifications</h2>
                <p className="text-[11px] text-ink-3">
                  {total > 0 ? `${total} item${total === 1 ? "" : "s"} need attention` : "You're all caught up"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close notifications"
                className="grid h-9 w-9 place-items-center rounded-full bg-surface-3 text-ink-2"
              >
                <Icon name="close" size={17} strokeWidth={2.2} />
              </button>
            </header>

            <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-4 py-4 pb-10">
              {!settings.notifications ? (
                <button
                  type="button"
                  onClick={enableNotifications}
                  className="flex w-full items-center gap-3 rounded-2xl border border-blue-500/25 bg-blue-500/8 p-3 text-left"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500 text-white">
                    <Icon name="bell" size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-bold text-ink">
                      Turn on dose reminders
                    </span>
                    <span className="block text-[11px] text-ink-2">
                      Get a gentle nudge when it’s time for a dose.
                    </span>
                  </span>
                  <Icon name="chevronRight" size={16} className="text-ink-3" />
                </button>
              ) : null}

              {total === 0 ? (
                <EmptyState
                  variant="bell"
                  title="No new notifications"
                  body="Reminders, missed doses and refill alerts will appear here."
                />
              ) : null}

              {missed.length ? (
                <Group title="Missed doses" icon="alert" tone="rose">
                  {missed.map((dose) => (
                    <Row
                      key={dose.key}
                      color={PALETTES[dose.med.color].hex}
                      icon="alert"
                      title={`${dose.med.name} · ${formatTimeShort(dose.time)}`}
                      body={`${dose.med.dosage} · ${dose.med.strength} — not logged`}
                      actionLabel="Take now"
                      onAction={() => {
                        logDose(dose.med.id, dose.date, dose.time, "taken");
                        pushToast({ title: `${dose.med.name} logged`, tone: "success" });
                      }}
                      onClick={() => onOpenMed(dose.med)}
                    />
                  ))}
                </Group>
              ) : null}

              {upcoming.length ? (
                <Group title="Upcoming reminders" icon="clock" tone="blue">
                  {upcoming.map((dose) => (
                    <Row
                      key={dose.key}
                      color={PALETTES[dose.med.color].hex}
                      icon="clock"
                      title={`${dose.med.name} · ${formatTimeShort(dose.time)}`}
                      body={`${dose.med.dosage} · ${countdown(dose.at - now)}`}
                      onClick={() => onOpenMed(dose.med)}
                    />
                  ))}
                </Group>
              ) : null}

              {refills.length ? (
                <Group title="Refill alerts" icon="package" tone="amber">
                  {refills.map((med) => (
                    <Row
                      key={med.id}
                      color={PALETTES[med.color].hex}
                      icon="package"
                      title={med.name}
                      body={
                        med.refillRemaining <= 0
                          ? "Out of stock — refill required"
                          : `Only ${med.refillRemaining} doses left`
                      }
                      onClick={() => onOpenMed(med)}
                    />
                  ))}
                </Group>
              ) : null}

              {streak >= 3 ? (
                <Group title="Achievements" icon="trophy" tone="mint">
                  <Row
                    color="#10B981"
                    icon="flame"
                    title={`${streak}-day streak`}
                    body="Keep going — consistency is care."
                  />
                </Group>
              ) : null}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function Group({
  title,
  icon,
  tone,
  children,
}: {
  title: string;
  icon: IconName;
  tone: "rose" | "blue" | "amber" | "mint";
  children: React.ReactNode;
}) {
  const tones = {
    rose: "text-rose-500",
    blue: "text-blue-500",
    amber: "text-amber-500",
    mint: "text-emerald-500",
  };
  return (
    <section>
      <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-ink-3">
        <Icon name={icon} size={13} className={tones[tone]} />
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({
  color,
  icon,
  title,
  body,
  actionLabel,
  onAction,
  onClick,
}: {
  color: string;
  icon: IconName;
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3",
        onClick && "cursor-pointer transition hover:border-line-strong"
      )}
      onClick={onClick}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ background: `${color}1f`, color }}
      >
        <Icon name={icon} size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-ink">{title}</p>
        <p className="truncate text-[11px] text-ink-3">{body}</p>
      </div>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
          className="shrink-0 rounded-full bg-emerald-500/14 px-2.5 py-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
