/** @jsx jsx */
import { jsx } from "@theme-ui/core";
import { SVGAttributes } from "react";

export const ChevronRightIcon = (props: SVGAttributes<SVGSVGElement>) => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    stroke-width="0"
    viewBox="0 0 512 512"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="48"
      d="m184 112 144 144-144 144"
    >
    </path>
  </svg>
);
