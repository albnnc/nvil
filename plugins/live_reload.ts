import { getAvailablePort } from "@std/net";
import { Plugin, type PluginApplyOptions } from "../plugin.ts";

export interface LiveReloadPluginOptions {
  scope?: string;
  url?: string;
}

export class LiveReloadPlugin extends Plugin {
  scope?: string;
  port = getAvailablePort({ preferredPort: 43000 });
  callbacks = new Map<string, () => void>();

  get liveReloadScript() {
    return `
      const eventSource = new EventSource("http://localhost:${this.port}");
      eventSource.addEventListener("message", () => {
        location.reload();
      });
    `
      .trim()
      .replace(/\s+/g, " ");
  }

  constructor(options: LiveReloadPluginOptions = {}) {
    super("LIVE_RELOAD");
    this.scope = options.scope;
  }

  apply(options: PluginApplyOptions) {
    super.apply(options);
    if (!this.project.dev) {
      return;
    }
    this.serve();
    const scriptUrl = "./live-reload.js";
    this.project.stager.on("BOOTSTRAP", async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(this.liveReloadScript);
      this.logger.info(`Populating ${scriptUrl}`);
      this.project.bundle.set(scriptUrl, { data });
      await this.project.stager.run("LIVE_RELOAD_SCRIPT_POPULATE");
    });
    this.project.stager.on("WRITE_END", (changes) => {
      if (!this.project.bundle.has(scriptUrl)) {
        return;
      }
      const shouldReload = (changes as string[])
        .reduce<boolean>((p, v) => {
          const entry = this.project.bundle.get(v);
          return p || !!(entry && entry.scope === this.scope);
        }, false);
      if (!shouldReload) {
        return;
      }
      this.reload();
    });
  }

  // TODO: Implement disposal.
  private serve() {
    Deno.serve({
      port: this.port,
    }, (req) => {
      if (req.method === "OPTIONS") {
        return new Response(null, {
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }
      if (req.method === "GET") {
        const id = crypto.randomUUID();
        const { callbacks } = this;
        const body = new ReadableStream({
          start(controller) {
            callbacks.set(id, () => controller.enqueue(`data: null\n\n`));
          },
          cancel() {
            callbacks.delete(id);
          },
        });
        return new Response(body.pipeThrough(new TextEncoderStream()), {
          headers: {
            "Content-Type": "text/event-stream",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
      if (req.method === "POST") {
        this.reload();
        return new Response(null, {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }
      return new Response(null, {
        status: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
      });
    });
  }

  private reload() {
    this.logger.info("Reloading");
    this.callbacks.forEach((fn) => fn());
  }
}
