import React from "react";
import { createReactElementLoader, useStoryControls } from "../common.ts";

export const meta = {
  name: "With Input Panel",
  group: "Components",
  controls: {
    label: {
      type: "text",
      default: "Lorem ipsum dolor sit amet.",
    },
    config: {
      type: "checkbox",
      default: true,
    },
    select: {
      type: "select",
      default: "First",
      items: ["First", "Second", "Third"],
    },
    radio: {
      type: "radio",
      default: "First",
      items: ["First", "Second", "Third"],
    },
  },
};

const Story = () => {
  const controls = useStoryControls();

  return (
    <pre>
      <code>{JSON.stringify(controls, null, 2)}</code>
    </pre>
  );
};

export const load = createReactElementLoader(<Story />);
