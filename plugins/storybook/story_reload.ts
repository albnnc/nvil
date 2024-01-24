import { Plugin } from "../../plugin.ts";
import { async } from "../../_deps.ts";

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

export function storyReload(): Plugin {
  return ({ config: { destUrl, dev }, bundle, getLogger, onStage }) => {
    const logger = getLogger("storyReload");
    if (!dev) {
      return;
    }
    const handleChange = async.debounce(async (change: string) => {
      const entry = bundle.get(change);
      if (!entry || entry.scope !== undefined) {
        return;
      }
      const storyBaseUrl = new URL("./", new URL(change, destUrl));
      const metaUrl = new URL("./meta.json", storyBaseUrl);
      const { id } = await fetch(metaUrl).then((v) => v.json());
      logger.info(`Reloading story ${id}`);
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
    }, 200);
    onStage("WRITE_END", (changes) => {
      for (const change of changes as string[]) {
        handleChange(change);
      }
    });
  };
}
