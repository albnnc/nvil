import useSWR from "swr";
import { StoryMeta } from "../../_utils/story_meta.ts";

export interface StoryDef {
  id: string;
  entryPoint: string;
  name: string;
  group?: string;
  inputSchema?: unknown;
}

export function useStoryDefs(): [
  StoryDef[] | undefined,
  boolean,
] {
  const { data, isLoading } = useSWR<StoryDef[]>(
    "./stories",
    async (key: string) => {
      const resp = await fetch(key);
      if (!resp.ok) {
        throw new Error(resp.statusText);
      }
      const raw: StoryMeta[] = await resp.json();
      return (raw ?? [])
        .map((v) => ({
          ...v,
          name: typeof v.name === "string" ? v.name : v.id,
          group: typeof v.group === "string" ? v.group : undefined,
        }))
        .sort((a, b) =>
          a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
        );
    },
  );
  return [data, isLoading];
}
