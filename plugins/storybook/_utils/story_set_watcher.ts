import { async, fs, path } from "../../../_deps.ts";

export interface StorySetWatcherEvent {
  type: "FIND" | "LOSS";
  entryPoint: string;
}

export interface StorySetOptions {
  rootUrl: string;
  globUrl: string;
}

export class StorySetWatcher
  implements Disposable, AsyncIterable<StorySetWatcherEvent> {
  data = new Set<string>();

  private rootUrl: string;
  private globUrl: string;
  private fsWatcher?: Deno.FsWatcher;
  private queuePWR = Promise.withResolvers<StorySetWatcherEvent[]>();

  constructor({ rootUrl, globUrl }: StorySetOptions) {
    this.rootUrl = rootUrl;
    this.globUrl = globUrl;
  }

  async *[Symbol.asyncIterator](this: StorySetWatcher) {
    if (!this.fsWatcher) {
      throw new Error("Not watching");
    }
    const queue = await this.queuePWR.promise;
    if (!queue.length) {
      return;
    }
    for (const v of queue) {
      yield v;
    }
    this.queuePWR = Promise.withResolvers();
  }

  [Symbol.dispose](this: StorySetWatcher) {
    this.fsWatcher?.[Symbol.dispose]();
    this.queuePWR.resolve([]);
  }

  async walk(this: StorySetWatcher) {
    const nextQueue: StorySetWatcherEvent[] = [];
    const nextData = new Set<string>();
    const globPath = path.fromFileUrl(new URL(this.globUrl, this.rootUrl));
    for await (const v of fs.expandGlob(globPath, { globstar: true })) {
      v.isFile && nextData.add(path.toFileUrl(v.path).toString());
    }
    for (const v of nextData.values()) {
      if (!this.data.has(v)) {
        nextQueue.push({ type: "FIND", entryPoint: v });
        this.data.add(v);
      }
    }
    for (const v of this.data.values()) {
      if (!nextData.has(v)) {
        nextQueue.push({ type: "LOSS", entryPoint: v });
        this.data.delete(v);
      }
    }
    this.queuePWR.resolve(nextQueue);
  }

  async watch(this: StorySetWatcher) {
    this.fsWatcher = Deno.watchFs(path.fromFileUrl(this.rootUrl));
    const debounced = async.debounce(() => this.walk(), 200);
    for await (const _ of this.fsWatcher) {
      debounced();
    }
  }
}
