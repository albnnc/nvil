import React from "react";
import { createReactElementLoader } from "../common.ts";

export const meta = {
  name: "Button",
  group: "Actions",
};

export const load = createReactElementLoader(<button>Button</button>);
