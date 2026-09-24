import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  
  // Desktop
  const contextDesktop = await browser.newContext({ viewport: { width: 1440, height: 1024 } });
  const pageDesktop = await contextDesktop.newPage();
  await pageDesktop.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  // Scroll to bottom slowly to trigger framer-motion
  for(let i = 0; i < 5; i++) {
    await pageDesktop.mouse.wheel(0, 800);
    await pageDesktop.waitForTimeout(400);
  }
  // Scroll back up
  for(let i = 0; i < 5; i++) {
    await pageDesktop.mouse.wheel(0, -800);
    await pageDesktop.waitForTimeout(100);
  }

  await pageDesktop.screenshot({ path: 'screenshots/landing-desktop.png', fullPage: true });
  
  // Mobile
  const contextMobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const pageMobile = await contextMobile.newPage();
  await pageMobile.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Scroll to bottom slowly
  for(let i = 0; i < 8; i++) {
    await pageMobile.mouse.wheel(0, 800);
    await pageMobile.waitForTimeout(400);
  }
  for(let i = 0; i < 8; i++) {
    await pageMobile.mouse.wheel(0, -800);
    await pageMobile.waitForTimeout(100);
  }

  await pageMobile.screenshot({ path: 'screenshots/landing-mobile.png', fullPage: true });

  await browser.close();
  console.log("Screenshots saved to screenshots/");
})();
