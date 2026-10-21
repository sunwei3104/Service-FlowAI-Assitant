import { colorHex } from '@serviceflow/ui-tokens';
import type { MetadataRoute } from 'next';

// PWA manifest for technicians (plan §4.2 "Web App Manifest"). Colors come from tokens, not hex literals.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ServiceFlow AI',
    short_name: 'ServiceFlow',
    description: 'งานของฉัน — สำหรับช่าง',
    lang: 'th',
    start_url: '/',
    display: 'standalone',
    background_color: colorHex['surface-200'],
    theme_color: colorHex.navy,
  };
}
