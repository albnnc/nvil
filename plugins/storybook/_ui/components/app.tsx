/** @jsx jsx */
import { Global, jsx } from "@emotion/react";
import { useEffect, Fragment } from "react";
import useSWR from "swr";
import { theme } from "../constants.ts";
import { Header } from "./sections/header.tsx";
import { InputPanel } from "./sections/input_panel.tsx";
import { Navigation } from "./sections/navigation.tsx";
import { StoryIframe } from "../widgets/story_iframe.tsx";
import { RouterProvider } from "react-router-dom";
import { router } from "../pages/mod.tsx";

export function App() {
  return (
    <Fragment>
      <Global
        styles={{
          html: {
            fontFamily: "Roboto, sans-serif",
          },
          body: {
            padding: 0,
            margin: 0,
          },
          "*": {
            boxSizing: "border-box",
          },
        }}
      />
      <RouterProvider router={router} />
      {/* <div
        css={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <Header css={{ position: "sticky", top: 0 }} />
        <div css={{ display: "flex" }}>
          <Navigation />
          <Story />
          <InputPanel />
        </div>
      </div> */}
    </Fragment>
  );
}
