/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import React from "react";
import ReactDOM from "react-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./components/app.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

const root = document.getElementById("root");
ReactDOM.render(<RouterProvider router={router} />, root);

// @ts-ignore: compile-time defined.
console.log(STORYBOOK_CONSTANTS);
