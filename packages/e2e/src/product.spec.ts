import type { Browser, Page } from "playwright";
import { afterEach, describe, it } from "vitest";
import { keepBrowserOpen, openBrowser, pause, type } from "./browser.ts";

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
  if (!keepBrowserOpen && browser) await browser.close();
  if (keepBrowserOpen) return;
  browser = undefined;
  page = undefined;
});

describe("voto user flows", () => {
  it("registers a user from the site", async () => {
    const currentPage = await open({ path: "/register" });
    const email = `e2e-${Date.now()}@example.com`;
    await type({ page: currentPage, selector: "input[name=first_name]", value: "E2E" });
    await type({ page: currentPage, selector: "input[name=last_name]", value: "User" });
    await currentPage.locator("input[name=birth_date]").fill("1990-01-01");
    await currentPage.locator("select[name=gender]").selectOption("m");
    await currentPage.locator("input[name=income]").fill("40000");
    await type({ page: currentPage, selector: "input[name=city]", value: "Rome" });
    await type({ page: currentPage, selector: "input[name=country]", value: "IT" });
    await type({ page: currentPage, selector: "input[name=email]", value: email });
    await type({ page: currentPage, selector: "input[name=password]", value: "Password123!" });
    await currentPage.getByRole("button", { name: "Create account" }).click();
    await currentPage.getByRole("heading", { name: "Profile" }).waitFor();
    await pause({ page: currentPage });
  });

  it("logs in a seeded user from the site", async () => {
    const currentPage = await open({ path: "/login" });
    await type({ page: currentPage, selector: "input[name=email]", value: "john.doe@gmail.com" });
    await type({ page: currentPage, selector: "input[name=password]", value: "Password123!" });
    await currentPage.getByRole("button", { name: "Log in" }).click();
    await currentPage.getByRole("heading", { name: "Profile" }).waitFor();
    await pause({ page: currentPage });
  });

  it("lets visitors browse polls", async () => {
    const currentPage = await open({ path: "/poll/list" });
    await currentPage.getByRole("heading", { name: "Polls open to you" }).waitFor();
    await currentPage.locator("article").first().getByRole("link", { name: "Open poll" }).click();
    await currentPage.getByRole("link", { name: "See results" }).click();
    await currentPage.getByText("Votes cast").waitFor();
    await pause({ page: currentPage });
  });
});
