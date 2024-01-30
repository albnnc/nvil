import React from "react";
import { createReactElementLoader, getStoryInput } from "../common.ts";

export const meta = {
  name: "Text",
  inputSchema: {
    type: "string",
    title: "Content",
    default: "Lorem ipsum dolor sit amet.",
  },
};

const Story = () => {
  const input = getStoryInput();
  return <p>{input}</p>;
};

export const load = createReactElementLoader(<Story />);
