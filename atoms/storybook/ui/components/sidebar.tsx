/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { useMemo, useState } from "react";
import { IoSearchOutline, IoFileTrayOutline } from "react-icons/io5";
import { Link, useSearchParams } from "react-router-dom";
import { theme } from "../constants.ts";
import { useStories } from "../hooks/use_stories.ts";
import { getStoryName } from "../utils/get_story_name.ts";

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
  const [searchParams] = useSearchParams();
  const storyId = searchParams.get("story");
  const items = useMemo(
    () =>
      (data ?? [])
        .map((v) => ({ ...v, name: getStoryName(v) }))
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter(
          (v) =>
            !query ||
            v.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
        ),
    [data, query]
  );
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
        <IoSearchOutline
          size="1.25rem"
          sx={{
            my: "-0.25rem",
            flex: "0 0 auto",
            transform: "scaleX(-1)",
            opacity: 0.8,
          }}
        />
      </div>
      {items.length ? (
        items.map((v) => {
          const active = storyId === v.id;
          return (
            <Link
              to={`?story=${v.id}`}
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
            </Link>
          );
        })
      ) : (
        <IoFileTrayOutline size="1.65rem" sx={{ mx: "auto", mt: "0.75rem" }} />
      )}
    </div>
  );
}
