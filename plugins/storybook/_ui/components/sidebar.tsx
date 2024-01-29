/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { useEffect, useMemo, useState } from "react";
import { theme } from "../constants.ts";
import { useStories } from "../hooks/use_stories.ts";
import { useStoryId } from "../hooks/use_story_id.ts";
import { getStoryName } from "../utils/get_story_name.ts";
import { IconEmpty } from "./icon_emty.tsx";
import { IconSearch } from "./icon_search.tsx";

const textStyle = {
  color: "inherit",
  fontSize: "0.85rem",
  letterSpacing: "0.065em",
  textTransform: "uppercase",
  fontWeight: theme.colorScheme === "dark" ? 300 : 400,
};

export function Sidebar() {
  const { data } = useStories();
  const [query, setQuery] = useState("");
  const storyId = useStoryId();
  const items = useMemo(
    () =>
      (data ?? [])
        .map((v) => ({ ...v, name: getStoryName(v) }))
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter(
          (v) =>
            !query ||
            v.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
        ),
    [data, query],
  );
  useEffect(() => {
    const firstItem = items?.[0];
    if (!storyId && firstItem) {
      history.pushState(
        { storyId: firstItem.id },
        "",
        `?story=${firstItem.id}`,
      );
    }
  }, [items]);
  return (
    <div
      sx={{
        py: "1em",
        flex: "0 0 250px",
        backgroundColor: theme.colors.sidebar,
        color: theme.colors.onSidebar,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        sx={{
          px: "1rem",
          py: "0.5rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        <input
          placeholder="Search"
          value={query}
          onChange={(ev) => setQuery((ev.target as HTMLInputElement).value)}
          sx={{
            flex: "1 1 auto",
            border: 0,
            background: "transparent",
            outline: "none",
            ...textStyle,
            "&::placeholder": { ...textStyle, opacity: 0.5 },
          }}
        />
        <IconSearch
          width="1.25rem"
          height="1.25rem"
          sx={{
            my: "-0.25rem",
            verticalAlign: "middle",
            flex: "0 0 auto",
            opacity: 0.8,
          }}
        />
      </div>
      {items.length
        ? (
          items.map((v) => {
            const active = storyId === v.id;
            return (
              <a
                href={`?story=${v.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  history.pushState({ storyId: v.id }, "", `?story=${v.id}`);
                }}
                sx={{
                  px: "1rem",
                  py: "0.5rem",
                  backgroundColor: active
                    ? theme.colors.accentSidebar
                    : undefined,
                  cursor: "default",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  ...textStyle,
                  "&, &:active, &:visited": {
                    color: "inherit",
                    textDecoration: "none",
                  },
                  "&:hover": {
                    backgroundColor: theme.colors.accentSidebar,
                    color: theme.colors.accentOnSidebar,
                  },
                }}
              >
                {getStoryName(v)}
              </a>
            );
          })
        )
        : (
          <IconEmpty
            width="1.65rem"
            height="1.65rem"
            sx={{ mx: "auto", mt: "0.75rem" }}
          />
        )}
    </div>
  );
}
