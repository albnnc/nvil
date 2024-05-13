import React from "react";
import { createReactElementLoader } from "../common.ts";

export const meta = {
  name: "Text2",
  group: "Components",
};

export const load = createReactElementLoader(
  <p>Lorem ipsum dolor sit amet.</p>
);
