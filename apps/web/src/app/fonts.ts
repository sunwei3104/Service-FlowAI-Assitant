import { IBM_Plex_Mono, IBM_Plex_Sans_Thai } from 'next/font/google';

// Self-hosted at build time by next/font (no runtime request to Google).
// The CSS variable names are read by the token theme: --font-sans / --font-mono (packages/ui-tokens).
export const fontSans = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--sf-font-sans-face',
});

export const fontMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--sf-font-mono-face',
});
