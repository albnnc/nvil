import React from "react";
import { createReactElementLoader } from "../common.ts";

export const meta = {
  name: "Button",
  group: "Components",
  description:
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
};

export const load = createReactElementLoader(<button>Button</button>);
