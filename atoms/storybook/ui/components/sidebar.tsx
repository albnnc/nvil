/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { StoryLinks } from "./story_links.tsx";

export function Sidebar() {
  return (
    <div
      sx={{
        flex: "0 0 250px",
        backgroundColor: "#1a1a1a",
        color: "#ffffffaa",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <StoryLinks />
    </div>
  );
}
