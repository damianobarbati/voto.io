import React from "react";
import { preconnect } from "react-dom";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { mutate, SWRConfig } from "swr";
import { apiUrl } from "#webapp/env.ts";
import { routes } from "#webapp/routes.ts";
import "#webapp/i18n.ts";

preconnect(apiUrl, { crossOrigin: "anonymous" });

const router = createBrowserRouter(routes);

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
