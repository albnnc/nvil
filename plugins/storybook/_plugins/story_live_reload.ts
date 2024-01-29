import { async } from "../../../_deps.ts";
import { Plugin, PluginApplyOptions } from "../../../plugin.ts";

export class StoryLiveReloadPlugin extends Plugin {
  constructor() {
    super("STORY_LIVE_RELOAD");
  }

  apply(this: StoryLiveReloadPlugin, options: PluginApplyOptions) {
    super.apply(options);
    if (!this.project.dev) {
      return;
    }
    const handleChange = async.debounce(async (change: string) => {
      const entry = this.project.bundle.get(change);
      if (!entry || entry.scope !== undefined) {
        return;
      }
      const storyBaseUrl = new URL("./", new URL(change, this.project.destUrl));
      const storyMetaUrl = new URL("./meta.json", storyBaseUrl);
      const { id } = await fetch(storyMetaUrl).then((v) => v.json());
      this.logger.info(`Reloading`);
      await fetch(new URL("http://localhost:8000/story-reload-events"), {
        method: "POST",
        body: id,
      })
        .then(async (v) => {
          await v.body?.cancel();
          if (!v.ok) {
            this.logger.warning("Unable to request reload");
          }
        })
        .catch(() => undefined);
    }, 200);
    this.project.stager.on("WRITE_END", (changes) => {
      for (const change of changes as string[]) {
        handleChange(change);
      }
    });
  }

  static callbacks = new Map<string, (id: string) => void>();

  static handleStoryLiveReloadRequest(request: Request) {
    const { pathname } = new URL(request.url);
    if (pathname !== "/story-reload-events") {
      return;
    }
    if (request.method === "GET") {
      const callbackId = crypto.randomUUID();
      const body = new ReadableStream({
        start(controller) {
          StoryLiveReloadPlugin.callbacks.set(callbackId, (id) => {
            controller.enqueue(`data: ${id}\n\n`);
          });
        },
        cancel() {
          StoryLiveReloadPlugin.callbacks.delete(callbackId);
        },
      });
      return new Response(body.pipeThrough(new TextEncoderStream()), {
        headers: { "Content-Type": "text/event-stream" },
      });
    }
    if (request.method === "POST") {
      request
        .text()
        .then((v) => StoryLiveReloadPlugin.callbacks.forEach((fn) => fn(v)));
      return new Response(null, { status: 200 });
    }
  }
}
