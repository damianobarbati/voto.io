import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { i18n, languageStorageKey } from "#webapp/i18n.ts";
import { jwtStorageKey, store } from "#webapp/store.ts";
import { Home } from "./Home.tsx";
import { Terms } from "./Terms.tsx";

const pollsFixture = [
  {
    id: "city-green",
    creator_id: "Elena Rossi",
    group_id: null,
    name: "More green space in the city",
    description: "Choose a city project.",
    type: "single_choice",
    ranked_method: null,
    options: ["Plant trees", "Build gardens", "No suitable option."],
  },
  {
    id: "board-priorities",
    creator_id: "Elena Rossi",
    group_id: "northstar",
    name: "Q4 strategic priorities",
    description: "Choose a board priority.",
    type: "single_choice",
    ranked_method: null,
    options: ["Growth", "Efficiency", "No suitable option."],
  },
  {
    id: "night-buses",
    creator_id: "Elena Rossi",
    group_id: null,
    name: "Night bus routes",
    description: "Choose a route.",
    type: "ranked_choice",
    ranked_method: "irv",
    options: ["Extend route N6", "Add an airport connection", "Increase frequency on route N15"],
  },
  {
    id: "school-meals",
    creator_id: "Elena Rossi",
    group_id: null,
    name: "School meal choices",
    description: "Choose all suitable meals.",
    type: "multiple_choice",
    ranked_method: null,
    options: ["Breakfast", "Lunch", "No suitable option."],
  },
  {
    id: "partner-review",
    creator_id: "Elena Rossi",
    group_id: "vendors",
    name: "Partner review",
    description: "Review a partner.",
    type: "single_choice",
    ranked_method: null,
    options: ["Approve", "Reject", "No suitable option."],
  },
].map((poll) => ({
  ...poll,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  opens_at: "2026-01-01T00:00:00Z",
  closes_at: "2026-12-31T00:00:00Z",
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
  options: poll.options.map((name, index) => ({
    id: `${poll.id}-option-${index + 1}`,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    poll_id: poll.id,
    name,
    position: index + 1,
    is_no_suitable_option: name === "No suitable option.",
  })),
}));

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  window.dispatchEvent(new Event("resize"));
};

