/** @jsx jsx */
import { jsx } from "@emotion/react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "../layouts/app.tsx";
import { StoryPage } from "./story.tsx";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "", element: null },
      {
        path: "/s/:id",
        element: <StoryPage />,
      },
    ],
  },
]);
