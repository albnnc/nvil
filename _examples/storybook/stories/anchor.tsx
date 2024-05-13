import React from "react";
import { createReactElementLoader } from "../common.ts";

export const meta = {
  name: "Anchor",
  group: "Components",
};

export const load = createReactElementLoader(<a href="#">Anchor</a>);
