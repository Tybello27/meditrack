import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Icon } from "./Icon";

export function PageHeader({
  eyebrow,
  title,
  right,
  onBack,
}: {
  eyebrow?: string;
  title: string;
  right?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 flex items-center gap-3"
    >
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-line bg-surface text-ink-2"
        >
          <Icon name="chevronLeft" size={18} strokeWidth={2.2} />
        </button>
      ) : null}
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-3">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="truncate text-[26px] font-extrabold leading-tight text-ink">{title}</h1>
      </div>
      {right ? <div className="flex shrink-0 items-center gap-2">{right}</div> : null}
    </motion.header>
  );
}
