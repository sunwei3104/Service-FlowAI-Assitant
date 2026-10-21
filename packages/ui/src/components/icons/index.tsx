// Icons copied path-for-path from docs/design/html (they are custom, not lucide).
// Stroke color is currentColor so the parent's text-* token decides the color.
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, strokeWidth = 1.8, children, ...props }: IconProps) {
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
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const icons = {
  home: (p: IconProps) => (
    <Icon {...p}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </Icon>
  ),
  inbox: (p: IconProps) => (
    <Icon {...p}>
      <path d="M4 4h16v16H4z" />
      <path d="M4 14h4l2 3h4l2-3h4" />
    </Icon>
  ),
  device: (p: IconProps) => (
    <Icon {...p}>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 7h6M9 11h6M10 17h4" />
    </Icon>
  ),
  book: (p: IconProps) => (
    <Icon {...p}>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19V5" />
    </Icon>
  ),
  chat: (p: IconProps) => (
    <Icon {...p}>
      <path d="M4 5h16v11H9l-5 4z" />
    </Icon>
  ),
  chart: (p: IconProps) => (
    <Icon {...p}>
      <path d="M5 20V11M12 20V5M19 20v-6" />
      <path d="M3 20h18" />
    </Icon>
  ),
  team: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6" />
    </Icon>
  ),
  sliders: (p: IconProps) => (
    <Icon {...p}>
      <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="18" r="2" />
    </Icon>
  ),
  dashboard: (p: IconProps) => (
    <Icon {...p}>
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </Icon>
  ),
  building: (p: IconProps) => (
    <Icon {...p}>
      <path d="M3 21V8l6-4v17M9 21h12V10l-6-3" />
      <path d="M13 13h4M13 17h4" />
    </Icon>
  ),
  pulse: (p: IconProps) => (
    <Icon {...p}>
      <path d="M3 12h4l3-7 4 14 3-7h4" />
    </Icon>
  ),
  sparkle: (p: IconProps) => (
    <Icon {...p} strokeLinejoin={undefined}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6" />
    </Icon>
  ),
  lock: (p: IconProps) => (
    <Icon {...p}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </Icon>
  ),
  document: (p: IconProps) => (
    <Icon {...p}>
      <path d="M5 4h14v16H5z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </Icon>
  ),
  scan: (p: IconProps) => (
    <Icon {...p}>
      <path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
      <path d="M8 12h8" />
    </Icon>
  ),
  clock: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  ),
  user: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </Icon>
  ),
  bell: (p: IconProps) => (
    <Icon {...p}>
      <path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z" />
      <path d="M10 21h4" />
    </Icon>
  ),
  search: (p: IconProps) => (
    <Icon strokeWidth={2} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </Icon>
  ),
  plus: (p: IconProps) => (
    <Icon strokeWidth={2.2} {...p}>
      <path d="M12 5v14M5 12h14" />
    </Icon>
  ),
  /** Generic mark used on the "เข้าสู่ระบบด้วย Google" button in SignIn.html (not Google's logo). */
  google: (p: IconProps) => (
    <Icon {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12h8M12 3v18" />
    </Icon>
  ),
  chevronDown: (p: IconProps) => (
    <Icon strokeWidth={2} {...p}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  ),
} as const;

export type IconName = keyof typeof icons;

/** ServiceFlow logo mark. `console` variant = amber tile with navy stroke (tokens console-accent / navy). */
export function LogoMark({
  size = 32,
  variant = 'web',
}: {
  size?: number;
  variant?: 'web' | 'console';
}) {
  const tile = variant === 'console' ? 'fill-console-accent' : 'fill-primary';
  const stroke = variant === 'console' ? 'stroke-navy' : 'stroke-on-primary';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" className={tile} />
      <path
        d="M9 20c0-5 14-3 14-8M9 12h4M19 20h4"
        className={stroke}
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
