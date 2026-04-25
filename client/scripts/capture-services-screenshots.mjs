import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { chromium } from 'playwright';

const baseUrl = process.env.SCREENSHOT_BASE_URL || 'http://127.0.0.1:4173';
const outputDir = process.env.SCREENSHOT_OUTPUT_DIR || '/tmp/screenshots/cleanar-services';

const targets = [
  { name: 'services-desktop', route: '/products-and-services', viewport: { width: 1440, height: 1200 } },
  { name: 'services-mobile', route: '/products-and-services', viewport: { width: 390, height: 844 } }
];

const run = async () => {
  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    for (const target of targets) {
      const page = await browser.newPage({ viewport: target.viewport });
      const url = new URL(target.route, baseUrl).toString();
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(1200);
      await page.screenshot({
        path: path.join(outputDir, `${target.name}.png`),
        fullPage: true
      });
      await page.close();
      console.log(`Saved ${target.name}.png from ${url}`);
    }
  } finally {
    await browser.close();
  }

  console.log(`Screenshots written to ${outputDir}`);
};

run().catch((error) => {
  console.error('Failed to capture service screenshots. Ensure the app is running and Playwright browsers are installed.');
  console.error(error);
  process.exitCode = 1;
});
