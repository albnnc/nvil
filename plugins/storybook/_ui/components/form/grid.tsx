/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { HTMLAttributes } from "react";

export const Grid = (props: HTMLAttributes<HTMLDivElement>) => (
  <div
    css={{ display: "flex", flexDirection: "column", gap: "var(--space-l)" }}
    {...props}
  />
);
