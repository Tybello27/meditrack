import { motion } from "framer-motion";
import type { ScreenId } from "../types";
import { cn } from "../utils/cn";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

export const NAV_ITEMS: {
  id: ScreenId;
  label: string;
  short: string;
  icon: IconName;
}[] = [
  { id: "home", label: "Home", short: "Home", icon: "home" },
  { id: "meds", label: "Medications", short: "Meds", icon: "pill" },
  { id: "schedule", label: "Schedule", short: "Plan", icon: "calendar" },
  { id: "progress", label: "Progress", short: "Stats", icon: "chart" },
  { id: "settings", label: "Settings", short: "More", icon: "settings" },
];

export function BottomNav({
  active,
  onNavigate,
  onAdd,
}: {
  active: ScreenId;
  onNavigate: (id: ScreenId) => void;
  onAdd: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="pointer-events-auto relative mx-auto max-w-lg px-3 pb-[max(env(safe-area-inset-bottom),0.6rem)]">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={onAdd}
          aria-label="Add medication"
          className="absolute -top-[72px] right-4 z-10 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_18px_30px_-12px_rgba(59,130,246,.95)] ring-4 ring-[color:var(--canvas)]"
        >
          <Icon name="plus" size={24} strokeWidth={2.6} />
        </motion.button>
        <nav className="glass flex items-center justify-between rounded-[26px] border border-line px-2 py-2 shadow-[var(--shadow-float)]">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1.5"
              >
                {isActive ? (
                  <motion.span
                    layoutId="nav-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="absolute inset-0 rounded-2xl bg-blue-500/10"
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 transition-colors",
                    isActive ? "text-brand" : "text-ink-3"
                  )}
                >
                  <Icon name={item.icon} size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-semibold transition-colors",
                    isActive ? "text-brand" : "text-ink-3"
                  )}
                >
                  {item.short}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export function SideNav({
  active,
  onNavigate,
  onAdd,
}: {
  active: ScreenId;
  onNavigate: (id: ScreenId) => void;
  onAdd: () => void;
}) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col gap-2 border-r border-line bg-surface/70 px-4 py-6 backdrop-blur lg:flex">
      <div className="mb-6 flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_14px_26px_-14px_rgba(59,130,246,1)]">
          <Icon name="heartPulse" size={22} strokeWidth={2} />
        </div>
        <div>
          <p className="text-base font-extrabold leading-tight text-ink">MediTrack</p>
          <p className="text-[11px] text-ink-3">Calm care companion</p>
        </div>
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={cn(
              "relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
              isActive ? "text-brand" : "text-ink-2 hover:bg-surface-3 hover:text-ink"
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="side-pill"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className="absolute inset-0 rounded-2xl bg-blue-500/10"
              />
            ) : null}
            <span className="relative z-10">
              <Icon name={item.icon} size={19} strokeWidth={isActive ? 2.2 : 1.8} />
            </span>
            <span className="relative z-10">{item.label}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onNavigate("history")}
        className={cn(
          "relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
          active === "history" ? "text-brand" : "text-ink-2 hover:bg-surface-3 hover:text-ink"
        )}
      >
        <Icon name="history" size={19} />
        History
      </button>

      <div className="mt-auto space-y-3">
        <button
          type="button"
          onClick={onAdd}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-3 text-sm font-bold text-white shadow-[0_16px_28px_-16px_rgba(59,130,246,1)] transition active:scale-[.98]"
        >
          <Icon name="plus" size={17} strokeWidth={2.4} /> Add medication
        </button>
        <p className="px-2 text-[11px] leading-relaxed text-ink-3">
          Your data stays on this device — private, offline-first and always available.
        </p>
      </div>
    </aside>
  );
}
