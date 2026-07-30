import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

/* ------------------------------------------------------------------ card */

export function Card({
  className,
  children,
  ...rest
}: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-line bg-surface shadow-[var(--shadow-card)]",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
  icon,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  icon?: IconName;
}) {
  return (
    <div className="mb-3 flex items-center justify-between px-1">
      <h2 className="flex items-center gap-2 text-[15px] font-bold text-ink">
        {icon ? <Icon name={icon} size={17} className="text-ink-3" /> : null}
        {title}
      </h2>
      {action ? (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-brand transition hover:bg-brand/8 active:scale-95"
        >
          {action}
          <Icon name="chevronRight" size={13} strokeWidth={2.4} />
        </button>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- button */

type Variant = "primary" | "mint" | "lav" | "soft" | "ghost" | "danger" | "outline";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_10px_24px_-12px_rgba(59,130,246,.9)]",
  mint: "bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,.9)]",
  lav: "bg-gradient-to-b from-violet-500 to-violet-600 text-white shadow-[0_10px_24px_-12px_rgba(139,92,246,.9)]",
  soft: "bg-surface-3 text-ink hover:bg-line",
  ghost: "text-ink-2 hover:bg-surface-3",
  danger: "bg-rose-500/12 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20",
  outline: "border border-line text-ink hover:bg-surface-3",
};

export function Button({
  variant = "primary",
  icon,
  className,
  children,
  full,
  size = "md",
  ...rest
}: {
  variant?: Variant;
  icon?: IconName;
  full?: boolean;
  size?: "sm" | "md" | "lg";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-colors",
        size === "sm" && "px-3 py-2 text-xs",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-5 py-3.5 text-[15px]",
        full && "w-full",
        VARIANTS[variant],
        className
      )}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {icon ? <Icon name={icon} size={size === "sm" ? 14 : 17} strokeWidth={2.1} /> : null}
      {children}
    </motion.button>
  );
}

export function IconButton({
  icon,
  className,
  label,
  badge,
  ...rest
}: { icon: IconName; label: string; badge?: boolean } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      aria-label={label}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-2xl border border-line bg-surface text-ink-2 shadow-[var(--shadow-soft)] transition hover:text-ink",
        className
      )}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      <Icon name={icon} size={19} />
      {badge ? (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[color:var(--surface)]" />
      ) : null}
    </motion.button>
  );
}

export function Chip({
  active,
  children,
  className,
  icon,
  ...rest
}: { active?: boolean; icon?: IconName } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition",
        active
          ? "border-transparent bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_8px_18px_-10px_rgba(59,130,246,.95)]"
          : "border-line bg-surface text-ink-2 hover:text-ink",
        className
      )}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {icon ? <Icon name={icon} size={14} strokeWidth={2.1} /> : null}
      {children}
    </motion.button>
  );
}

export function Tag({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "blue" | "mint" | "lav" | "amber" | "rose";
}) {
  const tones = {
    neutral: "bg-surface-3 text-ink-2",
    blue: "bg-blue-500/12 text-blue-600 dark:text-blue-400",
    mint: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
    lav: "bg-violet-500/12 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-500/14 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-500/12 text-rose-600 dark:text-rose-400",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------- segmented control */

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-2xl border border-line bg-surface-3 p-1",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex-1 rounded-xl px-3 py-2 text-xs font-semibold transition",
              active ? "text-white" : "text-ink-2 hover:text-ink"
            )}
          >
            {active ? (
              <motion.span
                layoutId={`seg-${options.map((o) => o.value).join("")}`}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 shadow-[0_8px_18px_-10px_rgba(59,130,246,.95)]"
              />
            ) : null}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------- progress ring */

export function ProgressRing({
  value,
  size = 132,
  stroke = 12,
  from = "#3B82F6",
  to = "#10B981",
  children,
  delay = 0.1,
  trackClass = "text-track",
}: {
  value: number;
  size?: number;
  stroke?: number;
  from?: string;
  to?: string;
  children?: ReactNode;
  delay?: number;
  trackClass?: string;
}) {
  const id = useRef(`ring-${Math.random().toString(36).slice(2, 8)}`).current;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className={trackClass}
          stroke="currentColor"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={`url(#${id})`}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function AnimatedNumber({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });
  const text = useTransform(spring, (v) => `${Math.round(v)}${suffix}`);
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  return <motion.span className={className}>{text}</motion.span>;
}

/* ------------------------------------------------------------------ bars */

