/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { Global } from "@emotion/react";
import { Sidebar } from "./sidebar.tsx";
import { Story } from "./story.tsx";
import { theme } from "../constants.ts";

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
