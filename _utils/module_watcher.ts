import { async, path } from "../_deps.ts";
import { expandModule } from "./expand_module.ts";
import { ExpandedModule } from "./expand_module.ts";

export interface ModuleWatcherOptions {
  specifier: string;
}

export class ModuleWatcher implements Disposable, AsyncIterable<Deno.FsEvent> {
  specifier: string;
  disposed = false;

  constructor(options: ModuleWatcherOptions) {
    this.specifier = options.specifier;
  }

  fsWatcherId?: string;
  fsWatcher?: Deno.FsWatcher;
  expanded?: ExpandedModule;
  iterable = new async.MuxAsyncIterator<Deno.FsEvent>();

  async updateIterable() {
    const updateId = this.fsWatcherId;
    const nextExpanded = await expandModule(this.specifier);
    if (
      this.fsWatcherId !== updateId ||
      (this.fsWatcher &&
        this.expanded &&
        nextExpanded.commonUrl === this.expanded.commonUrl)
    ) {
      return;
    }
    this.fsWatcherId = crypto.randomUUID();
    const nextFsWatcher = Deno.watchFs(
      path.fromFileUrl(nextExpanded.commonUrl),
    );
    this.iterable.add(nextFsWatcher);
    this.fsWatcher?.[Symbol.dispose]();
    this.fsWatcher = nextFsWatcher;
    this.expanded = nextExpanded;
  }

  async *[Symbol.asyncIterator]() {
    if (this.disposed) {
      return;
    }
    await this.updateIterable();
    for await (const event of this.iterable) {
      if (this.disposed) {
        break;
      }
      const expandedPathSet = new Set(
        this.expanded?.fileUrls.map((v) => path.fromFileUrl(v)),
      );
      if (event.paths.every((v) => !expandedPathSet.has(v))) {
        continue;
      }
      yield event;
      this.updateIterable();
    }
  }

  [Symbol.dispose]() {
    this.disposed = true;
    this.fsWatcher?.[Symbol.dispose]();
  }
}
