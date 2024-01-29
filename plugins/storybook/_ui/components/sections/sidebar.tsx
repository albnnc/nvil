/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { useEffect, useMemo, useState } from "react";
import { theme } from "../../constants.ts";
import { useStoryDefs } from "../../hooks/use_story_defs.ts";
import { StoryDef } from "../../hooks/use_story_defs.ts";
import { useStoryGroups } from "../../hooks/use_story_groups.ts";
import { useStoryId } from "../../hooks/use_story_id.ts";
import { ChevronRightIcon } from "../icons/chevron_right.tsx";
import { EmptyIcon } from "../icons/emty.tsx";
import { SearchIcon } from "../icons/search.tsx";

export const Sidebar = () => {
  const storyId = useStoryId();
  const [query, setQuery] = useState("");
  const [storyDefs = []] = useStoryDefs();
  const filteredStoryDefs = useMemo(() => {
    return storyDefs.filter((v) =>
      !query || v.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    );
  }, [query, storyDefs]);
  const storyGroups = useStoryGroups(storyDefs);
  useEffect(() => {
    const firstStoryDef = storyDefs?.[0];
    if (!storyId && firstStoryDef) {
      history.pushState(
        { storyId: firstStoryDef.id },
        "",
        `?story-id=${firstStoryDef.id}`,
      );
    }
  }, [storyDefs]);
  return (
    <div
      sx={{
        py: "1rem",
        flex: "0 0 250px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.colors.sidebar,
        color: theme.colors.onSidebar,
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
        <SearchIcon
          sx={{
            mt: "-1px",
            mr: "5px",
            width: "18px",
            height: "18px",
            verticalAlign: "middle",
            flex: "0 0 auto",
            opacity: 0.8,
            transform: "scaleX(-1)",
          }}
        />
        <input
          placeholder="Search"
          value={query}
          onChange={(ev) => setQuery((ev.target as HTMLInputElement).value)}
          sx={{
            flex: "1 1 auto",
            border: 0,
            background: "transparent",
            outline: "none",
            padding: 0,
            ...textStyle,
            "&::placeholder": { ...textStyle, opacity: 0.5 },
          }}
        />
      </div>
      {filteredStoryDefs.length
        ? (
          <div>
            {!!storyGroups.length &&
              storyGroups.map((v) => (
                <Group
                  name={v}
                  storyDefs={storyDefs}
                  activeStoryId={storyId}
                />
              ))}
            <Group
              storyDefs={storyDefs}
              activeStoryId={storyId}
            />
          </div>
        )
        : (
          <EmptyIcon
            width="1.65rem"
            height="1.65rem"
            sx={{ mx: "auto", mt: "0.75rem" }}
          />
        )}
    </div>
  );
};

interface GroupProps {
  name?: string;
  storyDefs: StoryDef[];
  activeStoryId?: string;
}

const Group = ({ name, storyDefs, activeStoryId }: GroupProps) => {
  const groupStoryDefs = storyDefs.filter((v) => v.group === name);
  const alwaysOpen = useMemo(() => {
    return !name || groupStoryDefs.some((v) => v.id === activeStoryId);
  }, [name, groupStoryDefs]);
  const [open, setOpen] = useState(() => alwaysOpen);
  useEffect(() => {
    if (alwaysOpen && !open) {
      setOpen(true);
    }
  }, [alwaysOpen, open]);
  return (
    <div
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {name && (
        <a
          sx={itemStyle(false)}
          onClick={() => {
            setOpen(alwaysOpen ? true : !open);
          }}
        >
          <ChevronRightIcon
            sx={{
              mt: "-2px",
              mr: "5px",
              width: "18px",
              height: "18px",
              verticalAlign: "middle",
              transform: open ? "rotate(90deg)" : undefined,
            }}
          />
          {name}
        </a>
      )}
      {open && !!groupStoryDefs.length && (
        <div
          sx={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {name && (
            <div
              sx={{
                position: "absolute",
                top: "3px",
                left: "calc(1rem + 8px)",
                height: "calc(100% - 6px)",
                width: "1px",
                backgroundColor: theme.colors.accentSidebar,
                pointerEvents: "none",
              }}
            />
          )}
          {groupStoryDefs.map((v) => {
            const groupItemActive = activeStoryId === v.id;
            return (
              <a
                key={v.id}
                href={`?story-id=${v.id}`}
                sx={{ ...itemStyle(groupItemActive) }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  history.pushState({ storyId: v.id }, "", `?story-id=${v.id}`);
                }}
              >
                <span sx={{ pl: name ? "23px" : undefined }}>
                  {v.name}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

const textStyle = {
  color: "inherit",
  fontSize: "0.85rem",
  letterSpacing: "0.065em",
  textTransform: "uppercase",
  fontWeight: theme.colorScheme === "dark" ? 300 : 400,
};

const itemStyle = (active: boolean) => ({
  px: "1rem",
  py: "0.5rem",
  backgroundColor: active ? theme.colors.accentSidebar : undefined,
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
});
