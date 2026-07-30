import { motion } from "framer-motion";
import type { DoseInstance, DoseStatus, Medication } from "../types";
import { PALETTES, STATUS_META } from "../lib/palette";
import { formatTimeShort } from "../lib/date";
import { nextTimeForMed, refillState } from "../lib/schedule";
import { cn } from "../utils/cn";
import { FORM_ICON, Icon } from "./Icon";
import { Tag } from "./ui";

export function MedTile({
  med,
  size = 44,
  className,
}: {
  med: Pick<Medication, "color" | "form">;
  size?: number;
  className?: string;
}) {
  const palette = PALETTES[med.color];
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white",
        palette.gradient,
        className
      )}
      style={{
        width: size,
        height: size,
        boxShadow: `0 12px 22px -14px ${palette.hex}`,
      }}
    >
      <Icon name={FORM_ICON[med.form] ?? "pill"} size={size * 0.46} strokeWidth={1.9} />
    </div>
  );
}

export function StatusDot({ status }: { status: DoseStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className="relative grid h-3.5 w-3.5 place-items-center">
      <span
        className="h-3 w-3 rounded-full ring-4 ring-[color:var(--canvas)]"
        style={{ background: meta.hex }}
      />
      {status === "due" ? (
        <motion.span
          className="absolute h-3 w-3 rounded-full"
          style={{ background: meta.hex }}
          animate={{ scale: [1, 2.1], opacity: [0.55, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}
    </span>
  );
}

export function MedCard({
  med,
  now,
  adherence,
  onOpen,
  index = 0,
}: {
  med: Medication;
  now: number;
  adherence?: number;
  onOpen: () => void;
  index?: number;
}) {
  const palette = PALETTES[med.color];
  const next = nextTimeForMed(med, now);
  const refill = refillState(med);

  return (
    <motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), type: "spring", stiffness: 260, damping: 26 }}
      whileTap={{ scale: 0.985 }}
      onClick={onOpen}
      className="w-full rounded-3xl border border-line bg-surface p-3.5 text-left shadow-[var(--shadow-card)] transition hover:border-line-strong"
    >
      <div className="flex items-center gap-3">
        <MedTile med={med} size={46} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-[15px] font-bold text-ink">{med.name}</p>
            {med.paused ? <Tag tone="neutral">Paused</Tag> : null}
          </div>
          <p className="mt-0.5 truncate text-xs text-ink-3">
            {med.dosage} · {med.strength}
          </p>
        </div>
        <div
          className={cn(
            "grid h-9 w-9 place-items-center rounded-full",
            palette.soft,
            palette.softDark,
            palette.text
          )}
        >
          <Icon name="chevronRight" size={16} strokeWidth={2.4} />
        </div>
      </div>

      <div className="mt-3 space-y-1.5 rounded-2xl bg-surface-3 px-3 py-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-ink-3">
            <Icon name="clock" size={13} /> Next reminder
          </span>
          <span className="font-semibold text-ink">
            {med.paused ? "—" : next ? formatTimeShort(next) : "As needed"}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-ink-3">
            <Icon name="package" size={13} /> Refill status
          </span>
          {refill === "empty" ? (
            <Tag tone="rose">Refill now</Tag>
          ) : refill === "low" ? (
            <Tag tone="amber">{med.refillRemaining} left</Tag>
          ) : (
            <Tag tone="mint">{med.refillRemaining} left</Tag>
          )}
        </div>
        {typeof adherence === "number" ? (
          <div className="flex items-center gap-2 pt-1">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-track">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${adherence}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{ background: palette.hex }}
              />
            </div>
            <span className="text-[11px] font-bold text-ink-2">{adherence}%</span>
          </div>
        ) : null}
      </div>
    </motion.button>
  );
}

const ROW_STYLES: Record<string, string> = {
  taken: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-transparent",
  due: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-transparent",
  snoozed: "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-transparent",
  missed: "bg-gradient-to-r from-rose-500 to-rose-600 text-white border-transparent",
  skipped: "bg-surface-3 text-ink border-line",
  upcoming: "bg-surface text-ink border-line",
};

export function DoseRow({
  dose,
  index = 0,
  onOpen,
  onAction,
  showLine = true,
}: {
  dose: DoseInstance;
  index?: number;
  onOpen: () => void;
  onAction?: (status: "taken" | "skipped" | "snoozed") => void;
  showLine?: boolean;
}) {
  const meta = STATUS_META[dose.status];
  const solid = dose.status !== "upcoming" && dose.status !== "skipped";
  const palette = PALETTES[dose.med.color];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.35), type: "spring", stiffness: 240, damping: 26 }}
      className="relative flex gap-3 pl-1"
    >
      <div className="relative flex w-4 flex-col items-center pt-5">
        <StatusDot status={dose.status} />
        {showLine ? <span className="mt-1 w-px flex-1 bg-line" /> : null}
      </div>

      <div className="min-w-0 flex-1 pb-3">
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            "w-full rounded-2xl border px-3.5 py-3 text-left shadow-[var(--shadow-soft)] transition active:scale-[.99]",
            ROW_STYLES[dose.status]
          )}
        >
          <div className="flex items-center gap-3">
            {!solid ? (
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                style={{ background: `${palette.hex}1f`, color: palette.hex }}
              >
                <Icon name={FORM_ICON[dose.med.form] ?? "pill"} size={17} />
              </span>
            ) : (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/18 text-white">
                <Icon name={FORM_ICON[dose.med.form] ?? "pill"} size={17} />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-sm font-bold", solid ? "text-white" : "text-ink")}>
                {dose.med.name}
              </p>
              <p
                className={cn(
                  "mt-0.5 truncate text-[11px] font-medium",
                  solid ? "text-white/85" : "text-ink-3"
                )}
              >
                {formatTimeShort(dose.time)} · {meta.label} · {dose.med.strength}
              </p>
            </div>
            <Icon
              name="chevronRight"
              size={16}
              strokeWidth={2.4}
              className={solid ? "text-white/80" : "text-ink-3"}
            />
          </div>
        </button>

        {onAction && dose.status !== "taken" ? (
          <div className="mt-2 flex gap-2">
            <QuickAction icon="check" label="Take" tone="mint" onClick={() => onAction("taken")} />
            <QuickAction
              icon="snooze"
              label="Snooze"
              tone="amber"
              onClick={() => onAction("snoozed")}
            />
            <QuickAction icon="close" label="Skip" tone="slate" onClick={() => onAction("skipped")} />
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

function QuickAction({
  icon,
  label,
  tone,
  onClick,
}: {
  icon: "check" | "snooze" | "close";
  label: string;
  tone: "mint" | "amber" | "slate";
  onClick: () => void;
}) {
  const tones = {
    mint: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20",
    amber: "bg-amber-500/12 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
    slate: "bg-slate-500/12 text-ink-2 hover:bg-slate-500/20",
  };
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-bold transition",
        tones[tone]
      )}
    >
      <Icon name={icon} size={14} strokeWidth={2.4} />
      {label}
    </motion.button>
  );
}
