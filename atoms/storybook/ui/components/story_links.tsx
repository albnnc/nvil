/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { Link } from "react-router-dom";
import { useStories } from "../hooks/use_stories.ts";
import { getStoryName } from "../utils/get_story_name.ts";

export function StoryLinks() {
  const { data } = useStories();
  return (
    <div
      sx={{
        pb: "1em",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {data?.map((v) => (
        <Link
          to={`?story=${v.id}`}
          sx={{
            px: "1em",
            py: "0.5em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            cursor: "default",
            "&, &:active, &:visited": {
              color: "inherit",
              textDecoration: "none",
            },
            "&:hover": {
              backgroundColor: "#ffffff11",
            },
          }}
        >
          {getStoryName(v)}
        </Link>
      ))}
    </div>
  );
}
