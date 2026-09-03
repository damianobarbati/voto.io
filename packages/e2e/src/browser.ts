import { chromium, type Browser, type Page } from "playwright";

const headed = process.env.VOTO_E2E_HEADED === "1";

export const openBrowser = async (): Promise<{ browser: Browser; page: Page }> => {
  const browser = await chromium.launch({ channel: "chromium", headless: !headed, slowMo: headed ? 500 : 0 });
  const context = await browser.newContext({ locale: "en", viewport: { width: 1280, height: 700 } });
  const page = await context.newPage();
  return { browser, page };
};

export const type = async ({ page, selector, value }: { page: Page; selector: string; value: string }): Promise<void> => {
  await page.locator(selector).pressSequentially(value, { delay: headed ? 50 : 0 });
};
