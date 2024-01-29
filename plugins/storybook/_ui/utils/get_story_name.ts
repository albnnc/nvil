import { titleCase } from "case";
import { StoryMeta } from "../../_utils/story_meta.ts";

export function getStoryName({ entryPoint }: StoryMeta) {
  const segments = entryPoint
    .replace("_story", "")
    .replace(".story", "")
    .replace(/\.[^\.]+$/, "")
    .split("/")
    .filter((v) => v !== "." && v !== ".." && v !== "mod")
    .map((v) => titleCase(v));
  return segments.join(" → ");
}