describe("Home", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(pollsFixture), { status: 200 })),
    );
  });

  afterEach(() => {
    cleanup();
    store.setState({ user: null });
    localStorage.clear();
    vi.unstubAllGlobals();
    setViewportWidth(1366);
  });

  it("renders the terms of use", () => {
    const router = createMemoryRouter([{ path: "/terms", Component: Terms }], { initialEntries: ["/terms"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Terms of Use" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "3. Rules for polls and groups" })).toBeDefined();
  });

  it("renders the landing heading", async () => {
    const router = createMemoryRouter([{ path: "/", Component: Home }], { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Power to your choice." })).toBeDefined();
    expect(screen.getByText("Why voto.io?")).toBeDefined();
    expect((await screen.findAllByText("0 votes · 0.0% turnout")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Elena Rossi").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { level: 2, name: "Choose a plan that grows with your decisions." })).toBeDefined();
    expect(screen.getAllByRole("link", { name: "Select plan" })).toHaveLength(3);
  });

  it("shows a flag before each language name", () => {
    const router = createMemoryRouter([{ path: "/", Component: Home }], { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);
    const languageNames = screen.getAllByRole("option").map((option) => option.textContent);
    expect(languageNames).toEqual(expect.arrayContaining(["🇬🇧 English", "🇪🇸 Español", "🇩🇪 Deutsch", "🇫🇷 Français", "🇮🇹 Italiano"]));
  });

  it("updates the visible text when the language changes", async () => {
    await i18n.changeLanguage("en");
    const router = createMemoryRouter([{ path: "/", Component: Home }], { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);
    const selector = screen.getAllByLabelText("Language").at(-1);
    if (!selector) throw new Error("Language selector is missing");
    fireEvent.change(selector, { target: { value: "it" } });
    expect((await screen.findAllByRole("heading", { level: 1, name: "Potere alla tua scelta." })).length).toBeGreaterThan(0);
    expect(localStorage.getItem(languageStorageKey)).toBe("it");
    await i18n.changeLanguage("en");
  });

  it("clears the JWT and shows the login action after logout", async () => {
    store.setState({
      user: {
        id: "1",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        email: "elena.rossi@example.com",
        name: "Elena Rossi",
        first_name: "Elena",
        last_name: "Rossi",
        birth_date: "1992-05-14T00:00:00.000Z",
        gender: "f",
        income: 38000,
        city: "Milan",
        country: "IT",
        language: "en",
      },
    });
    localStorage.setItem(jwtStorageKey, "test-jwt");
    const router = createMemoryRouter([{ path: "/", Component: Home }], { initialEntries: ["/"] });
    const { container } = render(<RouterProvider router={router} />);
    const app = within(container);
    fireEvent.click(app.getByRole("button", { name: "Elena Rossi" }));
    fireEvent.click(app.getByRole("button", { name: "Log out" }));
    expect(localStorage.getItem(jwtStorageKey)).toBeNull();
    expect(store.getState().user).toBeNull();
    await waitFor(() => expect(app.getByRole("link", { name: "Log in" }).getAttribute("href")).toBe("/login"));
  });

  it("reorders ranked choices when one is dropped on another", async () => {
    const router = createMemoryRouter([{ path: "/poll/:id", Component: Home }], { initialEntries: ["/poll/night-buses"] });
    render(<RouterProvider router={router} />);
    const source = (await screen.findByText("Add an airport connection")).closest('[draggable="true"]');
    const target = screen.getByText("Extend route N6").closest('[draggable="true"]');
    if (!source || !target) throw new Error("Ranked choices are missing");
    const dataTransfer = new DataTransfer();
    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    const rankedChoices = document.querySelectorAll('[draggable="true"]');
    expect(rankedChoices[0].textContent).toContain("Add an airport connection");
  });

  it("submits the selected poll options with the saved login token", async () => {
    localStorage.setItem(jwtStorageKey, "john-doe-token");
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      if (input.toString().endsWith("/votes") && init?.method === "POST") return new Response(null, { status: 200 });
      return new Response(JSON.stringify(pollsFixture), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const router = createMemoryRouter([{ path: "/poll/:id", Component: Home }], { initialEntries: ["/poll/city-green"] });
    render(<RouterProvider router={router} />);
    fireEvent.click(await screen.findByRole("button", { name: "Submit vote" }));
    expect(await screen.findByText("Your vote was submitted.")).toBeDefined();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/polls/city-green/votes",
      expect.objectContaining({
        body: JSON.stringify({ option_ids: ["city-green-option-1"] }),
        headers: expect.objectContaining({ Authorization: "Bearer john-doe-token" }),
        method: "POST",
      }),
    );
  });

  it("adds the automatic no-choice option to one-choice polls", () => {
    const router = createMemoryRouter([{ path: "/poll/new", Component: Home }], { initialEntries: ["/poll/new"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Create a poll" })).toBeDefined();
    expect(screen.getByText("No suitable option.")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Remove option 1" })).toBeNull();
  });

  it("sorts polls by turnout, vote count, and closing time", async () => {
    const router = createMemoryRouter([{ path: "/poll/list", Component: Home }], { initialEntries: ["/poll/list"] });
    const { container } = render(<RouterProvider router={router} />);
    await screen.findByText("More green space in the city");
    const sorter = screen.getByLabelText("Sort polls");
    fireEvent.change(sorter, { target: { value: "Closing time: soonest" } });
    const pollCards = container.querySelectorAll("article");
    expect(pollCards[0].textContent).toContain("More green space in the city");
    fireEvent.change(sorter, { target: { value: "Turnout: low to high" } });
    expect(container.querySelectorAll("article")[0].textContent).toContain("More green space in the city");
    fireEvent.change(sorter, { target: { value: "Votes: high to low" } });
    expect(container.querySelectorAll("article")[0].textContent).toContain("More green space in the city");
  });

  it("toggles between public and accessible group polls", async () => {
    const router = createMemoryRouter([{ path: "/poll/list", Component: Home }], { initialEntries: ["/poll/list"] });
    const { container } = render(<RouterProvider router={router} />);
    await screen.findByText("More green space in the city");
    expect(container.textContent).toContain("More green space in the city");
    const groupFilter = screen.getAllByRole("button", { name: "My groups" }).at(-1);
    if (!groupFilter) throw new Error("My groups filter is missing");
    fireEvent.click(groupFilter);
    expect(container.textContent).toContain("Q4 strategic priorities");
    expect(container.textContent).not.toContain("More green space in the city");
  });

  it("denies direct access to a poll restricted to another group", async () => {
    const router = createMemoryRouter([{ path: "/poll/:id", Component: Home }], { initialEntries: ["/poll/partner-review"] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByRole("heading", { level: 1, name: "Access denied" })).toBeDefined();
    expect(screen.getByText("This poll is restricted to members of Partner Council.")).toBeDefined();
  });

  it("shows many-choice selection metrics", async () => {
    const router = createMemoryRouter([{ path: "/poll/:id/stats", Component: Home }], { initialEntries: ["/poll/school-meals/stats"] });
    render(<RouterProvider router={router} />);
    expect((await screen.findAllByText("% of voters", { exact: false })).length).toBeGreaterThan(0);
    expect(screen.getAllByText("% of selections", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText("Abstention rate")).toBeDefined();
  });

  it("shows instant-runoff results for ranked polls", async () => {
    const router = createMemoryRouter([{ path: "/poll/:id/stats", Component: Home }], { initialEntries: ["/poll/night-buses/stats"] });
    render(<RouterProvider router={router} />);
    expect(await screen.findByText("Instant-runoff rounds")).toBeDefined();
    expect(screen.getByText("Winner: Extend route N6")).toBeDefined();
  });

  it("renders the groups tabs and upgrade action", () => {
    const router = createMemoryRouter([{ path: "/my-groups", Component: Home }], { initialEntries: ["/my-groups"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Your groups" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Groups you belong to" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Groups you manage" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Upgrade plan" })).toBeDefined();
    expect(screen.getAllByText("Milan Labour Council").length).toBeGreaterThan(0);
  });

  it("opens and closes a live poll", async () => {
    localStorage.setItem(jwtStorageKey, "test-jwt");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const url = input.toString();
        if (url.endsWith("/live-polls") && init?.method === "POST") return new Response(JSON.stringify(pollsFixture[0]), { status: 200 });
        if (url.endsWith("/open") && init?.method === "POST") return new Response(JSON.stringify(pollsFixture[0]), { status: 200 });
        return new Response(JSON.stringify(pollsFixture), { status: 200 });
      }),
    );
    const router = createMemoryRouter([{ path: "/live-poll/:id", Component: Home }], { initialEntries: ["/live-poll/101"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("img", { name: "Live poll QR code" })).toBeDefined();
    expect(screen.queryByText("voto.io")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open poll" }));
    expect(await screen.findByText("131 / 184 voted")).toBeDefined();
    expect(screen.getByText("184 / 100 live users")).toBeDefined();
    expect(screen.getAllByRole("link", { name: "Upgrade plan" }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Close poll" }));
    expect(screen.getByText("CLOSED")).toBeDefined();
    expect(screen.getAllByText("Demographic breakdown").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Other cities").length).toBeGreaterThan(0);
  });

  it("blocks live poll creation below the desktop width", () => {
    setViewportWidth(800);
    const router = createMemoryRouter([{ path: "/live-poll/:id", Component: Home }], { initialEntries: ["/live-poll/new"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Device not supported" })).toBeDefined();
    expect(screen.getByText("Live poll creation works only on a computer with a screen at least 1280px wide.")).toBeDefined();
  });

  it("shows the mobile live voter waiting state after registration", async () => {
    setViewportWidth(480);
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const url = input.toString();
        if (url.endsWith("/attendees") && init?.method === "POST") return new Response(JSON.stringify({ token: "attendee-token" }), { status: 200 });
        return new Response(JSON.stringify(pollsFixture), { status: 200 });
      }),
    );
    const router = createMemoryRouter([{ path: "/live-poll/:id/vote", Component: Home }], { initialEntries: ["/live-poll/101/vote"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Join Elena Rossi's live poll" })).toBeDefined();
    expect(screen.queryByText("voto.io")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Waiting for the poll" })).toBeDefined();
  });

  it("shows the audience-limit state from the voter URL", () => {
    setViewportWidth(480);
    const router = createMemoryRouter([{ path: "/live-poll/:id/vote", Component: Home }], { initialEntries: ["/live-poll/101/vote?state=quota"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Audience limit reached" })).toBeDefined();
    expect(screen.getByText("Waiting the creator to increase the poll audience...")).toBeDefined();
  });

  it("shows read-only user information and plan controls", () => {
    const router = createMemoryRouter([{ path: "/my-profile", Component: Home }], { initialEntries: ["/my-profile"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Profile" })).toBeDefined();
    expect(screen.getByText("elena.rossi@example.com")).toBeDefined();
    expect(screen.getByRole("link", { name: "voto.io/u/1" })).toBeDefined();
    expect(screen.queryByRole("heading", { level: 2, name: "Your polls" })).toBeNull();
  });

  it("returns to the selected subscription after checkout", () => {
    const router = createMemoryRouter(
      [
        { path: "/checkout", Component: Home },
        { path: "/my-subscription", Component: Home },
      ],
      { initialEntries: ["/checkout?plan=big"] },
    );
    render(<RouterProvider router={router} />);
    expect(screen.getByText("Big plan")).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "Complete purchase" }));
    expect(screen.getByRole("heading", { level: 1, name: "Subscription" })).toBeDefined();
    expect(screen.getByText("Valid until 28 September 2026")).toBeDefined();
  });

  it("shows all paid plans", () => {
    const router = createMemoryRouter([{ path: "/plans", Component: Home }], { initialEntries: ["/plans"] });
    render(<RouterProvider router={router} />);
    const plans = screen.getAllByRole("main").at(-1);
    if (!plans) throw new Error("Plans page is missing");
    expect(within(plans).getByRole("heading", { level: 1, name: "Plans" })).toBeDefined();
    expect(within(plans).getAllByRole("link", { name: "Select plan" })).toHaveLength(3);
  });

  it("shows the user poll tabs on the dedicated page", () => {
    const router = createMemoryRouter([{ path: "/my-polls", Component: Home }], { initialEntries: ["/my-polls"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Your polls" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Polls you voted" })).toBeDefined();
  });

  it("shows group and creator tabs", () => {
    const router = createMemoryRouter(
      [
        { path: "/my-groups", Component: Home },
        { path: "/u/:id", Component: Home },
      ],
      { initialEntries: ["/my-groups"] },
    );
    render(<RouterProvider router={router} />);
    expect(screen.getAllByRole("button", { name: "Groups you manage" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Upgrade plan" }).length).toBeGreaterThan(0);
  });
});
