import React from "react";
import { createReactElementLoader } from "../common.ts";

export const meta: Meta = {
  name: "Anchor",
  group: "Components",
  inputSchema: {},
};

export const load = createReactElementLoader(<a href="#">Anchor</a>);
