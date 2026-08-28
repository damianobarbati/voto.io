import React from "react";
import { preconnect } from "react-dom";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { mutate, SWRConfig } from "swr";
import { Spinner } from "#webapp/ui/Spinner.tsx";
import "#webapp/i18n.ts";

const API_URL = "http://localhost:8080"; // tofix
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
        path: "/polls",
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
        path: "/poll/:id/results",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/groups",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/group/new",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/group/:id",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/register",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/live/new",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/live/:id",
        lazy: async () => ({ Component: (await import("#webapp/view/Home.tsx")).Home }),
      },
      {
        path: "/live/:id/join",
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
