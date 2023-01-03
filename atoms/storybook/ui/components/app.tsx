/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { Global } from "@emotion/react";
import { Sidebar } from "./sidebar.tsx";
import { Story } from "./story.tsx";

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
            backgroundColor: "#121212",
            color: "white",
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
