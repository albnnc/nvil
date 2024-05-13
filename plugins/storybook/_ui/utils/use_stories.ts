import { useCallback, useEffect, useState } from "react";

export function useStories() {
  const [stories, setStories] = useState<StoryDef[]>([]);

  const fetchStories = useCallback(() => {
    fetch("/api/stories")
      .then((resp) => resp.json())
      .then(setStories);
  }, []);

  useEffect(() => {
    fetchStories();
  }, []);

  return { stories };
}

export interface StoryDef {
  id: string;
  description?: string;
  entryPoint: string;
  name: string;
  group?: string;
  inputSchema?: unknown;
}
