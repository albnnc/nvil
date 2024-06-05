import { StorybookPluginOptionsConstants } from "../mod.ts";

// @ts-ignore: compile-time constants
const constants = STORYBOOK_CONSTANTS || {
  groupOrder: [],
  appTitle: "Storybook",
};

export const { groupOrder, appTitle } =
  constants as StorybookPluginOptionsConstants;
