import { Atom } from "../atom.ts";

const callbacks = new Map<string, () => void>();

export function handleLiveReloadRequest(request: Request) {
  const { pathname } = new URL(request.url);
  if (pathname !== "/live-reload-events") {
    return;
  }
  if (request.method === "GET") {
    const id = crypto.randomUUID();
    const body = new ReadableStream({
      start(controller) {
        callbacks.set(id, () => controller.enqueue(`data: null\n\n`));
      },
      cancel() {
        callbacks.delete(id);
      },
    });
    return new Response(body.pipeThrough(new TextEncoderStream()), {
      headers: { "Content-Type": "text/event-stream" },
    });
  }
  if (request.method === "POST") {
    callbacks.forEach((fn) => fn());
    return new Response(null, { status: 200 });
  }
}

export interface LiveReloadConfig {
  url?: string;
}

export function liveReload({ url }: LiveReloadConfig = {}): Atom {
  return ({ config: { dev }, bundle, getLogger, onStage, runStage }) => {
    const logger = getLogger("liveReload");
    if (!dev) {
      return;
    }
    const scriptUrl = "./live-reload.js";
    onStage("BOOTSTRAP", async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(liveReloadScript);
      logger.info(`Populating ${scriptUrl}`);
      bundle.set(scriptUrl, { data });
      await runStage("LIVE_RELOAD_SCRIPT_POPULATE");
    });
    onStage("BUILD_END", async () => {
      if (!bundle.has(scriptUrl)) {
        return;
      }
      // TODO: Check scope.
      logger.info("Reloading");
      await fetch(
        new URL("/live-reload-events", url ?? "http://localhost:8000"),
        { method: "POST" }
      )
        .then(async (v) => {
          await v.body?.cancel();
          if (!v.ok) {
            logger.warning("Unable to request reload");
          }
        })
        .catch(() => undefined);
    });
  };
}

const liveReloadScript = `
const eventSource = new EventSource("/live-reload-events");
eventSource.addEventListener("message", () => {
  location.reload();
});
`.trimStart();
