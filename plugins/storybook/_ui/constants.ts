// @ts-ignore: compile-time constants
const constants = STORYBOOK_CONSTANTS || {
  groupOrder: [],
};

export const { groupOrder } = constants as { groupOrder: string[] };
