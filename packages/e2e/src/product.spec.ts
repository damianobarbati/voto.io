import { afterEach, describe, expect, it } from "vitest";
import type { Browser, Page } from "playwright";
import { openBrowser } from "./browser.ts";

const webappUrl = "http://localhost:3000";
let browser: Browser | undefined;
let page: Page | undefined;

const open = async ({ path, mobile = false }: { path: string; mobile?: boolean }): Promise<Page> => {
  const result = await openBrowser();
  browser = result.browser;
  page = result.page;
  if (mobile) await page.setViewportSize({ width: 480, height: 700 });
  await page.goto(`${webappUrl}${path}`);
  return page;
};

afterEach(async () => {
  if (browser) await browser.close();
  browser = undefined;
  page = undefined;
});

describe.sequential("voto user flows", () => {
  it("lets visitors browse polls", async () => {
    const currentPage = await open({ path: "/poll/list" });
    await expect(currentPage.getByRole("heading", { name: "Polls" })).toBeVisible();
    await currentPage.locator("article").first().getByRole("link", { name: "Open poll" }).click();
    await expect(currentPage.getByText("Votes cast")).toBeVisible();
  });

  it("shows the mobile live poll entry flow", async () => {
    const currentPage = await open({ path: "/live-poll/101/vote", mobile: true });
    await currentPage.getByRole("button", { name: "Continue" }).click();
    await expect(currentPage.getByRole("heading", { name: "Waiting for the poll" })).toBeVisible();
  });
});
