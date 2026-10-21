import '@testing-library/jest-dom/vitest';

import { resetMockDb } from './src/mocks/db';
import { server } from './src/mocks/server';

// Component tests hit the same MSW handlers the dev server uses → one source of fake data.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetMockDb();
});
afterAll(() => server.close());
