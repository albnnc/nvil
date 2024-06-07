/** @jsx jsx */
import { jsx } from "@emotion/react";
import { keyframes } from "@emotion/react";
import { SVGAttributes } from "react";

const speed = 750;

export const Loader = (props: SVGAttributes<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    css={{
      width: "100%",
      height: "100%",
      animation: `${spinAnimation} ${speed}ms linear infinite`,
    }}
    {...props}
  >
    <path d="M0 0h24v24H0z" stroke="none" />
    <path d="M12 3a9 9 0 1 0 9 9" />
  </svg>
);

const spinAnimation = keyframes({
  from: { transform: `rotate(0deg)` },
  to: { transform: `rotate(360deg)` },
});
