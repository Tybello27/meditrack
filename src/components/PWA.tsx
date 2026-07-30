import { AnimatePresence, motion } from "framer-motion";
import { useInstall } from "../hooks/useInstall";
import { useStore } from "../store/store";
import { Icon } from "./Icon";
import { Button } from "./ui";

/** Compact header button — only rendered when the browser fired beforeinstallprompt. */
export function InstallButton({ install }: { install: ReturnType<typeof useInstall> }) {
  const { pushToast } = useStore();
  if (!install.canInstall) return null;
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.94 }}
      onClick={async () => {
        const outcome = await install.promptInstall();
        if (outcome === "accepted")
          pushToast({ title: "Installing MediTrack", body: "Look for the app on your home screen", tone: "success" });
      }}
      className="flex items-center gap-1.5 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 px-3 py-2 text-[11px] font-bold text-white shadow-[0_10px_20px_-12px_rgba(59,130,246,1)]"
    >
      <Icon name="download" size={14} strokeWidth={2.4} />
      Install
    </motion.button>
  );
}

/** Full install panel used on the Settings screen. Adapts to every environment. */
export function InstallPanel({ install }: { install: ReturnType<typeof useInstall> }) {
  const { pushToast } = useStore();

  if (install.installed) {
    return (
      <Wrap tone="mint" icon="checkCircle" title="MediTrack is installed">
        <p className="text-[13px] leading-relaxed text-ink-2">
          You are running the installed app. It works fully offline — your schedule, history and
          reminders are stored on this device.
        </p>
      </Wrap>
    );
  }

  if (install.embedded) {
    return (
      <Wrap tone="lav" icon="share" title="Open in a browser tab to install">
        <p className="text-[13px] leading-relaxed text-ink-2">
          You are viewing MediTrack inside an embedded preview. Installation is blocked here — open
          the app in a new browser tab, then use the Install button.
        </p>
        <Button className="mt-3" variant="lav" icon="arrowRight" onClick={install.openInNewTab}>
          Open in new tab
        </Button>
      </Wrap>
    );
  }

  if (install.canInstall) {
    return (
      <Wrap tone="blue" icon="download" title="Install MediTrack">
        <p className="text-[13px] leading-relaxed text-ink-2">
          Add MediTrack to your home screen for full-screen, offline access and faster launches.
        </p>
        <Button
          className="mt-3"
          icon="download"
          onClick={async () => {
            const outcome = await install.promptInstall();
            if (outcome === "accepted")
              pushToast({ title: "Installing MediTrack", tone: "success" });
            if (outcome === "dismissed")
              pushToast({ title: "Install dismissed", body: "You can install anytime", tone: "warn" });
          }}
        >
          Install app
        </Button>
      </Wrap>
    );
  }

  if (install.ios) {
    return (
      <Wrap tone="blue" icon="share" title="Add to Home Screen">
        <ol className="mt-1 space-y-2 text-[13px] leading-relaxed text-ink-2">
          <Step n={1}>
            Tap the <b>Share</b> icon <Icon name="share" size={13} className="inline align-[-2px]" /> in
            the Safari toolbar.
          </Step>
          <Step n={2}>
            Scroll and choose <b>Add to Home Screen</b>.
          </Step>
          <Step n={3}>
            Tap <b>Add</b> — MediTrack will launch full screen like a native app.
          </Step>
        </ol>
      </Wrap>
    );
  }

  return (
    <Wrap tone="neutral" icon="info" title="Install available in supported browsers">
      <p className="text-[13px] leading-relaxed text-ink-2">
        MediTrack already works offline. To install it, open this page in Chrome, Edge or Safari and
        use your browser’s “Install app” / “Add to Home Screen” option.
      </p>
    </Wrap>
  );
}

/** iOS-only banner shown on the dashboard (iOS cannot fire beforeinstallprompt). */
export function IosInstallBanner({ install }: { install: ReturnType<typeof useInstall> }) {
  const { settings, patchSettings } = useStore();
  const show = install.ios && !install.installed && !install.embedded && !settings.hideIosBanner;

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0, y: -12, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className="overflow-hidden"
        >
          <div className="mb-4 flex items-start gap-3 rounded-3xl border border-blue-500/25 bg-blue-500/8 p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <Icon name="share" size={18} strokeWidth={2.1} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-ink">Add MediTrack to your Home Screen</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-ink-2">
                In Safari tap <b>Share</b> → <b>Add to Home Screen</b> → <b>Add</b> to install the app
                on your iPhone.
              </p>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => patchSettings({ hideIosBanner: true })}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface text-ink-3"
            >
              <Icon name="close" size={13} strokeWidth={2.6} />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Preview-environment notice — shown instead of an install button inside iframes. */
export function EmbeddedNotice({ install }: { install: ReturnType<typeof useInstall> }) {
  if (!install.embedded || install.installed) return null;
  return (
    <div className="mb-4 flex items-start gap-3 rounded-3xl border border-violet-500/25 bg-violet-500/8 p-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 text-white">
        <Icon name="info" size={18} strokeWidth={2.1} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-bold text-ink">Running in an embedded preview</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-ink-2">
          App installation is disabled inside preview frames. Open MediTrack in a new browser tab to
          install it as a PWA.
        </p>
        <button
          type="button"
          onClick={install.openInNewTab}
          className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-violet-500 px-3 py-1.5 text-[11px] font-bold text-white"
        >
          Open in new tab <Icon name="arrowRight" size={12} strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}

function Wrap({
  tone,
  icon,
  title,
  children,
}: {
  tone: "blue" | "mint" | "lav" | "neutral";
  icon: "download" | "checkCircle" | "share" | "info";
  title: string;
  children: React.ReactNode;
}) {
  const tones = {
    blue: "from-blue-500 to-blue-600",
    mint: "from-emerald-500 to-emerald-600",
    lav: "from-violet-500 to-violet-600",
    neutral: "from-slate-400 to-slate-500",
  };
  return (
    <div className="rounded-3xl border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="mb-2 flex items-center gap-3">
        <span
          className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${tones[tone]} text-white`}
        >
          <Icon name={icon} size={19} strokeWidth={2.1} />
        </span>
        <p className="text-sm font-bold text-ink">{title}</p>
      </div>
      {children}
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-500/14 text-[10px] font-bold text-blue-600 dark:text-blue-400">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}
