/** @jsx jsx */
import { jsx } from "@theme-ui/core";
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
      sx={{
        pt: "1.3rem",
        pb: "1rem",
        px: "1rem",
        display: "flex",
        alignItems: "center",
        background: theme.colors.sidebar,
        fontSize: "1rem",
        letterSpacing: "0.065em",
        textTransform: "uppercase",
        fontWeight: theme.colorScheme === "dark" ? 300 : 400,
      }}
    >
      {!!group && (
        <span sx={{ opacity: 0.65 }}>
          {group}
          <ChevronRightIcon
            sx={{
              mt: "-2px",
              mx: "0.5em",
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
