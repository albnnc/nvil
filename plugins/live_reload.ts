import { Plugin } from "../plugin.ts";

export function createLiveReloadPlugin(): Plugin {
  const callbacks = new Map<string, () => void>();
  return {
    onStart: ({ bundle }) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(liveReloadScript);
      bundle.set("./live-reload.js", { data });
    },
    onBuildEnd: () => {
      callbacks.forEach((fn) => fn());
    },
    onRequest: ({ request }) => {
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
    },
  };
}

const liveReloadScript = `
const eventSource = new EventSource("/live-reload-events");
eventSource.addEventListener("message", () => {
  location.reload();
});
`.trimStart();
