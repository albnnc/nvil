import { async, path } from "../deps.ts";
import { expandModule } from "./expand_module.ts";

export function watchModule(specifier: string) {
  let closed = false;
  return {
    close: () => {
      closed = true;
    },
    async *[Symbol.asyncIterator]() {
      if (closed) {
        return;
      }
      const iterable = new async.MuxAsyncIterator<Deno.FsEvent>();
      let expanded = await expandModule(specifier);
      let watcher = Deno.watchFs(path.fromFileUrl(expanded.commonUrl));
      this.close = () => {
        closed = true;
        watcher.close();
      };
      iterable.add(watcher);
      for await (const event of iterable) {
        if (closed) {
          break;
        }
        if (
          event.paths.every((v) =>
            expanded.fileUrls.every((t) => t !== path.toFileUrl(v).toString())
          )
        ) {
          continue;
        }
        yield event;
        const nextExpanded = await expandModule(specifier);
        if (nextExpanded.commonUrl !== expanded.commonUrl) {
          const nextWatcher = Deno.watchFs(nextExpanded.commonUrl);
          iterable.add(nextWatcher);
          watcher.close();
          expanded = nextExpanded;
          watcher = nextWatcher;
          this.close = () => {
            closed = true;
            watcher.close();
          };
        }
      }
    },
  };
}
