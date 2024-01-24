import { async, path } from "../../deps.ts";
import { updateStorySet, UpdateStorySetOptions } from "./update_story_set.ts";

export interface WatchStorySetOptions extends UpdateStorySetOptions {
  signal?: AbortSignal;
}

export function watchStorySet(
  set: Set<string>,
  { signal, ...rest }: WatchStorySetOptions
) {
  const watch = async () => {
    const watcher = Deno.watchFs(path.fromFileUrl(rest.rootUrl));
    const update = async.debounce(() => updateStorySet(set, rest), 200);
    signal?.addEventListener("abort", () => watcher.close());
    for await (const _ of watcher) {
      update();
    }
  };
  watch();
}
