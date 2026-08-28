import { fireEvent, render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { i18n, languageStorageKey } from "#webapp/i18n.ts";
import { Home } from "./Home.tsx";

describe("Home", () => {
  it("renders the landing heading", () => {
    const router = createMemoryRouter([{ path: "/", Component: Home }], { initialEntries: ["/"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Power to your choice." })).toBeDefined();
    expect(screen.getByText("Why voto.io?")).toBeDefined();
    expect(screen.getAllByText("1,248 votes · 53.3% turnout").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Elena Rossi").length).toBeGreaterThan(0);
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

  it("sorts polls by turnout and closing time", () => {
    const router = createMemoryRouter([{ path: "/polls", Component: Home }], { initialEntries: ["/polls"] });
    const { container } = render(<RouterProvider router={router} />);
    const sorter = screen.getByLabelText("Sort polls");
    fireEvent.change(sorter, { target: { value: "Closing time: soonest" } });
    const pollCards = container.querySelectorAll("article");
    expect(pollCards[0].textContent).toContain("More green space in the city");
    fireEvent.change(sorter, { target: { value: "Turnout: low to high" } });
    expect(container.querySelectorAll("article")[0].textContent).toContain("Free school meals");
  });

  it("toggles between public and accessible group polls", () => {
    const router = createMemoryRouter([{ path: "/polls", Component: Home }], { initialEntries: ["/polls"] });
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
    const router = createMemoryRouter([{ path: "/poll/:id/results", Component: Home }], { initialEntries: ["/poll/school-meals/results"] });
    render(<RouterProvider router={router} />);
    expect(screen.getAllByText("% of voters", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("% of selections", { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getByText("Abstention rate")).toBeDefined();
  });

  it("shows instant-runoff results for ranked polls", () => {
    const router = createMemoryRouter([{ path: "/poll/:id/results", Component: Home }], { initialEntries: ["/poll/night-buses/results"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByText("Instant-runoff rounds")).toBeDefined();
    expect(screen.getByText("Winner: Extend route N6")).toBeDefined();
  });

  it("renders the groups tabs and upgrade action", () => {
    const router = createMemoryRouter([{ path: "/groups", Component: Home }], { initialEntries: ["/groups"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Your groups" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Groups you belong to" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Groups you manage" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Upgrade plan" })).toBeDefined();
    expect(screen.getAllByText("Northstar Strategy").length).toBeGreaterThan(0);
  });

  it("opens and closes a live poll", () => {
    const router = createMemoryRouter([{ path: "/live/:id", Component: Home }], { initialEntries: ["/live/101"] });
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
    const router = createMemoryRouter([{ path: "/live/:id/join", Component: Home }], { initialEntries: ["/live/101/join"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Join Elena Rossi's live poll" })).toBeDefined();
    expect(screen.queryByText("voto.io")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("heading", { level: 1, name: "Waiting for the poll" })).toBeDefined();
  });

  it("shows the audience-limit state from the voter URL", () => {
    const router = createMemoryRouter([{ path: "/live/:id/join", Component: Home }], { initialEntries: ["/live/101/join?state=quota"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Audience limit reached" })).toBeDefined();
    expect(screen.getByText("Waiting the creator to increase the poll audience...")).toBeDefined();
  });

  it("shows read-only user information and plan controls", () => {
    const router = createMemoryRouter([{ path: "/profile", Component: Home }], { initialEntries: ["/profile"] });
    render(<RouterProvider router={router} />);
    expect(screen.getByRole("heading", { level: 1, name: "Profile" })).toBeDefined();
    expect(screen.getByText("elena.rossi@example.com")).toBeDefined();
    expect(screen.getByText("100 live users")).toBeDefined();
    expect(screen.getByRole("link", { name: "voto.io/creator/1" })).toBeDefined();
    expect(screen.queryByRole("heading", { level: 2, name: "Your polls" })).toBeNull();
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
        { path: "/groups", Component: Home },
        { path: "/creator/:id", Component: Home },
      ],
      { initialEntries: ["/groups"] },
    );
    render(<RouterProvider router={router} />);
    expect(screen.getAllByRole("button", { name: "Groups you manage" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Upgrade plan" }).length).toBeGreaterThan(0);
  });
});
