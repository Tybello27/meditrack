import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Medication, ScreenId } from "./types";
import { StoreProvider, useStore } from "./store/store";
import { useInstall } from "./hooks/useInstall";
import { BottomNav, SideNav } from "./components/Nav";
import { Toasts } from "./components/Toasts";
import { MedFormSheet } from "./components/MedForm";
import { MedDetailSheet } from "./components/MedDetail";
import {
  NotificationCenter,
  useNotificationCount,
} from "./components/NotificationCenter";
import { InstallButton } from "./components/PWA";
import { Button, Sheet } from "./components/ui";
import { Icon } from "./components/Icon";
import { HomeScreen } from "./screens/Home";
import { MedicationsScreen } from "./screens/Medications";
import { ScheduleScreen } from "./screens/Schedule";
import { ProgressScreen } from "./screens/Progress";
import { HistoryScreen } from "./screens/History";
import { SettingsScreen } from "./screens/Settings";

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const { meds, addMed, updateMed, removeMed, settings, patchSettings, pushToast } = useStore();
  const install = useInstall();
  const notificationCount = useNotificationCount();

  const [screen, setScreen] = useState<ScreenId>("home");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Medication | null>(null);

  const detail = useMemo(
    () => (detailId ? (meds.find((m) => m.id === detailId) ?? null) : null),
    [detailId, meds]
  );

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const target = params.get("screen");
      if (target === "add") setFormOpen(true);
      else if (target && ["home", "meds", "schedule", "progress", "settings"].includes(target)) {
        setScreen(target as ScreenId);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const openMed = (med: Medication) => {
    setDetailId(med.id);
    setNotifOpen(false);
  };

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const navigate = (id: ScreenId) => {
    setScreen(id);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderScreen = () => {
    switch (screen) {
      case "meds":
        return <MedicationsScreen onOpenMed={openMed} onAdd={openAdd} />;
      case "schedule":
        return <ScheduleScreen onOpenMed={openMed} />;
      case "progress":
        return <ProgressScreen onOpenMed={openMed} onNavigate={navigate} />;
      case "history":
        return <HistoryScreen onOpenMed={openMed} onBack={() => navigate("progress")} />;
      case "settings":
        return <SettingsScreen install={install} onNavigate={navigate} />;
      default:
        return (
          <HomeScreen
            onOpenMed={openMed}
            onAdd={openAdd}
            onNavigate={navigate}
            onOpenNotifications={() => setNotifOpen(true)}
            notificationCount={notificationCount}
            install={install}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen bg-canvas">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[320px] bg-gradient-to-b from-blue-500/8 via-violet-500/5 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-[1360px]">
        <SideNav active={screen} onNavigate={navigate} onAdd={openAdd} />

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-lg px-4 pb-32 pt-[max(env(safe-area-inset-top),1rem)] lg:max-w-4xl lg:px-8 lg:pb-16 lg:pt-8 xl:max-w-5xl">
            <div className="mb-4 hidden items-center justify-end gap-2 lg:flex">
              <InstallButton install={install} />
              <button
                type="button"
                aria-label="Toggle theme"
                onClick={() =>
                  patchSettings({ theme: settings.theme === "dark" ? "light" : "dark" })
                }
                className="grid h-10 w-10 place-items-center rounded-2xl border border-line bg-surface text-ink-2 shadow-[var(--shadow-soft)]"
              >
                <Icon name={settings.theme === "dark" ? "sun" : "moon"} size={18} />
              </button>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotifOpen(true)}
                className="relative grid h-10 w-10 place-items-center rounded-2xl border border-line bg-surface text-ink-2 shadow-[var(--shadow-soft)]"
              >
                <Icon name="bell" size={18} />
                {notificationCount > 0 ? (
                  <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-[color:var(--canvas)]">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                ) : null}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={screen}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              >
                {renderScreen()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <BottomNav active={screen} onNavigate={navigate} onAdd={openAdd} />

      <MedFormSheet
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={(med) => {
          if (editing) {
            updateMed(med);
            pushToast({ title: `${med.name} updated`, tone: "success" });
          } else {
            addMed(med);
            pushToast({
              title: `${med.name} added`,
              body: "Reminders are now active",
              tone: "success",
            });
          }
        }}
      />

      <MedDetailSheet
        med={detail}
        open={Boolean(detail)}
        onClose={() => setDetailId(null)}
        onEdit={(med) => {
          setEditing(med);
          setDetailId(null);
          setFormOpen(true);
        }}
        onDelete={(med) => {
          setDetailId(null);
          setPendingDelete(med);
        }}
      />

      <NotificationCenter
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        onOpenMed={openMed}
      />

      <Sheet
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title={`Delete ${pendingDelete?.name ?? "medication"}?`}
        maxWidth="max-w-sm"
      >
        <p className="text-sm leading-relaxed text-ink-2">
          This removes the medication, its schedule and its dose history from this device. This
          cannot be undone.
        </p>
        <div className="mt-5 flex gap-2">
          <Button variant="soft" full onClick={() => setPendingDelete(null)}>
            Keep it
          </Button>
          <Button
            variant="danger"
            full
            icon="trash"
            onClick={() => {
              if (pendingDelete) {
                removeMed(pendingDelete.id);
                pushToast({ title: `${pendingDelete.name} deleted`, tone: "warn" });
              }
              setPendingDelete(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Sheet>

      <Toasts />
    </div>
  );
}
