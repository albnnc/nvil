import { useEffect, useState } from "react";
import { getStoryInput } from "../utils/get_story_input.ts";

export function useStoryInput() {
  const [storyId, setStoryInput] = useState<unknown>(getStoryInput);
  useEffect(() => {
    const listen = () => {
      setStoryInput(getStoryInput());
    };
    addEventListener("pushSearchParams", listen);
    return () => {
      removeEventListener("pushSearchParams", listen);
    };
  }, []);
  return storyId;
}
