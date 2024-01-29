import { useMemo } from "react";
import { StoryDef } from "./use_story_defs.ts";

export function useStoryGroups(
  storyDescriptions?: StoryDef[],
): string[] {
  return useMemo(() => {
    return Array
      .from(new Set((storyDescriptions ?? []).map((v) => v.group)))
      .filter((v) => v) as string[];
  }, [storyDescriptions]);
}
