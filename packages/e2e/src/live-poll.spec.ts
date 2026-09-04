import type { Browser, Page } from "playwright";
import { afterEach, describe, expect, it } from "vitest";
import { keepBrowserOpen, openBrowser, pause } from "./browser.ts";

const webappUrl = "http://localhost:3000";
let creatorBrowser: Browser | undefined;
let voterBrowser: Browser | undefined;

const openCreator = async (): Promise<Page> => {
  const result = await openBrowser({ viewport: { width: 1280, height: 700 }, window: { x: 0, y: 0, width: 1280, height: 700 } });
  creatorBrowser = result.browser;
  await result.page.goto(`${webappUrl}/login`);
  await result.page.locator("input[name=email]").fill("john.doe@gmail.com");
  await result.page.locator("input[name=password]").fill("Password123!");
  await result.page.getByRole("button", { name: "Log in" }).click();
  await result.page.getByRole("heading", { name: "Profile" }).waitFor();
  await result.page.goto(`${webappUrl}/live-poll/new`);
  return result.page;
};

const openVoter = async (): Promise<Page> => {
  const result = await openBrowser({ viewport: { width: 480, height: 700 }, window: { x: 1280, y: 0, width: 480, height: 700 } });
  voterBrowser = result.browser;
  await result.page.goto(`${webappUrl}/live-poll/101/vote`);
  return result.page;
};

afterEach(async () => {
  if (!keepBrowserOpen && creatorBrowser) await creatorBrowser.close();
  if (!keepBrowserOpen && voterBrowser) await voterBrowser.close();
  if (keepBrowserOpen) return;
  creatorBrowser = undefined;
  voterBrowser = undefined;
});

describe("live poll", () => {
  it("creates and opens a live poll, then records a mobile attendee vote", async () => {
    const creator = await openCreator();
    const createdResponse = creator.waitForResponse((response) => response.url().endsWith("/live-polls") && response.request().method() === "POST");
    await creator.getByRole("button", { name: "Open poll" }).click();
    const poll = (await createdResponse).json() as Promise<{ id: string; options: { id: string; name: string }[] }>;
    const createdPoll = await poll;
    await creator.getByText("OPEN", { exact: true }).waitFor();
    expect(await creator.getByText("Live participation").isVisible()).toBe(true);

    const voter = await openVoter();
    await voter.goto(`${webappUrl}/live-poll/${createdPoll.id}/vote`);
    await voter.getByRole("button", { name: "Continue" }).click();
    await voter.getByRole("heading", { name: "Waiting for the poll" }).waitFor();
    await voter.getByRole("button", { name: "Poll is open" }).click();
    await voter.getByRole("radio", { name: createdPoll.options[0].name }).check();
    await voter.getByRole("button", { name: "Submit vote" }).click();
    await voter.getByRole("heading", { name: "Thank you" }).waitFor();
    await pause({ page: voter });
  });
});
