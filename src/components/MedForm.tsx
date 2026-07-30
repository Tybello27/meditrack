import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ColorKey, Frequency, MealPreference, MedForm as MedFormType, Medication } from "../types";
import { COLOR_KEYS, FORM_LABELS, PALETTES } from "../lib/palette";
import { formatTimeShort, todayKey, WEEKDAYS_MIN } from "../lib/date";
import { uid } from "../lib/storage";
import { cn } from "../utils/cn";
import { FORM_ICON, Icon } from "./Icon";
import { Button, Field, Sheet, inputClass } from "./ui";

const FORMS: MedFormType[] = ["tablet", "capsule", "liquid", "injection", "drops", "inhaler"];

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "daily", label: "Every day" },
  { value: "alternate", label: "Every other day" },
  { value: "weekly", label: "Specific weekdays" },
  { value: "asneeded", label: "As needed" },
];

const MEALS: { value: MealPreference; label: string }[] = [
  { value: "any", label: "Anytime" },
  { value: "before", label: "Before meal" },
  { value: "with", label: "With meal" },
  { value: "after", label: "After meal" },
];

function emptyMed(): Medication {
  return {
    id: uid("med"),
    name: "",
    dosage: "1 tablet",
    strength: "",
    form: "tablet",
    color: "blue",
    times: ["08:00"],
    frequency: "daily",
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    meal: "any",
    instructions: "",
    notes: "",
    refillRemaining: 30,
    refillThreshold: 7,
    startDate: todayKey(),
    endDate: null,
    paused: false,
    createdAt: Date.now(),
  };
}

