import { titleCase } from "case";
import { StoryMeta } from "../../story_meta.ts";

export function getStoryName({ entryPoint }: StoryMeta) {
  return titleCase(
    entryPoint
      .replace("_story", "")
      .replace(".story", "")
      .replace(/\.[^\.]+$/, "")
      .replace(/^.+\//, "")
  );
}
