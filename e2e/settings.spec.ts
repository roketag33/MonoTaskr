import { test, expect } from './fixtures';

test.skip('Settings Flow', async ({ page, extensionId, context }) => {
  console.log('Starting Settings Flow');
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

  // Verify we landed on Timer
  console.log('Waiting for Timer View (Simple)');
  await expect(page.getByText('Simple')).toBeVisible({ timeout: 10000 });

  // Allow React to settle
  console.log('Waiting for React Settle...');
  await page.waitForTimeout(1000);

  // Navigate to Settings
  console.log('Clicking Settings (JS)');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const settingsBtn = btns.find((b) => b.textContent?.includes('Settings'));
    if (settingsBtn) (settingsBtn as HTMLElement).click();
    else throw new Error('Settings button not found by JS');
  });

  // Wait for header
  console.log('Waiting for Settings Header');
  await expect(page.getByText('Show timer in tab title')).toBeVisible();

  // Test 1: Toggle Tab Title
  const switchLocator = page.locator('#tab-title');
  await expect(switchLocator).toBeChecked(); // Default true
  await switchLocator.click();
  await expect(switchLocator).not.toBeChecked();

  // Test 2: Switch Blocking Mode
  await page.getByText('Whitelist').click();

  // Verify storage update via worker
  // Lazy load worker
  console.log('Getting Worker');
  let [worker] = context.serviceWorkers();
  if (!worker) worker = await context.waitForEvent('serviceworker');

  console.log('Evaluating Worker');
  const mode = await worker.evaluate(async () => {
    const s = await chrome.storage.sync.get('blocking_mode');
    return s.blocking_mode;
  });
  expect(mode).toBe('WHITELIST');

  // Test 3: Add Site
  const input = page.getByPlaceholder('e.g. facebook.com').or(page.getByPlaceholder('example.com'));
  await input.fill('test-site.com');
  await page.locator('.lucide-plus').click(); // Plus icon

  await expect(page.getByText('test-site.com')).toBeVisible();

  // Test 4: Remove Site
  await page.locator('.lucide-trash-2').click();
  await expect(page.getByText('test-site.com')).not.toBeVisible();

  console.log('Settings Test Complete');
});
