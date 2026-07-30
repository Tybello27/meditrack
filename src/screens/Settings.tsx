import { useState } from "react";
import { motion } from "framer-motion";
import type { ScreenId } from "../types";
import { useStore } from "../store/store";
import { useInstall } from "../hooks/useInstall";
import { STORAGE_KEY } from "../lib/storage";
import { Icon } from "../components/Icon";
import type { IconName } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { InstallPanel } from "../components/PWA";
import { Button, Segmented, Sheet, Toggle, inputClass } from "../components/ui";
import { cn } from "../utils/cn";

export function SettingsScreen({
  install,
  onNavigate,
}: {
  install: ReturnType<typeof useInstall>;
  onNavigate: (id: ScreenId) => void;
}) {
  const { settings, patchSettings, meds, logs, resetAll, clearHistory, pushToast } = useStore();
  const [confirm, setConfirm] = useState<null | "reset" | "history">(null);

  const requestNotifications = async (enabled: boolean) => {
    if (!enabled) {
      patchSettings({ notifications: false });
      return;
    }
    if (!("Notification" in window)) {
      pushToast({ title: "Notifications not supported here", tone: "warn" });
      return;
    }
    const permission = await Notification.requestPermission();
    patchSettings({ notifications: permission === "granted" });
    pushToast({
      title: permission === "granted" ? "Dose reminders enabled" : "Permission denied",
      tone: permission === "granted" ? "success" : "warn",
    });
  };

  const exportData = () => {
    try {
      const payload = localStorage.getItem(STORAGE_KEY) ?? "{}";
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "meditrack-data.json";
      a.click();
      URL.revokeObjectURL(url);
      pushToast({ title: "Backup downloaded", body: "meditrack-data.json", tone: "success" });
    } catch {
      pushToast({ title: "Export failed", tone: "danger" });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Preferences" title="Settings" />

      <section className="flex items-center gap-3.5 rounded-3xl border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-xl font-extrabold text-white shadow-[0_14px_26px_-14px_rgba(59,130,246,1)]">
          {(settings.userName || "M").trim().charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-[11px] font-semibold text-ink-2">
            Your name — used in the greeting
          </label>
          <input
            value={settings.userName}
            onChange={(e) => patchSettings({ userName: e.target.value })}
            placeholder="Michael"
            maxLength={24}
            className={cn(inputClass, "py-2.5 text-[13px] font-semibold")}
          />
        </div>
      </section>

      <Group title="Appearance" icon="sun">
        <div className="flex items-center justify-between gap-4 px-1 py-2">
          <div>
            <p className="text-[13px] font-bold text-ink">Theme</p>
            <p className="text-[11px] text-ink-3">Choose a calm look for day or night</p>
          </div>
          <Segmented
            className="w-[168px]"
            value={settings.theme}
            onChange={(v) => patchSettings({ theme: v })}
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </div>
        <Row
          icon="list"
          title="Compact medication cards"
          subtitle="Reduce padding for denser lists"
          right={
            <Toggle
              label="Compact cards"
              checked={settings.compactCards}
              onChange={(v) => patchSettings({ compactCards: v })}
            />
          }
        />
      </Group>

      <Group title="Reminders" icon="bell">
        <Row
          icon="bellRing"
          title="Dose notifications"
          subtitle="Gentle nudge when a dose is due"
          right={
            <Toggle
              label="Dose notifications"
              checked={settings.notifications}
              onChange={requestNotifications}
            />
          }
        />
        <Row
          icon="bolt"
          title="Reminder sound"
          subtitle="Play a soft chime with reminders"
          right={
            <Toggle
              label="Reminder sound"
              checked={settings.sound}
              onChange={(v) => patchSettings({ sound: v })}
            />
          }
        />
        <div className="px-1 py-2">
          <p className="mb-2 text-[13px] font-bold text-ink">Remind me before</p>
          <div className="flex gap-2">
            {[0, 5, 10, 30].map((lead) => (
              <button
                key={lead}
                type="button"
                onClick={() => patchSettings({ reminderLead: lead })}
                className={cn(
                  "flex-1 rounded-2xl px-3 py-2.5 text-xs font-bold transition",
                  settings.reminderLead === lead
                    ? "bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-[0_10px_20px_-12px_rgba(59,130,246,1)]"
                    : "bg-surface-3 text-ink-2"
                )}
              >
                {lead === 0 ? "On time" : `${lead} min`}
              </button>
            ))}
          </div>
        </div>
      </Group>

      <div>
        <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-ink-3">
          <Icon name="download" size={13} /> App installation
        </p>
        <InstallPanel install={install} />
      </div>

      <Group title="Your data" icon="shield">
        <Row
          icon="history"
          title="Medication history"
          subtitle={`${Object.keys(logs).length} logged doses`}
          onClick={() => onNavigate("history")}
          right={<Icon name="chevronRight" size={16} className="text-ink-3" />}
        />
        <Row
          icon="download"
          title="Export backup"
          subtitle="Download your data as JSON"
          onClick={exportData}
          right={<Icon name="chevronRight" size={16} className="text-ink-3" />}
        />
        <Row
          icon="undo"
          title="Clear dose history"
          subtitle="Keep medications, remove all logs"
          onClick={() => setConfirm("history")}
          right={<Icon name="chevronRight" size={16} className="text-ink-3" />}
        />
        <Row
          icon="trash"
          title="Reset app data"
          subtitle="Restore the demo medication set"
          danger
          onClick={() => setConfirm("reset")}
          right={<Icon name="chevronRight" size={16} className="text-rose-400" />}
        />
      </Group>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-line bg-gradient-to-br from-blue-500/10 via-violet-500/8 to-emerald-500/10 p-5 text-center"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_16px_28px_-16px_rgba(59,130,246,1)]">
          <Icon name="heartPulse" size={26} strokeWidth={2} />
        </div>
        <p className="mt-3 text-base font-extrabold text-ink">MediTrack</p>
        <p className="text-[11px] font-semibold text-ink-3">Your calm care companion · v1.0.0</p>
        <p className="mx-auto mt-3 max-w-sm text-[12px] leading-relaxed text-ink-2">
          {meds.length} medications tracked on this device. MediTrack is offline-first — nothing
          leaves your phone, and everything keeps working without a connection.
        </p>
      </motion.div>

      <Sheet
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === "reset" ? "Reset app data?" : "Clear dose history?"}
        maxWidth="max-w-sm"
      >
        <p className="text-sm leading-relaxed text-ink-2">
          {confirm === "reset"
            ? "This removes your medications and logs, then restores the sample data set. This cannot be undone."
            : "All logged doses will be deleted. Your medications and schedules stay untouched."}
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="soft" full onClick={() => setConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            full
            onClick={() => {
              if (confirm === "reset") {
                resetAll();
                pushToast({ title: "App data reset", tone: "success" });
              } else {
                clearHistory();
                pushToast({ title: "History cleared", tone: "success" });
              }
              setConfirm(null);
            }}
          >
            Yes, continue
          </Button>
        </div>
      </Sheet>
    </div>
  );
}

function Group({
  title,
  icon,
  children,
}: {
  title: string;
  icon: IconName;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wide text-ink-3">
        <Icon name={icon} size={13} /> {title}
      </p>
      <div className="divide-y divide-[color:var(--line)] rounded-3xl border border-line bg-surface px-3 shadow-[var(--shadow-card)]">
        {children}
      </div>
    </section>
  );
}

function Row({
  icon,
  title,
  subtitle,
  right,
  onClick,
  danger,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-1 py-3 text-left",
        onClick && "transition active:opacity-70"
      )}
    >
      <span
        className={cn(
          "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
          danger
            ? "bg-rose-500/12 text-rose-500"
            : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
        )}
      >
        <Icon name={icon} size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block text-[13px] font-bold", danger ? "text-rose-500" : "text-ink")}>
          {title}
        </span>
        <span className="block truncate text-[11px] text-ink-3">{subtitle}</span>
      </span>
      {right}
    </Comp>
  );
}