export function MedFormSheet({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial: Medication | null;
  onSave: (med: Medication) => void;
}) {
  const [draft, setDraft] = useState<Medication>(() => initial ?? emptyMed());
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setDraft(initial ? { ...initial } : emptyMed());
      setError("");
    }
  }, [open, initial]);

  const patch = (p: Partial<Medication>) => setDraft((d) => ({ ...d, ...p }));

  const sortedTimes = useMemo(() => [...draft.times].sort(), [draft.times]);

  const submit = () => {
    if (!draft.name.trim()) {
      setError("Please give this medication a name.");
      return;
    }
    if (draft.frequency !== "asneeded" && draft.times.length === 0) {
      setError("Add at least one reminder time.");
      return;
    }
    onSave({
      ...draft,
      name: draft.name.trim(),
      strength: draft.strength.trim() || "—",
      dosage: draft.dosage.trim() || "1 dose",
      times: sortedTimes,
    });
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={initial ? "Edit Medication" : "Add Medication"}
      subtitle={initial ? initial.name : "Set up dosage, schedule and reminders"}
      footer={
        <div className="flex gap-2">
          <Button variant="soft" full onClick={onClose}>
            Cancel
          </Button>
          <Button full icon="check" onClick={submit}>
            Save Medication
          </Button>
        </div>
      }
    >
      <div className="space-y-4 pb-2">
        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl bg-rose-500/12 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400"
            >
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <Field label="Medicine name">
          <input
            className={inputClass}
            placeholder="e.g. Atorvastatin"
            value={draft.name}
            onChange={(e) => patch({ name: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Dosage">
            <input
              className={inputClass}
              placeholder="1 tablet"
              value={draft.dosage}
              onChange={(e) => patch({ dosage: e.target.value })}
            />
          </Field>
          <Field label="Strength">
            <input
              className={inputClass}
              placeholder="500 mg"
              value={draft.strength}
              onChange={(e) => patch({ strength: e.target.value })}
            />
          </Field>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-ink-2">Medication type</span>
          <div className="grid grid-cols-3 gap-2">
            {FORMS.map((f) => {
              const active = draft.form === f;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => patch({ form: f })}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 text-[11px] font-semibold transition",
                    active
                      ? "border-blue-500/60 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border-line bg-surface-3 text-ink-2 hover:text-ink"
                  )}
                >
                  <Icon name={FORM_ICON[f]} size={20} />
                  {FORM_LABELS[f]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold text-ink-2">Color label</span>
          <div className="flex flex-wrap gap-2.5">
            {COLOR_KEYS.map((key: ColorKey) => (
              <button
                key={key}
                type="button"
                aria-label={PALETTES[key].label}
                onClick={() => patch({ color: key })}
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-full transition",
                  draft.color === key
                    ? "ring-2 ring-offset-2 ring-offset-[color:var(--surface)]"
                    : "opacity-80 hover:opacity-100"
                )}
                style={{
                  background: PALETTES[key].hex,
                  boxShadow: `0 10px 20px -12px ${PALETTES[key].hex}`,
                  ...(draft.color === key ? { outlineColor: PALETTES[key].hex } : {}),
                }}
              >
                {draft.color === key ? (
                  <Icon name="check" size={16} strokeWidth={3} className="text-white" />
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <Field label="Frequency">
          <div className="relative">
            <select
              className={cn(inputClass, "pr-10")}
              value={draft.frequency}
              onChange={(e) => patch({ frequency: e.target.value as Frequency })}
            >
              {FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <Icon
              name="chevronDown"
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-3"
            />
          </div>
        </Field>

        {draft.frequency === "weekly" ? (
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-ink-2">Repeat on</span>
            <div className="flex gap-1.5">
              {WEEKDAYS_MIN.map((d, i) => {
                const active = draft.daysOfWeek.includes(i);
                return (
                  <button
                    key={`${d}-${i}`}
                    type="button"
                    onClick={() =>
                      patch({
                        daysOfWeek: active
                          ? draft.daysOfWeek.filter((x) => x !== i)
                          : [...draft.daysOfWeek, i].sort(),
                      })
                    }
                    className={cn(
                      "h-10 flex-1 rounded-xl text-xs font-bold transition",
                      active
                        ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white"
                        : "bg-surface-3 text-ink-3"
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {draft.frequency !== "asneeded" ? (
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-ink-2">Reminder times</span>
            <div className="space-y-2">
              {sortedTimes.map((t, i) => (
                <div key={`${t}-${i}`} className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Icon name="clock" size={17} />
                  </span>
                  <input
                    type="time"
                    className={cn(inputClass, "flex-1")}
                    value={t}
                    onChange={(e) => {
                      const next = [...draft.times];
                      const idx = draft.times.indexOf(t);
                      next[idx >= 0 ? idx : i] = e.target.value;
                      patch({ times: next });
                    }}
                  />
                  <span className="w-16 text-right text-[11px] font-semibold text-ink-3">
                    {formatTimeShort(t)}
                  </span>
                  {draft.times.length > 1 ? (
                    <button
                      type="button"
                      aria-label="Remove time"
                      onClick={() => patch({ times: draft.times.filter((x) => x !== t) })}
                      className="grid h-9 w-9 place-items-center rounded-xl bg-rose-500/10 text-rose-500"
                    >
                      <Icon name="close" size={15} strokeWidth={2.4} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => patch({ times: [...draft.times, "18:00"] })}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line-strong py-2.5 text-xs font-bold text-ink-2 transition hover:text-brand"
            >
              <Icon name="plus" size={15} strokeWidth={2.4} /> Add another time
            </button>
          </div>
        ) : null}

        <Field label="Meal preference">
          <div className="relative">
            <select
              className={cn(inputClass, "pr-10")}
              value={draft.meal}
              onChange={(e) => patch({ meal: e.target.value as MealPreference })}
            >
              {MEALS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <Icon
              name="chevronDown"
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-3"
            />
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start date">
            <input
              type="date"
              className={inputClass}
              value={draft.startDate}
              onChange={(e) => patch({ startDate: e.target.value })}
            />
          </Field>
          <Field label="End date" hint="Optional">
            <input
              type="date"
              className={inputClass}
              value={draft.endDate ?? ""}
              onChange={(e) => patch({ endDate: e.target.value || null })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Doses in stock">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={draft.refillRemaining}
              onChange={(e) => patch({ refillRemaining: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label="Refill alert at">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={draft.refillThreshold}
              onChange={(e) => patch({ refillThreshold: Number(e.target.value) || 0 })}
            />
          </Field>
        </div>

        <Field label="Instructions">
          <textarea
            rows={2}
            className={cn(inputClass, "resize-none")}
            placeholder="e.g. Swallow whole with water"
            value={draft.instructions}
            onChange={(e) => patch({ instructions: e.target.value })}
          />
        </Field>

        <Field label="Notes">
          <textarea
            rows={2}
            className={cn(inputClass, "resize-none")}
            placeholder="Anything else to remember"
            value={draft.notes}
            onChange={(e) => patch({ notes: e.target.value })}
          />
        </Field>
      </div>
    </Sheet>
  );
}
