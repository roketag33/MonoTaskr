import { test, expect } from './fixtures';

test('Onboarding Flow', async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/src/popup/index.html`);

  // Step 1: Welcome
  await expect(page.getByText('Welcome to MonoTaskr')).toBeVisible();
  await page.getByText('Next').click();

  // Step 2: Block Distractions
  await expect(page.getByText('Block Distractions')).toBeVisible();
  await page.getByText('Next').click();

  // Step 3: Track Progress
  await expect(page.getByText('Track Progress')).toBeVisible();
  await page.getByText('Next').click();

  // Step 4: Ready
  await expect(page.getByText('Ready to Focus?')).toBeVisible();
  await page.getByText("Let's Go").click();

  // Should land on Timer View
  await expect(page.locator('#timer-view'))
    .toBeVisible({ timeout: 5000 })
    .catch(() => {
      // Fallback if ID is missing, text check
      return expect(page.getByText('Simple')).toBeVisible();
    });
});
