import { Atom } from "../atom.ts";

const callbacks = new Map<string, () => void>();

export function handleLiveReloadRequest(request: Request) {
  const { pathname } = new URL(request.url);
  if (pathname !== "/live-reload-events") {
    return;
  }
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

export function liveReload(): Atom {
  return ({ config: { dev }, bundle, getLogger, onStage, runStage }) => {
    const logger = getLogger("liveReload");
    if (!dev) {
      return;
    }
    const url = "./live-reload.js";
    onStage("BOOTSTRAP", async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(liveReloadScript);
      logger.info(`Populating ${url}`);
      bundle.set(url, { data });
      await runStage("LIVE_RELOAD_SCRIPT_POPULATE");
    });
    onStage("BUILD_END", () => {
      if (!bundle.has(url)) {
        return;
      }
      logger.info("Reloading");
      callbacks.forEach((fn) => fn());
    });
  };
}

const liveReloadScript = `
const eventSource = new EventSource("/live-reload-events");
eventSource.addEventListener("message", () => {
  location.reload();
});
`.trimStart();
