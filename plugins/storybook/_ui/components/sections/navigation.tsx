/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useEffect, useMemo, useState } from "react";
import { theme } from "../../constants.ts";
import { useStoryDefs } from "../../hooks/use_story_defs.ts";
import { StoryDef } from "../../hooks/use_story_defs.ts";
import { useStoryGroups } from "../../hooks/use_story_groups.ts";
import { useStoryId } from "../../hooks/use_story_id.ts";
import { pushSearchParams } from "../../utils/push_search_params.ts";
import { ChevronRightIcon } from "../icons/chevron_right.tsx";
import { EmptyIcon } from "../icons/emty.tsx";
import { SearchIcon } from "../icons/search.tsx";

export const Navigation = () => {
  const storyId = useStoryId();
  const [query, setQuery] = useState("");
  const [storyDefs = []] = useStoryDefs();
  const filteredStoryDefs = useMemo(() => {
    return storyDefs.filter((v) =>
      !query || v.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    );
  }, [query, storyDefs]);
  const storyGroups = useStoryGroups(filteredStoryDefs);
  useEffect(() => {
    const firstStoryDef = storyDefs?.[0];
    if (!storyId && firstStoryDef) {
      pushSearchParams(
        ["story-id", firstStoryDef.id],
        ["story-input", undefined],
      );
    }
  }, [storyDefs]);
  return (
    <div
      css={{
        padding: "1rem 0",
        flex: "0 0 250px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.colors.sidebar,
        color: theme.colors.onSidebar,
      }}
    >
      <div
        css={{
          paddingTop: "0.5rem",
          paddingBottom: "0.85rem",
          paddingLeft: "1rem",
          paddingRight: "1rem",
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${theme.colors.accentSidebar}`,
        }}
      >
        <SearchIcon
          css={{
            marginRight: "5px",
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
          css={{
            flex: "1 1 auto",
            border: 0,
            background: "transparent",
            outline: "none",
            padding: 0,
            fontFamily: "inherit",
            ...textStyle,
            "&::placeholder": {
              ...textStyle,
              opacity: 0.5,
            },
          }}
        />
      </div>
      {filteredStoryDefs.length
        ? (
          <div css={{ paddingTop: "0.5rem" }}>
            {!!storyGroups.length &&
              storyGroups.map((v) => (
                <Group
                  name={v}
                  storyDefs={filteredStoryDefs}
                  activeStoryId={storyId}
                />
              ))}
            <Group
              storyDefs={filteredStoryDefs}
              activeStoryId={storyId}
            />
          </div>
        )
        : (
          <EmptyIcon
            width="1.65rem"
            height="1.65rem"
            css={{ margin: "0 auto", marginTop: "0.75rem" }}
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
      css={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {name && (
        <a
          css={itemStyle(false)}
          onClick={() => {
            setOpen(alwaysOpen ? true : !open);
          }}
        >
          <ChevronRightIcon
            css={{
              marginTop: "-2px",
              marginRight: "5px",
              width: "16px",
              height: "16px",
              verticalAlign: "middle",
              transform: open ? "rotate(90deg)" : undefined,
            }}
          />
          {name}
        </a>
      )}
      {open && !!groupStoryDefs.length && (
        <div
          css={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {name && (
            <div
              css={{
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
                css={itemStyle(groupItemActive)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  pushSearchParams(
                    ["story-id", v.id],
                    ["story-input", undefined],
                  );
                }}
              >
                <span css={{ paddingLeft: name ? "23px" : undefined }}>
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
} as const;

const itemStyle = (active: boolean) => ({
  padding: "0.5rem 1rem",
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
} as const);
