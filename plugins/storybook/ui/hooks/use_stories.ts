import useSWR from "swr";
import { StoryMeta } from "../../story_meta.ts";
import { fetcher } from "../_utils/fetcher.ts";

export function useStories() {
  const { data, error, isLoading } = useSWR<StoryMeta[]>("./stories", fetcher);
  return { data, error, isLoading };
}
