import React from "react";
import { createReactElementLoader, getStoryInput } from "../common.ts";

export const meta = {
  name: "With Input Panel",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        title: "Text",
        default: "Lorem ipsum dolor sit amet.",
      },
      select: {
        type: "string",
        title: "Select",
        default: "2",
        oneOf: [
          { const: "1", title: "One" },
          { const: "2", title: "Two" },
          { const: "3", title: "Three" },
        ],
        layout: {
          field: "select",
        },
      },
    },
  },
};

const Story = () => {
  const input = getStoryInput();
  return <pre><code>{JSON.stringify(input, null, 2)}</code></pre>;
};

export const load = createReactElementLoader(<Story />);
