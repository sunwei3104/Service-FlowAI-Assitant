import { typeStyles } from '@serviceflow/ui-tokens';
import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the type scale from tokens.json so `text-body text-ink`
// is not mistaken for two conflicting classes (both start with "text-").
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: Object.keys(typeStyles) }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
