import { defaultTheme, Theme } from "./theme.ts";

// @ts-ignore: compile-time constants
const constants = STORYBOOK_CONSTANTS || {
  theme: defaultTheme,
};

export const { theme } = constants as { theme: Theme };
