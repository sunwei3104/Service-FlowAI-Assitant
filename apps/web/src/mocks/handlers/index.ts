import { http, HttpResponse } from 'msw';

import { assetHandlers } from './assets';
import { knowledgeHandlers } from './knowledge';
import { lineHandlers } from './line';
import { reportHandlers } from './reports';
import { sessionHandlers } from './session';
import { teamHandlers } from './team';
import { ticketHandlers } from './tickets';

/** Fake object storage for presigned uploads/downloads returned by the mock API. */
const storageHandlers = [
  http.put('*/mock-upload/*', () => new HttpResponse(null, { status: 200 })),
  http.get('*/mock-download/*', () => new HttpResponse('mock file', { status: 200 })),
];

export const handlers = [
  ...sessionHandlers,
  ...ticketHandlers,
  ...assetHandlers,
  ...knowledgeHandlers,
  ...lineHandlers,
  ...teamHandlers,
  ...reportHandlers,
  ...storageHandlers,
];
