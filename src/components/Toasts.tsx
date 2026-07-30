import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/store";
import { cn } from "../utils/cn";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

const TONES: Record<string, { icon: IconName; ring: string; chip: string }> = {
  default: { icon: "info", ring: "ring-blue-500/20", chip: "bg-blue-500/12 text-blue-600 dark:text-blue-400" },
  info: { icon: "bellRing", ring: "ring-blue-500/20", chip: "bg-blue-500/12 text-blue-600 dark:text-blue-400" },
  success: { icon: "checkCircle", ring: "ring-emerald-500/20", chip: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400" },
  warn: { icon: "alert", ring: "ring-amber-500/20", chip: "bg-amber-500/14 text-amber-600 dark:text-amber-400" },
  danger: { icon: "xCircle", ring: "ring-rose-500/20", chip: "bg-rose-500/12 text-rose-600 dark:text-rose-400" },
};

export function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col items-center gap-2 px-3 pt-[max(env(safe-area-inset-top),0.75rem)]">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const tone = TONES[toast.tone ?? "default"];
          return (
            <motion.button
              key={toast.id}
              type="button"
              layout
              initial={{ opacity: 0, y: -24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              onClick={() => dismissToast(toast.id)}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-line bg-surface px-3.5 py-3 text-left shadow-[var(--shadow-float)] ring-4",
                tone.ring
              )}
            >
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tone.chip)}>
                <Icon name={tone.icon} size={17} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-ink">{toast.title}</p>
                {toast.body ? (
                  <p className="truncate text-[11px] text-ink-3">{toast.body}</p>
                ) : null}
              </div>
              <Icon name="close" size={15} className="text-ink-3" />
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
