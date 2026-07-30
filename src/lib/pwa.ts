export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (window.location.protocol === "blob:") return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js", { scope: "./" }).catch(() => {
      /* service workers may be unavailable inside sandboxed previews */
    });
  });
}

/** True when the document is rendered inside an iframe (embedded preview). */
export function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  const iOSDevice = /iPad|iPhone|iPod/.test(ua);
  const iPadOS =
    navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1;
  return iOSDevice || iPadOS;
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const displayMode =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: fullscreen)").matches ||
    window.matchMedia?.("(display-mode: minimal-ui)").matches;
  // iOS Safari specific
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean })
    .standalone;
  return Boolean(displayMode || iosStandalone);
}
