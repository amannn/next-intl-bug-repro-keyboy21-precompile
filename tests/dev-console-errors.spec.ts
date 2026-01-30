import {expect, test} from '@playwright/test';

test('no console errors on /en in dev', async ({page}) => {
  const consoleErrors: Array<string> = [];

  page.on('console', (message) => {
    if (message.type() !== 'error') {
      return;
    }

    consoleErrors.push(message.text());
  });

  page.on('pageerror', (pageError) => {
    consoleErrors.push(String(pageError));
  });

  await page.goto('/en', {waitUntil: 'networkidle'});
  await page.waitForTimeout(2_000);

  expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
});
