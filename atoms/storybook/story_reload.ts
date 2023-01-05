import { Atom } from "../../atom.ts";
import { getStoryMeta } from "./story_meta.ts";

const callbacks = new Map<string, (id: string) => void>();

export function handleStoryReloadRequest(request: Request) {
  const { pathname } = new URL(request.url);
  if (pathname !== "/story-reload-events") {
    return;
  }
  if (request.method === "GET") {
    const callbackId = crypto.randomUUID();
    const body = new ReadableStream({
      start(controller) {
        callbacks.set(callbackId, (id) => {
          controller.enqueue(`data: ${id}\n\n`);
        });
      },
      cancel() {
        callbacks.delete(callbackId);
      },
    });
    return new Response(body.pipeThrough(new TextEncoderStream()), {
      headers: { "Content-Type": "text/event-stream" },
    });
  }
  if (request.method === "POST") {
    request.text().then((v) => callbacks.forEach((fn) => fn(v)));
    return new Response(null, { status: 200 });
  }
}

export function storyReload(): Atom {
  return ({ config: { rootUrl, dev }, getLogger, onStage }) => {
    const logger = getLogger("storyReload");
    if (!dev) {
      return;
    }
    onStage("BUILD_END", async (entryPoint) => {
      // TODO: Check scope.
      logger.info("Reloading");
      const { id } = getStoryMeta(entryPoint as string, rootUrl);
      await fetch(new URL("http://localhost:8000/story-reload-events"), {
        method: "POST",
        body: id,
      })
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