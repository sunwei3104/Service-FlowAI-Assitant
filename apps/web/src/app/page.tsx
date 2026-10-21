import { redirect } from 'next/navigation';

import { routes } from '@/config/routes';

// No marketing page yet (plan §5 lists (marketing)/page.tsx, no design) → go to sign-in.
export default function RootPage() {
  redirect(routes.signIn());
}
