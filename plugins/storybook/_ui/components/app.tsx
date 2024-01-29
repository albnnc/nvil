/** @jsx jsx */
import { Global } from "@emotion/react";
import { jsx } from "@theme-ui/core";
import { theme } from "../constants.ts";
import { Sidebar } from "./sections/sidebar.tsx";
import { Story } from "./sections/story.tsx";

export function App() {
  return (
    <div
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      <Global
        styles={{
          html: {
            backgroundColor: theme.colors.background,
            color: theme.colors.onBackground,
            colorScheme: theme.colorScheme,
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
      <Sidebar />
      <Story />
    </div>
  );
}
