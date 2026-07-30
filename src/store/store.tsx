import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { AppData, DoseLog, Medication, Settings } from "../types";
import { loadData, saveData, uid } from "../lib/storage";
import { buildSeed } from "../lib/seed";
import { logKey } from "../lib/schedule";
import { todayKey } from "../lib/date";

type Action =
  | { type: "add"; med: Medication }
  | { type: "update"; med: Medication }
  | { type: "remove"; id: string }
  | { type: "pause"; id: string; paused: boolean }
  | { type: "refill"; id: string; amount: number }
  | { type: "log"; log: DoseLog }
  | { type: "unlog"; key: string }
  | { type: "settings"; patch: Partial<Settings> }
  | { type: "reset" }
  | { type: "clearHistory" }
  | { type: "replace"; data: AppData };

function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "add":
      return { ...state, meds: [action.med, ...state.meds] };
    case "update":
      return {
        ...state,
        meds: state.meds.map((m) => (m.id === action.med.id ? action.med : m)),
      };
    case "remove": {
      const logs = { ...state.logs };
      for (const key of Object.keys(logs)) {
        if (logs[key].medId === action.id) delete logs[key];
      }
      return { ...state, meds: state.meds.filter((m) => m.id !== action.id), logs };
    }
    case "pause":
      return {
        ...state,
        meds: state.meds.map((m) =>
          m.id === action.id ? { ...m, paused: action.paused } : m
        ),
      };
    case "refill":
      return {
        ...state,
        meds: state.meds.map((m) =>
          m.id === action.id
            ? { ...m, refillRemaining: Math.max(0, m.refillRemaining + action.amount) }
            : m
        ),
      };
    case "log": {
      const logs = { ...state.logs, [action.log.id]: action.log };
      const meds = state.meds.map((m) => {
        if (m.id !== action.log.medId) return m;
        if (action.log.status !== "taken") return m;
        return { ...m, refillRemaining: Math.max(0, m.refillRemaining - 1) };
      });
      return { ...state, logs, meds };
    }
    case "unlog": {
      const logs = { ...state.logs };
      delete logs[action.key];
      return { ...state, logs };
    }
    case "settings":
      return { ...state, settings: { ...state.settings, ...action.patch } };
    case "clearHistory":
      return { ...state, logs: {} };
    case "reset":
      return buildSeed();
    case "replace":
      return action.data;
    default:
      return state;
  }
}

export interface Toast {
  id: string;
  title: string;
  body?: string;
  tone?: "default" | "success" | "warn" | "danger" | "info";
  icon?: string;
}

/** Soft two-note chime played with the Web Audio API (no assets required). */
function playChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const notes = [880, 1174.66];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });
    window.setTimeout(() => ctx.close().catch(() => undefined), 1600);
  } catch {
    /* audio unavailable */
  }
}

interface StoreValue {
  data: AppData;
  meds: Medication[];
  logs: Record<string, DoseLog>;
  settings: Settings;
  now: number;
  toasts: Toast[];
  addMed: (med: Medication) => void;
  updateMed: (med: Medication) => void;
  removeMed: (id: string) => void;
  setPaused: (id: string, paused: boolean) => void;
  refill: (id: string, amount: number) => void;
  logDose: (
    medId: string,
    date: string,
    time: string,
    status: DoseLog["status"]
  ) => void;
  clearLog: (key: string) => void;
  patchSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
  clearHistory: () => void;
  pushToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, undefined, loadData);
  const [now, setNow] = useState(() => Date.now());
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notified = useRef<Set<string>>(new Set());

  useEffect(() => {
    saveData(data);
  }, [data]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", data.settings.theme === "dark");
  }, [data.settings.theme]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 20000);
    const onVisible = () => setNow(Date.now());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const pushToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = uid("toast");
    setToasts((list) => [...list.slice(-2), { ...toast, id }]);
    window.setTimeout(() => {
      setToasts((list) => list.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  // Reminder engine — fires in-app toasts (and native notifications when allowed)
  useEffect(() => {
    const today = todayKey();
    const lead = data.settings.reminderLead * 60000;
    for (const med of data.meds) {
      if (med.paused) continue;
      for (const time of med.times) {
        const [h, m] = time.split(":").map(Number);
        const target = new Date();
        target.setHours(h || 0, m || 0, 0, 0);
        const delta = target.getTime() - now;
        const key = `${med.id}|${today}|${time}`;
        if (data.logs[key]) continue;
        if (delta <= lead && delta > -60000 && !notified.current.has(key)) {
          notified.current.add(key);
          if (data.settings.sound) playChime();
          pushToast({
            title: `Time for ${med.name}`,
            body: `${med.dosage} · ${med.strength} — scheduled reminder`,
            tone: "info",
          });
          if (
            data.settings.notifications &&
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            try {
              new Notification(`MediTrack · ${med.name}`, {
                body: `${med.dosage} · ${med.strength}`,
                icon: "./icons/icon-192.png",
                tag: key,
              });
            } catch {
              /* notification failed silently */
            }
          }
        }
      }
    }
  }, [
    now,
    data.meds,
    data.logs,
    data.settings.notifications,
    data.settings.sound,
    data.settings.reminderLead,
    pushToast,
  ]);

  const value = useMemo<StoreValue>(
    () => ({
      data,
      meds: data.meds,
      logs: data.logs,
      settings: data.settings,
      now,
      toasts,
      addMed: (med) => dispatch({ type: "add", med }),
      updateMed: (med) => dispatch({ type: "update", med }),
      removeMed: (id) => dispatch({ type: "remove", id }),
      setPaused: (id, paused) => dispatch({ type: "pause", id, paused }),
      refill: (id, amount) => dispatch({ type: "refill", id, amount }),
      logDose: (medId, date, time, status) =>
        dispatch({
          type: "log",
          log: {
            id: logKey(medId, date, time),
            medId,
            date,
            time,
            status,
            loggedAt: Date.now(),
          },
        }),
      clearLog: (key) => dispatch({ type: "unlog", key }),
      patchSettings: (patch) => dispatch({ type: "settings", patch }),
      resetAll: () => dispatch({ type: "reset" }),
      clearHistory: () => dispatch({ type: "clearHistory" }),
      pushToast,
      dismissToast,
    }),
    [data, now, toasts, pushToast, dismissToast]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
