import { test, expect } from './fixtures';

test.skip('Timer Flow with Time Travel', async ({ page, extensionId, context }) => {
  console.log('Starting Timer Flow');
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

  console.log('Onboarding Complete');

  // Verify we landed on Timer
  await expect(page.getByText('Simple')).toBeVisible({ timeout: 10000 });

  // Allow React to settle
  console.log('Waiting for React Settle...');
  await page.waitForTimeout(1000);

  // Start Timer (25m)
  console.log('Clicking Start (JS)');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const startBtn = btns.find((b) => b.textContent?.includes('Start'));
    if (startBtn) (startBtn as HTMLElement).click();
    else throw new Error('Start button not found by JS');
  });

  // Verify running state
  await expect(page.locator('h2')).toContainText(/:/);

  // TIME TRAVEL: Skip 24 minutes
  console.log('Time Traveling (24m)');
  let [worker] = context.serviceWorkers();
  if (!worker) worker = await context.waitForEvent('serviceworker');

  await worker.evaluate(async () => {
    await chrome.runtime.sendMessage({
      type: 'DEBUG_ACTION',
      payload: { action: 'skipTime', seconds: 24 * 60 }
    });
  });

  // Verify time updated
  await page.waitForTimeout(1000);
  const timerText = await page.locator('h2').textContent();
  console.log('Timer after skip:', timerText);
  expect(timerText).toMatch(/0[0-1]:\d\d/);

  // TIME TRAVEL: Skip to end
  console.log('Time Traveling (Finish)');
  await worker.evaluate(async () => {
    await chrome.runtime.sendMessage({
      type: 'DEBUG_ACTION',
      payload: { action: 'skipTime', seconds: 300 }
    });
  });

  // Verify completion
  await expect(page.getByText('Start')).toBeVisible({ timeout: 5000 });
  console.log('Timer Test Complete');
});
