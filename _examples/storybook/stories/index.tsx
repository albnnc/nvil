import React from "react";
import { createReactElementLoader } from "../common.ts";

export const meta = {
  index: true,
};

export const load = createReactElementLoader(
  <span>
    Lorem ipsum dolor sit, amet consectetur adipisicing elit. A numquam
    necessitatibus dignissimos commodi. Voluptatibus, aliquid facere iste,
    accusamus provident id obcaecati recusandae sed cum aliquam laboriosam
    beatae dolores animi a.
  </span>,
);
