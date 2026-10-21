// In-memory data for MSW — the ONLY mutable mock state. Handlers read/write `db.*`.
// resetMockDb() restores every fixture (called after each test) so tests never leak into each other.
import type { Schemas } from '@/lib/api/client';

import { buildMe } from './fixtures/people';
import { buildTickets, categories } from './fixtures/tickets';
import {
  buildAiSettings,
  buildAssets,
  buildDocuments,
  buildLineChannel,
  buildLineSettings,
  buildMembers,
  buildSecurity,
  buildSupportRequests,
} from './fixtures/workspace';

function seed() {
  return {
    me: buildMe(),
    tickets: buildTickets(),
    categories: [...categories],
    attachmentsByTicket: new Map<string, number>(),
    idempotency: new Map<string, unknown>(),
    assets: buildAssets(),
    importJob: null as Schemas['ImportJob'] | null,
    documents: buildDocuments(),
    aiSettings: buildAiSettings(),
    lineChannel: buildLineChannel(),
    lineSettings: buildLineSettings(),
    members: buildMembers(),
    invitations: [] as Schemas['Invitation'][],
    security: buildSecurity(),
    supportRequests: buildSupportRequests(),
  };
}

export let db = seed();

export function resetMockDb() {
  db = seed();
}
