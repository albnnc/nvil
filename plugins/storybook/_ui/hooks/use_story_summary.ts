import { useMemo } from "react";
import useSWR from "swr";
import { isWalkable } from "../../../../_utils/is_walkable.ts";
import { StoryMeta } from "../../_utils/story_meta.ts";
import { getSchemaDefaults } from "../utils/get_schema_defaults.ts";
import { useSearchParams } from "./use_search_params.ts";

export interface StoryDef {
  id: string;
  entryPoint: string;
  name: string;
  group?: string;
  inputSchema?: unknown;
}

export interface StorySummary {
  storyDefs?: StoryDef[];
  activeStoryId?: string;
  activeStoryDef?: StoryDef;
  activeStoryInput?: unknown;
  activeStoryDefaultInput?: unknown;
}

export function useStorySummary(): StorySummary | undefined {
  const [activeStoryId, activeStoryInputString] = useSearchParams([
    "story-id",
    "story-input",
  ]);
  const { data: storyDefs } = useSWR<StoryDef[]>(
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
          inputSchema: isWalkable(v.inputSchema) ? v.inputSchema : undefined,
        }))
        .sort((a, b) =>
          a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
        );
    },
  );
  const activeStoryInput = useMemo(() => {
    try {
      return JSON.parse(activeStoryInputString || "");
    } catch {
      return undefined;
    }
  }, [activeStoryInputString]);
  const storySummary = useMemo<StorySummary>(() => {
    if (!storyDefs) {
      return {};
    }
    const activeStoryDef = storyDefs.find((v) => v.id === activeStoryId);
    const activeStoryDefaultInput = activeStoryDef?.inputSchema
      ? getSchemaDefaults(activeStoryDef?.inputSchema)
      : undefined;
    return {
      activeStoryId,
      storyDefs,
      activeStoryInput,
      activeStoryDef,
      activeStoryDefaultInput,
    };
  }, [activeStoryId, activeStoryInput, storyDefs]);
  return storySummary;
}
