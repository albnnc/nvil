import React from "react";
import { createReactElementLoader } from "../common.ts";

export const meta = {
  name: "Box",
  group: "Components",
};

export const load = createReactElementLoader(
  <div
    style={{
      padding: "1em",
      width: "100px",
      height: "100px",
      border: "1px solid currentColor",
    }}
  >
    Box
  </div>
);
