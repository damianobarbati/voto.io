import React from "react";
import { preconnect } from "react-dom";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { mutate, SWRConfig } from "swr";
import { Spinner } from "#webapp/ui/Spinner.tsx";
import "#webapp/i18n.ts";

const API_URL = "http://localhost:8080";
preconnect(API_URL, { crossOrigin: "anonymous" });

const router = createBrowserRouter([
  {
    HydrateFallback: Spinner,
    children: [
      {
        path: "/",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/terms",
        lazy: async () => ({ Component: (await import("#webapp/view/Terms.tsx")).Terms }),
      },
      {
        path: "/poll/list",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/poll/new",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/poll/:id",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/poll/:id/stats",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/my-groups",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/my-groups/new",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/my-groups/:id",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/register",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/login",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/my-profile",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/my-polls",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/my-settings",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/my-subscription",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/plans",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/checkout",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/u/:id",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/live-poll/new",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/live-poll/:id",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/live-poll/:id/vote",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
    ],
  },
]);

const container = document.getElementById("root") as Element;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <SWRConfig
      value={{
        onSuccess: (_data, key) => {
          const endpoint = key;
          // tofix: invalidation strategy
          if (endpoint.startsWith("/<resource>")) void mutate((key) => key?.[0].startsWith("/<resource>"));
        },
      }}
    >
      <RouterProvider router={router} />
    </SWRConfig>
  </React.StrictMode>,
);
