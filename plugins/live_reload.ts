import { Plugin, PluginApplyOptions } from "../plugin.ts";

export interface LiveReloadPluginOptions {
  scope?: string;
  url?: string;
}

export class LiveReloadPlugin extends Plugin {
  scope?: string;
  url?: string;

  constructor(options: LiveReloadPluginOptions = {}) {
    super("LIVE_RELOAD");
    this.scope = options.scope;
    this.url = options.url;
  }

  apply(this: LiveReloadPlugin, options: PluginApplyOptions) {
    super.apply(options);
    if (!this.project.dev) {
      return;
    }
    const scriptUrl = "./live-reload.js";
    this.project.stager.on("BOOTSTRAP", async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(LiveReloadPlugin.liveReloadScript);
      this.logger.info(`Populating ${scriptUrl}`);
      this.project.bundle.set(scriptUrl, { data });
      await this.project.stager.run("LIVE_RELOAD_SCRIPT_POPULATE");
    });
    this.project.stager.on("WRITE_END", async (changes) => {
      if (!this.project.bundle.has(scriptUrl)) {
        return;
      }
      const shouldReload = (changes as string[]).reduce<boolean>((p, v) => {
        const entry = this.project.bundle.get(v);
        return p || !!(entry && entry.scope === this.scope);
      }, false);
      if (!shouldReload) {
        return;
      }
      this.logger.info("Reloading");
      await fetch(
        new URL("/live-reload-events", this.url ?? "http://localhost:8000"),
        { method: "POST" },
      )
        .then(async (v) => {
          await v.body?.cancel();
          if (!v.ok) {
            this.logger.warning("Unable to request reload");
          }
        })
        .catch(() => undefined);
    });
  }

  static liveReloadScript = `
    const eventSource = new EventSource("/live-reload-events");
    eventSource.addEventListener("message", () => {
      location.reload();
    });
  `
    .trim()
    .replace(/\s+/g, " ");

  static handleLiveReloadRequest(request: Request) {
    const { pathname } = new URL(request.url);
    if (pathname !== "/live-reload-events") {
      return;
    }
    if (request.method === "GET") {
      const id = crypto.randomUUID();
      const body = new ReadableStream({
        start(controller) {
          LiveReloadPlugin.callbacks.set(
            id,
            () => controller.enqueue(`data: null\n\n`),
          );
        },
        cancel() {
          LiveReloadPlugin.callbacks.delete(id);
        },
      });
      return new Response(body.pipeThrough(new TextEncoderStream()), {
        headers: { "Content-Type": "text/event-stream" },
      });
    }
    if (request.method === "POST") {
      LiveReloadPlugin.callbacks.forEach((fn) => fn());
      return new Response(null, { status: 200 });
    }
  }

  private static callbacks = new Map<string, () => void>();
}
