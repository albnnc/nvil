import { useEffect, useState } from "react";
import { getStoryId } from "../_utils/get_story_id.ts";

export function useStoryId() {
  const [storyId, setStoryId] = useState<string | undefined>(getStoryId);
  useEffect(() => {
    let priorState: unknown;
    const intervalId = setInterval(() => {
      if (priorState !== history.state) {
        priorState = history.state;
        setStoryId(getStoryId());
      }
    }, 100);
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  return storyId;
}
