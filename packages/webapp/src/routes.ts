import type { RouteObject } from "react-router-dom";
import { LanguageRedirect } from "#webapp/components/LanguageRedirect.tsx";
import { i18n } from "#webapp/i18n.ts";
import { supportedLanguages } from "#webapp/language.ts";
import { Spinner } from "#webapp/ui/Spinner.tsx";

const pageRoutes: RouteObject[] = [
  {
    index: true,
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "terms",
    lazy: async () => ({ Component: (await import("#webapp/view/Terms.tsx")).Terms }),
  },
  {
    path: "about",
    lazy: async () => ({ Component: (await import("#webapp/view/About.tsx")).About }),
  },
  {
    path: "contact",
    lazy: async () => ({ Component: (await import("#webapp/view/Contact.tsx")).Contact }),
  },
  {
    path: "poll/list",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "poll/new",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "poll/:id",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "poll/:id/stats",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "my-groups",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "my-groups/new",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "my-groups/:id",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "register",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "login",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "my-profile",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "my-polls",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "my-settings",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "my-subscription",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "plans",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "checkout",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "u/:id",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "live-poll/new",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "live-poll/:id",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
  {
    path: "live-poll/:id/vote",
    lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
  },
];

export const routes: RouteObject[] = [
  {
    path: "/:language",
    HydrateFallback: Spinner,
    loader: async ({ params }) => {
      if (!supportedLanguages.includes(params.language ?? "")) throw new Response("Not found", { status: 404 });
      await i18n.changeLanguage(params.language);
      return null;
    },
    children: pageRoutes,
  },
  ...pageRoutes.map((route) => ({
    path: route.index ? "/" : `/${route.path}`,
    Component: LanguageRedirect,
  })),
];
