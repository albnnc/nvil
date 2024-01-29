import React from "react";
import { createReactElementLoader } from "../common.ts";

export const meta = {
  name: "Button",
  group: "Interactive",
};

export const load = createReactElementLoader(<button>Button</button>);
