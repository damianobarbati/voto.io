import "../style.css";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { SWRConfig } from "swr";
import type { Poll } from "types/Poll.ts";
import { afterEach, expect, it, vi } from "vitest";
import { page } from "vitest/browser";
import { Home } from "./Home.tsx";

afterEach(() => {
  cleanup();
  window.scrollTo(0, 0);
  vi.unstubAllGlobals();
});

it.each([
  [1280, 700],
  [768, 1024],
  [390, 844],
])("virtualizes cards, loads on scroll, retries, and stops at the end at %s by %s", async (width, height) => {
  await page.viewport(width, height);
  const polls: Poll[] = Array.from({ length: 40 }, (_, index) => ({
    id: `poll-${index}`,
    name: `Scroll poll ${index}`,
    description: "A poll for the scrolling test.",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    creator_id: "Test user",
    group_id: null,
    opens_at: "2026-01-01T00:00:00Z",
    closes_at: "2027-01-01T00:00:00Z",
    type: "single_choice",
    ranked_method: null,
    gender_restriction: null,
    age_min: null,
    age_max: null,
    gross_income_min: null,
    gross_income_max: null,
    cities: [],
    countries: [],
    is_live: false,
    live_token: "00000000-0000-4000-8000-000000000001",
    closed_at: null,
    options: [],
  }));
  let failNextPage = true;
  const fetchMock = vi.fn(async (input: string) => {
    const url = new URL(input);
    const offset = Number(url.searchParams.get("offset"));
    if (offset === 20 && failNextPage) return new Response(null, { status: 503 });
    const query = url.searchParams.get("query");
    const matches = query ? polls.filter((poll) => poll.name.includes(query)) : polls;
    return new Response(JSON.stringify({ polls: matches.slice(offset, offset + 20), total: matches.length, nextOffset: offset + 20 < matches.length ? offset + 20 : null }));
  });
  vi.stubGlobal("fetch", fetchMock);
  const router = createMemoryRouter([{ path: "/poll/list", Component: Home }], { initialEntries: ["/poll/list"] });
  const { container } = render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <RouterProvider router={router} />
    </SWRConfig>,
  );
  await screen.findByText("Scroll poll 0");
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(container.querySelectorAll("article").length).toBeLessThan(20);
  window.scrollTo(0, document.body.scrollHeight);
  await screen.findByRole("alert");
  failNextPage = false;
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  await waitFor(() => {
    window.scrollTo(0, document.body.scrollHeight);
    expect(screen.queryByText("Scroll poll 39")).not.toBeNull();
  });
  expect(screen.queryByText("Scroll poll 0")).toBeNull();
  expect(fetchMock.mock.calls.every(([url]) => Number(new URL(url).searchParams.get("offset")) <= 20)).toBe(true);
  window.scrollTo(0, 0);
  fireEvent.change(screen.getByRole("textbox", { name: "Search polls" }), { target: { value: "Scroll poll 39" } });
  await screen.findByRole("heading", { name: "1 polls open to you" });
  expect(new URL(fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0]).searchParams.get("offset")).toBe("0");
});
