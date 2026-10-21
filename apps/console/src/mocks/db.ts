// In-memory data for console MSW handlers — the only mutable mock state. Reset between tests.
import {
  buildAlerts,
  buildDeadJobs,
  buildOperator,
  buildOverview,
  buildTenants,
} from './fixtures/platform';
import type { Schemas } from '@/lib/api/client';

function seed() {
  return {
    operator: buildOperator(),
    tenants: buildTenants(),
    overview: buildOverview(),
    alerts: buildAlerts(),
    queue: buildDeadJobs(),
    grants: [] as (Schemas['SupportAccessGrant'] & { tenantId: string })[],
    idempotency: new Map<string, unknown>(),
    passkey: { registered: true, failures: 0, lockedUntil: null as string | null },
  };
}

export let db = seed();

export function resetMockDb() {
  db = seed();
}
