/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { useCallback, useEffect, useMemo, useState } from "react";
import { theme } from "../constants.ts";
import { useStories } from "../hooks/use_stories.ts";
import { useStoryId } from "../hooks/use_story_id.ts";
import { IconChevronRight } from "./icon_chevron_right.tsx";
import { IconEmpty } from "./icon_emty.tsx";
import { IconSearch } from "./icon_search.tsx";

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

interface Item {
  id: string;
  name: string;
  group?: string | undefined;
  entryPoint: string;
}

export const Sidebar = () => {
  const storyId = useStoryId();
  const { data } = useStories();
  const [query, setQuery] = useState("");
  const items = useMemo(
    () =>
      (data ?? [])
        .map((v) => ({
          ...v,
          name: typeof v.name === "string" ? v.name : v.id,
          group: typeof v.group === "string" ? v.group : undefined,
        }))
        .sort((a, b) =>
          a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
        )
        .filter(
          (v) =>
            !query ||
            v.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
        ),
    [data, query],
  );
  const groups = useMemo(() => {
    return Array
      .from(new Set(items.map((v) => v.group)))
      .filter((v) => v) as string[];
  }, [items]);
  const renderGroup = useCallback((group: string | undefined) => {
    const groupItems = items.filter((v) => v.group === group);
    const groupActive = groupItems.some((v) => v.id === storyId);
    return (
      <div
        key={group}
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {group && (
          <a sx={itemStyle(false)}>
            <IconChevronRight
              sx={{
                mt: "-2px",
                mr: "5px",
                width: "18px",
                height: "18px",
                verticalAlign: "middle",
                transform: groupActive ? "rotate(90deg)" : undefined,
              }}
            />
            {group}
          </a>
        )}
        {groupItems.map((v) => {
          const groupItemActive = storyId === v.id;
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
              <span sx={{ pl: "23px" }}>
                {v.name}
              </span>
            </a>
          );
        })}
      </div>
    );
  }, [items, storyId]);
  useEffect(() => {
    const firstItem = items?.[0];
    if (!storyId && firstItem) {
      history.pushState(
        { storyId: firstItem.id },
        "",
        `?story-id=${firstItem.id}`,
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
          <div>
            {!!groups.length &&
              groups.map((v) => (
                <Group name={v} items={items} storyId={storyId} />
              ))}
            <Group items={items} storyId={storyId} />
          </div>
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
};

interface GroupProps {
  items: Item[];
  name?: string;
  storyId?: string;
}

const Group = ({ name, items, storyId }: GroupProps) => {
  const groupItems = items.filter((v) => v.group === name);
  const alwaysOpen = useMemo(() => {
    return !name || groupItems.some((v) => v.id === storyId);
  }, [name, groupItems]);
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
          <IconChevronRight
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
      {open && !!groupItems.length && (
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
          {groupItems.map((v) => {
            const groupItemActive = storyId === v.id;
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
