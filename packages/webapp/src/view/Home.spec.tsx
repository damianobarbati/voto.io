import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { i18n, languageStorageKey } from "#webapp/i18n.ts";
import { jwtStorageKey, store } from "#webapp/store.ts";
import { Home } from "./Home.tsx";
import { Terms } from "./Terms.tsx";

describe("Home", () => {
  it("renders the terms of use", () => {
    const router = createMemoryRouter([{ path: "/terms", Component: Terms }], { initialEntries: ["/terms"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Terms of Use" })).toBeDefined();
    expect(screen.getByRole("heading", { level: 2, name: "3. Rules for polls and groups" })).toBeDefined();
  });

  it("renders the landing heading", () => {
    const router = createMemoryRouter([{ path: "/", Component: Home }], { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Power to your choice." })).toBeDefined();
    expect(screen.getByText("Why voto.io?")).toBeDefined();
    expect(screen.getAllByText("1,248 votes · 53.3% turnout").length).toBeGreaterThan(0);
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
    await waitFor(() => expect(app.getByRole("link", { name: "Log in" }).getAttribute("href")).toBe("/login"));
  });

  it("reorders ranked choices when one is dropped on another", () => {
    const router = createMemoryRouter([{ path: "/poll/:id", Component: Home }], { initialEntries: ["/poll/night-buses"] });
    render(<RouterProvider router={router} />);
    const source = screen.getByText("Add an airport connection").closest('[draggable="true"]');
    const target = screen.getByText("Extend route N6").closest('[draggable="true"]');
    if (!source || !target) throw new Error("Ranked choices are missing");
    const dataTransfer = new DataTransfer();
    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    const rankedChoices = document.querySelectorAll('[draggable="true"]');
    expect(rankedChoices[0].textContent).toContain("Add an airport connection");
  });

  it("adds the automatic no-choice option to one-choice polls", () => {
    const router = createMemoryRouter([{ path: "/poll/new", Component: Home }], { initialEntries: ["/poll/new"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Create a poll" })).toBeDefined();
    expect(screen.getByText("No suitable option.")).toBeDefined();
    expect(screen.queryByRole("button", { name: "Remove option 1" })).toBeNull();
  });

  it("sorts polls by turnout, vote count, and closing time", () => {
    const router = createMemoryRouter([{ path: "/poll/list", Component: Home }], { initialEntries: ["/poll/list"] });
    const { container } = render(<RouterProvider router={router} />);
    const sorter = screen.getByLabelText("Sort polls");
    fireEvent.change(sorter, { target: { value: "Closing time: soonest" } });
    const pollCards = container.querySelectorAll("article");
    expect(pollCards[0].textContent).toContain("More green space in the city");
    fireEvent.change(sorter, { target: { value: "Turnout: low to high" } });
    expect(container.querySelectorAll("article")[0].textContent).toContain("Community sports programme");
    fireEvent.change(sorter, { target: { value: "Votes: high to low" } });
    expect(container.querySelectorAll("article")[0].textContent).toContain("More green space in the city");
  });

  it("toggles between public and accessible group polls", () => {
    const router = createMemoryRouter([{ path: "/poll/list", Component: Home }], { initialEntries: ["/poll/list"] });
    const { container } = render(<RouterProvider router={router} />);
    expect(container.textContent).toContain("More green space in the city");
    const groupFilter = screen.getAllByRole("button", { name: "My groups" }).at(-1);
    if (!groupFilter) throw new Error("My groups filter is missing");
    fireEvent.click(groupFilter);
    expect(container.textContent).toContain("Q4 strategic priorities");
    expect(container.textContent).not.toContain("More green space in the city");
  });

  it("denies direct access to a poll restricted to another group", () => {
    const router = createMemoryRouter([{ path: "/poll/:id", Component: Home }], { initialEntries: ["/poll/partner-review"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Access denied" })).toBeDefined();
    expect(screen.getByText("This poll is restricted to members of Partner Council.")).toBeDefined();
  });

  it("shows many-choice selection metrics", () => {
    const router = createMemoryRouter([{ path: "/poll/:id/stats", Component: Home }], { initialEntries: ["/poll/school-meals/stats"] });
    render(<RouterProvider router={router} />);
    expect(screen.getAllByText("% of voters", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("% of selections", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText("Abstention rate")).toBeDefined();
  });

  it("shows instant-runoff results for ranked polls", () => {
    const router = createMemoryRouter([{ path: "/poll/:id/stats", Component: Home }], { initialEntries: ["/poll/night-buses/stats"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByText("Instant-runoff rounds")).toBeDefined();
    expect(screen.getByText("Winner: Extend route N6")).toBeDefined();
  });

  it("renders the groups tabs and upgrade action", () => {
    const router = createMemoryRouter([{ path: "/my-groups", Component: Home }], { initialEntries: ["/my-groups"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Your groups" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Groups you belong to" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Groups you manage" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Upgrade plan" })).toBeDefined();
    expect(screen.getAllByText("Northstar Strategy").length).toBeGreaterThan(0);
  });

  it("opens and closes a live poll", () => {
    const router = createMemoryRouter([{ path: "/live-poll/:id", Component: Home }], { initialEntries: ["/live-poll/101"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("img", { name: "Live poll QR code" })).toBeDefined();
    expect(screen.queryByText("voto.io")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open poll" }));
    expect(screen.getByText("131 / 184 voted")).toBeDefined();
    expect(screen.getByText("184 / 100 live users")).toBeDefined();
    expect(screen.getAllByRole("link", { name: "Upgrade plan" }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Close poll" }));
    expect(screen.getByText("CLOSED")).toBeDefined();
    expect(screen.getAllByText("Demographic breakdown").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Other cities").length).toBeGreaterThan(0);
  });

  it("shows the mobile live voter waiting state after registration", () => {
    const router = createMemoryRouter([{ path: "/live-poll/:id/vote", Component: Home }], { initialEntries: ["/live-poll/101/vote"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Join Elena Rossi's live poll" })).toBeDefined();
    expect(screen.queryByText("voto.io")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { level: 1, name: "Waiting for the poll" })).toBeDefined();
  });

  it("shows the audience-limit state from the voter URL", () => {
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
