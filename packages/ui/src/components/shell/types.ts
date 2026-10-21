import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';

import type { IconName } from '../icons';

/** Lets each app inject its router link (next/link) while packages/ui stays framework-free. */
export type LinkComponent = ComponentType<
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }
>;

export interface NavItem {
  key: string;
  href: string;
  label: string;
  icon: IconName;
  current?: boolean;
  /** Count bubble (e.g. open tickets). `tone` picks the design's style for that menu. */
  badge?: { value: number; label: string; tone: 'danger' | 'accent' | 'muted' };
}
