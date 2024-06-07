import { useCallback, useEffect, useState } from "react";

export function useStories() {
  const [stories, setStories] = useState<StoryDef[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchStories = useCallback(() => {
    fetch("/api/stories")
      .then((resp) => resp.json())
      .then(setStories)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    fetchStories();
  }, []);

  return { stories, loaded };
}

export interface StoryDef {
  id: string;
  index?: boolean;
  entryPoint: string;
  name: string;
  group?: string;
  controls?: Record<string, unknown>;
}