export function Bars({
  data,
  height = 120,
  gradient = ["#3B82F6", "#8B5CF6"],
}: {
  data: { label: string; value: number; highlight?: boolean }[];
  height?: number;
  gradient?: [string, string] | string[];
}) {
  const max = Math.max(100, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d, i) => {
        const pct = max === 0 ? 0 : (d.value / max) * 100;
        return (
          <div key={`${d.label}-${i}`} className="flex flex-1 flex-col items-center gap-2">
            <div className="relative flex w-full flex-1 items-end justify-center overflow-hidden rounded-xl bg-track/60">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(pct, 3)}%` }}
                transition={{ duration: 0.75, delay: i * 0.045, ease: [0.16, 1, 0.3, 1] }}
                className="w-full rounded-xl"
                style={{
                  background: d.highlight
                    ? `linear-gradient(180deg, ${gradient[0]}, ${gradient[1]})`
                    : `linear-gradient(180deg, ${gradient[0]}bf, ${gradient[1]}80)`,
                }}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold",
                d.highlight ? "text-ink" : "text-ink-3"
              )}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------------------------------------------- inputs */

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-ink-2">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-ink-3">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-2xl border border-line bg-surface-3 px-4 py-3 text-sm text-ink placeholder:text-ink-3 outline-none transition focus:border-blue-400 focus:bg-surface focus:ring-4 focus:ring-blue-500/12";

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-colors",
        checked ? "bg-gradient-to-r from-blue-500 to-emerald-500" : "bg-line-strong"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 34 }}
        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-md"
        style={{ left: checked ? 26 : 4 }}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ sheet */

export function Sheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "6%", opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: "8%", opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className={cn(
              "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-line bg-surface shadow-[var(--shadow-float)] sm:rounded-[28px]",
              maxWidth
            )}
          >
            <div className="flex items-start gap-3 px-5 pb-3 pt-4">
              <div className="min-w-0 flex-1">
                <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line-strong sm:hidden" />
                {title ? (
                  <h3 className="truncate text-lg font-extrabold text-ink">{title}</h3>
                ) : null}
                {subtitle ? (
                  <p className="mt-0.5 truncate text-xs text-ink-3">{subtitle}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-3 text-ink-2 transition hover:text-ink"
              >
                <Icon name="close" size={17} strokeWidth={2.2} />
              </button>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-5">{children}</div>
            {footer ? (
              <div className="safe-bottom border-t border-line bg-surface px-5 py-3">{footer}</div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------ empty state */

export function EmptyState({
  title,
  body,
  actionLabel,
  onAction,
  variant = "meds",
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "meds" | "search" | "calendar" | "history" | "bell";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center px-6 py-10 text-center"
    >
      <EmptyArt variant={variant} />
      <h3 className="mt-5 text-base font-extrabold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-[16rem] text-[13px] leading-relaxed text-ink-3">{body}</p>
      {actionLabel && onAction ? (
        <Button className="mt-5" icon="plus" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </motion.div>
  );
}

function EmptyArt({ variant }: { variant: "meds" | "search" | "calendar" | "history" | "bell" }) {
  const iconByVariant: Record<string, IconName> = {
    meds: "pill",
    search: "search",
    calendar: "calendarDays",
    history: "history",
    bell: "bell",
  };
  return (
    <div className="relative grid h-28 w-28 place-items-center">
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-[38%] bg-gradient-to-br from-blue-500/16 via-violet-500/12 to-emerald-500/16 blur-[2px]"
      />
      <div className="absolute inset-3 rounded-[38%] border border-dashed border-line-strong/70" />
      <div className="relative grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-[0_16px_30px_-16px_rgba(59,130,246,.9)]">
        <Icon name={iconByVariant[variant]} size={26} strokeWidth={1.9} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- confirm ux */

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    body: string;
    onConfirm?: () => void;
    danger?: boolean;
  }>({ open: false, title: "", body: "" });

  const confirm = (opts: {
    title: string;
    body: string;
    onConfirm: () => void;
    danger?: boolean;
  }) => setState({ open: true, ...opts });

  const element = (
    <Sheet
      open={state.open}
      onClose={() => setState((s) => ({ ...s, open: false }))}
      title={state.title}
      maxWidth="max-w-sm"
    >
      <p className="text-sm leading-relaxed text-ink-2">{state.body}</p>
      <div className="mt-5 flex gap-2">
        <Button
          variant="soft"
          full
          onClick={() => setState((s) => ({ ...s, open: false }))}
        >
          Cancel
        </Button>
        <Button
          variant={state.danger ? "danger" : "primary"}
          full
          onClick={() => {
            state.onConfirm?.();
            setState((s) => ({ ...s, open: false }));
          }}
        >
          Confirm
        </Button>
      </div>
    </Sheet>
  );

  return { confirm, element };
}
