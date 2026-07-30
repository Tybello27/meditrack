import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { DoseLog, Medication } from "../types";
import { useStore } from "../store/store";
import { formatDateFull, formatTime, relativeDayLabel } from "../lib/date";
import { STATUS_META } from "../lib/palette";
import { Icon } from "../components/Icon";
import { MedTile } from "../components/MedCard";
import { PageHeader } from "../components/PageHeader";
import { Chip, EmptyState, inputClass } from "../components/ui";
import { cn } from "../utils/cn";

type Filter = "all" | "taken" | "missed" | "skipped" | "snoozed";

export function HistoryScreen({
  onOpenMed,
  onBack,
}: {
  onOpenMed: (med: Medication) => void;
  onBack: () => void;
}) {
  const { meds, logs, clearLog, pushToast } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const medById = useMemo(() => {
    const map = new Map<string, Medication>();
    meds.forEach((m) => map.set(m.id, m));
    return map;
  }, [meds]);

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const entries = Object.values(logs)
      .filter((log) => {
        if (filter !== "all" && log.status !== filter) return false;
        if (!q) return true;
        const med = medById.get(log.medId);
        return med ? med.name.toLowerCase().includes(q) : false;
      })
      .sort((a, b) =>
        a.date === b.date ? b.time.localeCompare(a.time) : b.date.localeCompare(a.date)
      );

    const map = new Map<string, DoseLog[]>();
    for (const log of entries) {
      const list = map.get(log.date) ?? [];
      list.push(log);
      map.set(log.date, list);
    }
    return Array.from(map.entries()).slice(0, 30);
  }, [logs, filter, query, medById]);

  const counts = useMemo(() => {
    const all = Object.values(logs);
    return {
      all: all.length,
      taken: all.filter((l) => l.status === "taken").length,
      missed: all.filter((l) => l.status === "missed").length,
      skipped: all.filter((l) => l.status === "skipped").length,
      snoozed: all.filter((l) => l.status === "snoozed").length,
    };
  }, [logs]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={`${counts.all} logged doses`}
        title="Medication History"
        onBack={onBack}
      />

      <div className="relative">
        <Icon
          name="search"
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-3"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search history by medication…"
          className={cn(inputClass, "pl-11")}
        />
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {(["all", "taken", "missed", "skipped", "snoozed"] as Filter[]).map((f) => (
          <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>
            <span className="capitalize">{f}</span>
            <span className={cn("ml-1 text-[10px]", filter === f ? "text-white/80" : "text-ink-3")}>
              {counts[f]}
            </span>
          </Chip>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-3xl border border-line bg-surface">
          <EmptyState
            variant="history"
            title="Nothing logged yet"
            body="Every dose you take, skip or miss will be recorded here as a timeline you can review."
          />
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {grouped.map(([date, entries], groupIndex) => (
              <motion.section
                key={date}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: Math.min(groupIndex * 0.03, 0.25) }}
              >
                <div className="mb-2 flex items-center gap-2 px-1">
                  <span className="grid h-7 w-7 place-items-center rounded-xl bg-blue-500/12 text-blue-600 dark:text-blue-400">
                    <Icon name="calendar" size={14} />
                  </span>
                  <p className="text-[13px] font-bold text-ink">{relativeDayLabel(date)}</p>
                  <span className="text-[10px] text-ink-3">{formatDateFull(date)}</span>
                  <span className="ml-auto rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-bold text-ink-3">
                    {entries.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {entries.map((log) => {
                    const med = medById.get(log.medId);
                    const meta = STATUS_META[log.status];
                    return (
                      <motion.div
                        key={log.id}
                        layout
                        className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 shadow-[var(--shadow-soft)]"
                      >
                        {med ? (
                          <button type="button" onClick={() => onOpenMed(med)}>
                            <MedTile med={med} size={40} />
                          </button>
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-surface-3 text-ink-3">
                            <Icon name="pill" size={18} />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-bold text-ink">
                            {med?.name ?? "Removed medication"}
                          </p>
                          <p className="text-[11px] text-ink-3">
                            {formatTime(log.time)} · {med ? `${med.dosage} · ${med.strength}` : "—"}
                          </p>
                        </div>
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                          style={{ background: `${meta.hex}1f`, color: meta.hex }}
                        >
                          {meta.label}
                        </span>
                        <button
                          type="button"
                          aria-label="Undo log"
                          onClick={() => {
                            clearLog(log.id);
                            pushToast({ title: "Log entry removed", tone: "default" });
                          }}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-3 text-ink-3 transition hover:text-ink"
                        >
                          <Icon name="undo" size={14} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
