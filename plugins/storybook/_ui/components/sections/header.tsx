/** @jsx jsx */
import { jsx } from "@emotion/react";
import { theme } from "../../constants.ts";
import { useStorySummary } from "../../hooks/use_story_summary.ts";
import { ChevronRightIcon } from "../icons/chevron_right.tsx";

export const Header = () => {
  const { activeStoryDef } = useStorySummary() ?? {};
  const { name = "Unknown", group } = activeStoryDef ?? {};
  return (
    <div
      css={{
        display: "flex",
        alignItems: "center",
        // background: theme.colors.foreground,
        height: "56px",
        paddingLeft: "24px",
        paddingRight: "24px",
        borderBottom: "1px solid rgb(216, 222, 228)",
      }}
    >
      <a
        href="/"
        css={{
          TextDecoration: "unset",
          fontSize: "16px",
          fontWeight: 500,
          lineHeight: 1.5,
          letterSpacing: "0.03em",
        }}
      >
        Storybook
      </a>
    </div>
  );
};
