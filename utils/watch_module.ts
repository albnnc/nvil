import { async } from "../deps.ts";
import { expandModule } from "./expand_module.ts";

export function watchModule(modulePath: string) {
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
      let expanded = await expandModule(modulePath);
      let watcher = Deno.watchFs(expanded.commonDir);
      this.close = () => {
        closed = true;
        watcher.close();
      };
      iterable.add(watcher);
      for await (const event of iterable) {
        if (closed) {
          break;
        }
        if (event.paths.every((v) => !expanded.filePaths.includes(v))) {
          continue;
        }
        yield event;
        const nextExpanded = await expandModule(modulePath);
        if (nextExpanded.commonDir !== expanded.commonDir) {
          const nextWatcher = Deno.watchFs(nextExpanded.commonDir);
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
