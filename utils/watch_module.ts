import { async, path } from "../_deps.ts";
import { expandModule, ExpandedModule } from "./expand_module.ts";

interface WatchModuleOptions {
  signal?: AbortSignal;
}

export function watchModule(
  specifier: string,
  { signal }: WatchModuleOptions = {}
) {
  return {
    async *[Symbol.asyncIterator]() {
      if (signal?.aborted) {
        return;
      }
      let watcherId: string | undefined;
      let watcher: Deno.FsWatcher | undefined;
      let expanded: ExpandedModule | undefined;
      const iterable = new async.MuxAsyncIterator<Deno.FsEvent>();
      const updateIterable = async () => {
        const updateId = watcherId;
        const nextExpanded = await expandModule(specifier);
        if (
          watcherId !== updateId ||
          (watcher && expanded && nextExpanded.commonUrl === expanded.commonUrl)
        ) {
          return;
        }
        watcherId = crypto.randomUUID();
        const nextWatcher = Deno.watchFs(
          path.fromFileUrl(nextExpanded.commonUrl)
        );
        iterable.add(nextWatcher);
        watcher?.close();
        watcher = nextWatcher;
        expanded = nextExpanded;
        signal?.addEventListener("abort", () => watcher?.close());
      };
      await updateIterable();
      for await (const event of iterable) {
        if (signal?.aborted) {
          break;
        }
        const expandedPaths = new Set(
          expanded?.fileUrls.map((v) => path.fromFileUrl(v))
        );
        if (event.paths.every((v) => !expandedPaths.has(v))) {
          continue;
        }
        yield event;
        updateIterable();
      }
    },
  };
}
