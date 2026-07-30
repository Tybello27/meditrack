import type { ReactElement, SVGProps } from "react";

export type IconName =
  | "home"
  | "pill"
  | "capsule"
  | "tablet"
  | "liquid"
  | "injection"
  | "drops"
  | "inhaler"
  | "calendar"
  | "calendarDays"
  | "chart"
  | "settings"
  | "bell"
  | "bellRing"
  | "search"
  | "plus"
  | "check"
  | "checkCircle"
  | "close"
  | "xCircle"
  | "clock"
  | "snooze"
  | "chevronLeft"
  | "chevronRight"
  | "chevronDown"
  | "edit"
  | "trash"
  | "pause"
  | "play"
  | "sun"
  | "moon"
  | "sunrise"
  | "sunset"
  | "flame"
  | "trophy"
  | "package"
  | "filter"
  | "info"
  | "download"
  | "share"
  | "sparkles"
  | "heartPulse"
  | "shield"
  | "alert"
  | "more"
  | "list"
  | "undo"
  | "target"
  | "meal"
  | "activity"
  | "lock"
  | "bolt"
  | "history"
  | "arrowRight";

const PATHS: Record<IconName, ReactElement> = {
  home: (
    <>
      <path d="M3 10.5 12 3.5l9 7" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 20v-5.5h5V20" />
    </>
  ),
  pill: (
    <>
      <rect x="2.5" y="8.5" width="19" height="7" rx="3.5" />
      <path d="M12 8.6v6.8" />
    </>
  ),
  capsule: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="9" transform="rotate(45 12 12)" />
      <path d="M8.5 8.5 15.5 15.5" />
    </>
  ),
  tablet: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M6.5 12h11" />
    </>
  ),
  liquid: (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v4.2L6.6 15a4 4 0 0 0 3.6 5.8h3.6A4 4 0 0 0 17.4 15L14 7.2V3" />
      <path d="M7.3 14h9.4" />
    </>
  ),
  injection: (
    <>
      <path d="m18 2 4 4" />
      <path d="m17 7 3-3" />
      <path d="M19 9 15 5l-8.2 8.2a2 2 0 0 0-.5.9L5 19l4.9-1.3a2 2 0 0 0 .9-.5Z" />
      <path d="m11.5 8.5 4 4" />
    </>
  ),
  drops: (
    <>
      <path d="M12 3s5.5 6 5.5 9.6A5.5 5.5 0 0 1 12 18a5.5 5.5 0 0 1-5.5-5.4C6.5 9 12 3 12 3Z" />
      <path d="M10 21h4" />
    </>
  ),
  inhaler: (
    <>
      <rect x="4" y="9" width="9" height="12" rx="2.5" />
      <path d="M13 12h4a3 3 0 0 1 3 3v1" />
      <path d="M7.5 9V5.5A2.5 2.5 0 0 1 10 3h1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="4" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </>
  ),
  calendarDays: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="4" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
      <circle cx="8.5" cy="14" r=".9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="14" r=".9" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="14" r=".9" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="17.5" r=".9" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17.5" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  chart: (
    <>
      <path d="M3.5 20h17" />
      <path d="M7 20v-6.5M12 20V6M17 20v-9" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 14.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.55-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1.5Z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5" />
      <path d="M13.7 19.5a2 2 0 0 1-3.4 0" />
    </>
  ),
  bellRing: (
    <>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 6-2.5 7.5-2.5 7.5h17S18 14.5 18 8.5" />
      <path d="M13.7 19.5a2 2 0 0 1-3.4 0" />
      <path d="M20.8 4.2a8 8 0 0 1 1.7 3M3.2 4.2a8 8 0 0 0-1.7 3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.6 2.6L16 9.5" />
    </>
  ),
  close: <path d="M6 6 18 18M18 6 6 18" />,
  xCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6M15 9l-6 6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  snooze: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9.5V13l2.5 1.6" />
      <path d="M4.5 4.5 7 3M19.5 4.5 17 3" />
    </>
  ),
  chevronLeft: <path d="m14.5 5-7 7 7 7" />,
  chevronRight: <path d="m9.5 5 7 7-7 7" />,
  chevronDown: <path d="m5 9 7 7 7-7" />,
  edit: (
    <>
      <path d="M12 20h8" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7.5 18.5 3 20l1.5-4.5Z" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
      <path d="M6.5 7 7.4 19a2 2 0 0 0 2 1.9h5.2a2 2 0 0 0 2-1.9L17.5 7" />
      <path d="M10.5 11v6M13.5 11v6" />
    </>
  ),
  pause: (
    <>
      <rect x="7" y="5" width="3.6" height="14" rx="1.4" />
      <rect x="13.4" y="5" width="3.6" height="14" rx="1.4" />
    </>
  ),
  play: <path d="M7 4.8 19 12 7 19.2Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M19.1 4.9l-1.6 1.6M6.5 17.5l-1.6 1.6" />
    </>
  ),
  moon: <path d="M20.5 14.3A8.6 8.6 0 0 1 9.7 3.5a8.6 8.6 0 1 0 10.8 10.8Z" />,
  sunrise: (
    <>
      <path d="M12 3v5M8 6.5 12 3l4 3.5" />
      <path d="M3 17h18M6 20h12" />
      <path d="M6.5 13.5a5.5 5.5 0 0 1 11 0" />
    </>
  ),
  sunset: (
    <>
      <path d="M12 8V3M8 5.5 12 9l4-3.5" />
      <path d="M3 17h18M6 20h12" />
      <path d="M6.5 13.5a5.5 5.5 0 0 1 11 0" />
    </>
  ),
  flame: (
    <>
      <path d="M12 22c3.9 0 6.5-2.6 6.5-6.2 0-4.6-4.4-6.4-3.9-11.3-2.4.8-4.2 3-4.2 5.3 0 1.4-.9 2-1.7 1.3-.7-.6-1-1.6-1-2.6C5.9 10.4 5.5 12.6 5.5 15c0 4.1 2.7 7 6.5 7Z" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v5a5 5 0 0 1-10 0Z" />
      <path d="M7 5.5H4.6A1.6 1.6 0 0 0 3 7.1C3 9.3 4.7 11 7 11M17 5.5h2.4A1.6 1.6 0 0 1 21 7.1c0 2.2-1.7 3.9-4 3.9" />
      <path d="M12 14v3.5M8.5 20.5h7l-.7-3h-5.6Z" />
    </>
  ),
  package: (
    <>
      <path d="M20.5 8.2 12 3.5 3.5 8.2v7.6L12 20.5l8.5-4.7Z" />
      <path d="M3.7 8.1 12 12.6l8.3-4.5M12 12.6v7.9" />
    </>
  ),
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8.2v.2" />
    </>
  ),
  download: (
    <>
      <path d="M12 3.5v11" />
      <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
      <path d="M4.5 19.5h15" />
    </>
  ),
  share: (
    <>
      <path d="M12 15.5V4" />
      <path d="m8 7.5 4-3.5 4 3.5" />
      <path d="M5.5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-6.5" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3.5 13.6 8l4.4 1.6-4.4 1.6L12 15.6 10.4 11.2 6 9.6 10.4 8Z" />
      <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7Z" />
    </>
  ),
  heartPulse: (
    <>
      <path d="M20.4 5.9a5 5 0 0 0-7.1 0l-1.3 1.3-1.3-1.3a5 5 0 1 0-7.1 7.1l8.4 8.4 8.4-8.4a5 5 0 0 0 0-7.1Z" />
      <path d="M3.5 12.5h4l1.6-3 2.4 5.5 1.8-3.2h3.2" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5.5c0 4.3 2.9 8.2 7 9.5 4.1-1.3 7-5.2 7-9.5V6Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 4.3 2.7 17.4A2 2 0 0 0 4.4 20.4h15.2a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4M12 16.7v.2" />
    </>
  ),
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  list: (
    <>
      <path d="M8 6.5h12M8 12h12M8 17.5h12" />
      <circle cx="4.2" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.2" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="4.2" cy="17.5" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  undo: (
    <>
      <path d="M4 9h9.5a5.5 5.5 0 0 1 0 11H8" />
      <path d="m8 4.5-4 4.5 4 4.5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  meal: (
    <>
      <path d="M6 3v8a2.5 2.5 0 0 0 5 0V3" />
      <path d="M8.5 11v10" />
      <path d="M17.5 3c-1.6 1.2-2.5 3-2.5 5.2 0 1.7.8 2.8 2.5 3.3V21" />
    </>
  ),
  activity: <path d="M3 12.5h4l2.5-6 4 12 2.5-6h5" />,
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="3" />
      <path d="M8.5 10.5V7.8a3.5 3.5 0 0 1 7 0v2.7" />
    </>
  ),
  bolt: <path d="M13.5 2 4.8 13.2h6L10.5 22l8.7-11.2h-6Z" />,
  history: (
    <>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3.5 4.5V10h5.5" />
      <path d="M12 8v4.5l3 1.7" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4.5 12h14" />
      <path d="m13 6.5 5.5 5.5L13 17.5" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, strokeWidth = 1.8, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

export const FORM_ICON: Record<string, IconName> = {
  tablet: "tablet",
  capsule: "capsule",
  liquid: "liquid",
  injection: "injection",
  drops: "drops",
  inhaler: "inhaler",
};
