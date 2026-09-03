import { afterEach, describe, expect, it } from "vitest";
import type { Browser, Page } from "playwright";
import { keepBrowserOpen, openBrowser, pause } from "./browser.ts";

const webappUrl = "http://localhost:3000";
let creatorBrowser: Browser | undefined;
let voterBrowser: Browser | undefined;

const openCreator = async (): Promise<Page> => {
  const result = await openBrowser();
  creatorBrowser = result.browser;
  await result.page.goto(`${webappUrl}/live-poll/101`);
  return result.page;
};

const openVoter = async (): Promise<Page> => {
  const result = await openBrowser();
  voterBrowser = result.browser;
  await result.page.setViewportSize({ width: 480, height: 700 });
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

describe.sequential("live poll", () => {
  it("shows the creator opening a poll and a mobile voter submitting a ballot", async () => {
    const creator = await openCreator();
    const voter = await openVoter();

    await voter.getByRole("button", { name: "Continue" }).click();
    await voter.getByRole("heading", { name: "Waiting for the poll" }).waitFor();

    await creator.getByRole("button", { name: "Open poll" }).click();
    await creator.getByText("OPEN", { exact: true }).waitFor();
    expect(await creator.getByText("Live participation").isVisible()).toBe(true);

    await voter.getByRole("button", { name: "Poll is open" }).click();
    await voter.getByRole("radio", { name: "Housing access" }).check();
    await voter.getByRole("button", { name: "Submit vote" }).click();
    await voter.getByRole("heading", { name: "Thank you" }).waitFor();
    await pause({ page: voter });
  });
});
