// Sample data from the designs (สมาร์ทเวนด์, นภา, สมชาย …). Typed against the contract so it cannot drift.
import type { Schemas } from '@/lib/api/client';

import { uuid } from './time';

export const TENANT = {
  id: uuid('tenant', 1),
  slug: 'smartvend',
  name: 'บริษัท สมาร์ทเวนด์ จำกัด',
  planName: 'Pilot',
} as const;

export const users = {
  napa: { id: uuid('user', 1), displayName: 'นภา วงศ์ดี', avatarUrl: null },
  somchai: { id: uuid('user', 2), displayName: 'สมชาย ก.', avatarUrl: null },
  wichai: { id: uuid('user', 3), displayName: 'วิชัย ร.', avatarUrl: null },
  pakorn: { id: uuid('user', 4), displayName: 'ปกรณ์ ส.', avatarUrl: null },
  anan: { id: uuid('user', 5), displayName: 'อนันต์ ท.', avatarUrl: null },
} satisfies Record<string, Schemas['UserRef']>;

/** Invite link for local testing: /sign-in?invite=<this>. Any other token → 404. */
export const MOCK_INVITE_TOKEN = 'mock-invite-token-smartvend-0001';

/** Which signed-in user the mock API pretends to be. Switch to `somchai` to see the technician flow. */
export const mockSession = {
  user: users.napa,
  role: 'admin' as Schemas['TenantRole'],
};

export function buildMe(): Schemas['Me'] {
  return {
    user: { ...mockSession.user, email: 'napa@smartvend.example', available: true },
    memberships: [
      {
        tenantId: TENANT.id,
        tenantSlug: TENANT.slug,
        tenantName: TENANT.name,
        planName: TENANT.planName,
        role: mockSession.role,
      },
    ],
    activeTenantId: TENANT.id,
    sampleData: true,
  };
}
