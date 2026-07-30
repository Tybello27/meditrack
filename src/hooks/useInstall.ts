import { useCallback, useEffect, useState } from "react";
import type { BeforeInstallPromptEvent } from "../lib/pwa";
import { isEmbedded, isIos, isStandalone } from "../lib/pwa";

export interface InstallState {
  canInstall: boolean;
  installed: boolean;
  embedded: boolean;
  ios: boolean;
  promptInstall: () => Promise<"accepted" | "dismissed" | "unavailable">;
  openInNewTab: () => void;
}

export function useInstall(): InstallState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState<boolean>(() => isStandalone());
  const [embedded] = useState<boolean>(() => isEmbedded());
  const ios = isIos();

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setDeferred(null);
      setInstalled(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt as EventListener);
    window.addEventListener("appinstalled", onInstalled);

    let mq: MediaQueryList | null = null;
    const onChange = () => setInstalled(isStandalone());
    try {
      mq = window.matchMedia("(display-mode: standalone)");
      mq.addEventListener?.("change", onChange);
    } catch {
      mq = null;
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt as EventListener);
      window.removeEventListener("appinstalled", onInstalled);
      mq?.removeEventListener?.("change", onChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferred) return "unavailable" as const;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      return choice.outcome;
    } catch {
      return "unavailable" as const;
    }
  }, [deferred]);

  const openInNewTab = useCallback(() => {
    try {
      window.open(window.location.href, "_blank", "noopener,noreferrer");
    } catch {
      /* popup blocked */
    }
  }, []);

  return {
    canInstall: Boolean(deferred) && !installed && !embedded,
    installed,
    embedded,
    ios,
    promptInstall,
    openInNewTab,
  };
}
