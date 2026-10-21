import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** WCAG 2.1 AA check (plan §2.2). Fails the test on any violation. */
export async function expectNoA11yViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .exclude('nextjs-portal') // Next.js dev overlay, not part of the app
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`)).toEqual([]);
}
