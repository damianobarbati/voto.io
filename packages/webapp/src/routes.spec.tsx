import "./style.css";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { afterEach, expect, it, vi } from "vitest";
import { i18n, languageStorageKey } from "#webapp/i18n.ts";
import { routes } from "#webapp/routes.ts";

afterEach(async () => {
  cleanup();
  await i18n.changeLanguage("en");
  localStorage.clear();
  vi.unstubAllGlobals();
});

it("changes the URL language, preserves the page, and localizes links and form navigation", async () => {
  localStorage.setItem(languageStorageKey, "fr");
  const router = createMemoryRouter(routes, { initialEntries: ["/en/checkout?plan=big#payment"] });
  render(<RouterProvider router={router} />);
  const selector = (await screen.findAllByLabelText("Language"))[0];
  expect(localStorage.getItem(languageStorageKey)).toBe("en");
  fireEvent.change(selector, { target: { value: "it" } });
  await waitFor(() => expect(router.state.location).toMatchObject({ pathname: "/it/checkout", search: "?plan=big", hash: "#payment" }));
  expect(document.documentElement.lang).toBe("it");
  expect((screen.getAllByLabelText("Lingua")[0] as HTMLSelectElement).value).toBe("it");
  fireEvent.click(screen.getByRole("button", { name: "Complete purchase" }));
  await waitFor(() => expect(router.state.location).toMatchObject({ pathname: "/it/my-subscription", search: "?plan=big" }));
  fireEvent.click(screen.getByRole("link", { name: "Terms" }));
  expect(await screen.findByRole("heading", { name: "Termini di utilizzo" })).toBeDefined();
  expect(screen.getByRole("link", { name: "← Torna a voto.io" }).getAttribute("href")).toBe("/it");
  await router.navigate(-1);
  await router.navigate(-1);
  await router.navigate(-1);
  await screen.findAllByLabelText("Language");
  expect(localStorage.getItem(languageStorageKey)).toBe("en");
});

it.each(["en", "it", "es", "fr", "de"])("restores %s for unprefixed deep links and a later visit", async (language) => {
  localStorage.setItem(languageStorageKey, language);
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response("[]")),
  );
  const router = createMemoryRouter(routes, { initialEntries: ["/plans?from=shared#pricing"] });
  render(<RouterProvider router={router} />);
  await waitFor(() => expect(router.state.location).toMatchObject({ pathname: `/${language}/plans`, search: "?from=shared", hash: "#pricing" }));
  await screen.findByRole("heading", { level: 1, name: "Plans" });
  expect(screen.getAllByRole("link", { name: "voto.io" })[0].getAttribute("href")).toBe(`/${language}`);
  cleanup();
  const nextVisit = createMemoryRouter(routes, { initialEntries: ["/"] });
  render(<RouterProvider router={nextVisit} />);
  await waitFor(() => expect(nextVisit.state.location.pathname).toBe(`/${language}`));
  await waitFor(() => expect(nextVisit.state.navigation.state).toBe("idle"));
  expect(document.documentElement.lang).toBe(language);
});

it("uses a supported browser language when the saved preference is invalid", async () => {
  localStorage.setItem(languageStorageKey, "unsupported");
  const router = createMemoryRouter(routes, { initialEntries: ["/about"] });
  render(<RouterProvider router={router} />);
  await screen.findByRole("heading", { name: "Better decisions, made together." });
  expect(["en", "it", "es", "fr", "de"]).toContain(router.state.location.pathname.split("/")[1]);
  expect(screen.getByRole("link", { name: "how we use the service" }).getAttribute("href")).toBe(`/${i18n.resolvedLanguage}/terms`);
});
