/** @jsx jsx */
import { jsx } from "@emotion/react";
import { HTMLAttributes } from "react";

export const Grid = (props: HTMLAttributes<HTMLDivElement>) => (
  <div
    css={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    {...props}
  />
);
