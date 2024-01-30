import { useEffect, useState } from "react";
import { getStoryId } from "../utils/get_story_id.ts";

export function useStoryId() {
  const [storyId, setStoryId] = useState<string | undefined>(getStoryId);
  useEffect(() => {
    const listen = () => {
      setStoryId(getStoryId());
    };
    addEventListener("pushSearchParams", listen);
    return () => {
      removeEventListener("pushSearchParams", listen);
    };
  }, []);
  return storyId;
}