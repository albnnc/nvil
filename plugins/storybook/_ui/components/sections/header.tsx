/** @jsx jsx */
import { jsx } from "@emotion/react";
import { useMemo } from "react";
import { theme } from "../../constants.ts";
import { useStoryDefs } from "../../hooks/use_story_defs.ts";
import { useStoryId } from "../../hooks/use_story_id.ts";
import { ChevronRightIcon } from "../icons/chevron_right.tsx";

export const Header = () => {
  const storyId = useStoryId();
  const [storyDefs = []] = useStoryDefs();
  const story = useMemo(() => {
    return storyDefs.find((v) => v.id === storyId);
  }, [storyId, storyDefs]);
  const { name = "Unknown", group } = story ?? {};
  return (
    <div
      css={{
        padding: "1rem",
        paddingTop: "1.3rem",
        display: "flex",
        alignItems: "center",
        background: theme.colors.foreground,
        fontSize: "1rem",
        letterSpacing: "0.065em",
        textTransform: "uppercase",
        fontWeight: theme.colorScheme === "dark" ? 300 : 400,
      }}
    >
      {!!group && (
        <span css={{ opacity: 0.65 }}>
          {group}
          <ChevronRightIcon
            css={{
              marginTop: "-2px",
              marginLeft: "0.5em",
              marginRight: "0.5em",
              width: "0.85em",
              height: "0.85em",
              verticalAlign: "middle",
            }}
          />
        </span>
      )}
      {name}
    </div>
  );
};
