import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Frequency, Medication, Slot } from "../types";
import { useStore } from "../store/store";
import { addDays, todayKey } from "../lib/date";
import { medAdherence, nextTimeForMed, refillState, slotOf } from "../lib/schedule";
import { SLOTS, SLOT_META } from "../lib/palette";
import { Icon } from "../components/Icon";
import { MedCard } from "../components/MedCard";
import { PageHeader } from "../components/PageHeader";
import { Button, Chip, EmptyState, Field, Segmented, Sheet, inputClass } from "../components/ui";
import { cn } from "../utils/cn";

type StatusFilter = "all" | "active" | "paused";
type SortKey = "next" | "name" | "adherence";

export function MedicationsScreen({
  onOpenMed,
  onAdd,
}: {
  onOpenMed: (med: Medication) => void;
  onAdd: () => void;
}) {
  const { meds, logs, now } = useStore();
  const [query, setQuery] = useState("");
  const [slot, setSlot] = useState<Slot | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [frequency, setFrequency] = useState<Frequency | "all">("all");
  const [sort, setSort] = useState<SortKey>("next");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const week = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(todayKey(), -6 + i)), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = meds.filter((med) => {
      if (q) {
        const haystack =
          `${med.name} ${med.strength} ${med.dosage} ${med.notes} ${med.instructions}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (status === "active" && med.paused) return false;
      if (status === "paused" && !med.paused) return false;
      if (frequency !== "all" && med.frequency !== frequency) return false;
      if (slot !== "all" && !med.times.some((t) => slotOf(t) === slot)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "adherence") {
        return (
          medAdherence(b, logs, week, now).pct - medAdherence(a, logs, week, now).pct
        );
      }
      const an = nextTimeForMed(a, now) ?? "99:99";
      const bn = nextTimeForMed(b, now) ?? "99:99";
      return an.localeCompare(bn);
    });
    return list;
  }, [meds, query, status, frequency, slot, sort, logs, now, week]);

  const activeFilters =
    (status !== "all" ? 1 : 0) + (frequency !== "all" ? 1 : 0) + (sort !== "next" ? 1 : 0);

  const lowRefills = meds.filter((m) => refillState(m) !== "ok").length;

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={`${meds.length} in your cabinet`}
        title="My Medications"
        right={
          <>
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              aria-label="Filters"
              className="relative grid h-10 w-10 place-items-center rounded-2xl border border-line bg-surface text-ink-2 shadow-[var(--shadow-soft)]"
            >
              <Icon name="filter" size={18} />
              {activeFilters ? (
                <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white ring-2 ring-[color:var(--canvas)]">
                  {activeFilters}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={onAdd}
              aria-label="Add medication"
              className="hidden h-10 items-center gap-1.5 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 px-3.5 text-sm font-bold text-white shadow-[0_12px_22px_-14px_rgba(59,130,246,1)] lg:flex"
            >
              <Icon name="plus" size={16} strokeWidth={2.5} /> Add
            </button>
          </>
        }
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
          placeholder="Search medications, dosage, notes…"
          className={cn(inputClass, "pl-11 pr-10")}
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-surface-3 text-ink-3"
          >
            <Icon name="close" size={13} strokeWidth={2.6} />
          </button>
        ) : null}
      </div>

      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <Chip active={slot === "all"} onClick={() => setSlot("all")} icon="list">
          All times
        </Chip>
        {SLOTS.map((s) => (
          <Chip key={s} active={slot === s} onClick={() => setSlot(s)}>
            {SLOT_META[s].emoji} {SLOT_META[s].label}
          </Chip>
        ))}
      </div>

      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-ink-3">
          {filtered.length} medication{filtered.length === 1 ? "" : "s"}
          {query ? ` for “${query}”` : ""}
        </p>
        {lowRefills ? (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
            <Icon name="package" size={12} /> {lowRefills} need refill
          </span>
        ) : null}
      </div>

      {meds.length === 0 ? (
        <div className="rounded-3xl border border-line bg-surface">
          <EmptyState
            variant="meds"
            title="Your cabinet is empty"
            body="Add medications with dosage, schedule and refill tracking to stay on top of your routine."
            actionLabel="Add medication"
            onAction={onAdd}
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-line bg-surface">
          <EmptyState
            variant="search"
            title="No matches found"
            body="Try a different search term or clear your filters to see all medications."
          />
        </div>
      ) : (
        <motion.div layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((med, i) => (
              <MedCard
                key={med.id}
                med={med}
                now={now}
                index={i}
                adherence={medAdherence(med, logs, week, now).pct}
                onOpen={() => onOpenMed(med)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter & sort"
        subtitle="Narrow down your medication list"
        maxWidth="max-w-md"
        footer={
          <div className="flex gap-2">
            <Button
              variant="soft"
              full
              onClick={() => {
                setStatus("all");
                setFrequency("all");
                setSort("next");
                setSlot("all");
              }}
            >
              Reset
            </Button>
            <Button full icon="check" onClick={() => setFiltersOpen(false)}>
              Apply filters
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-ink-2">Status</span>
            <Segmented
              value={status}
              onChange={setStatus}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
              ]}
            />
          </div>

          <Field label="Frequency">
            <div className="relative">
              <select
                className={cn(inputClass, "pr-10")}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as Frequency | "all")}
              >
                <option value="all">All frequencies</option>
                <option value="daily">Every day</option>
                <option value="alternate">Every other day</option>
                <option value="weekly">Specific weekdays</option>
                <option value="asneeded">As needed</option>
              </select>
              <Icon
                name="chevronDown"
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-3"
              />
            </div>
          </Field>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-ink-2">Reminder time</span>
            <div className="flex flex-wrap gap-2">
              <Chip active={slot === "all"} onClick={() => setSlot("all")}>
                Any time
              </Chip>
              {SLOTS.map((s) => (
                <Chip key={s} active={slot === s} onClick={() => setSlot(s)}>
                  {SLOT_META[s].emoji} {SLOT_META[s].label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-ink-2">Sort by</span>
            <Segmented
              value={sort}
              onChange={setSort}
              options={[
                { value: "next", label: "Next dose" },
                { value: "name", label: "Name" },
                { value: "adherence", label: "Adherence" },
              ]}
            />
          </div>
        </div>
      </Sheet>
    </div>
  );
}
