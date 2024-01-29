import { fileServer, fs, path } from "../../../_deps.ts";
import { StoryLiveReloadPlugin } from "../_plugins/story_live_reload.ts";

const currentDir = path.fromFileUrl(import.meta.resolve("./"));
const metaGlob = path.join(currentDir, "./stories/*/meta.json");
const indexHtmlFilePath = path.join(currentDir, "./index.html");
const urlRoot = Deno.env.get("URL_ROOT") || undefined;

Deno.serve({
  handler: async (req) => {
    const url = new URL(req.url);
    const pathname = urlRoot
      ? url.pathname.replace(urlRoot, "").replace(/\/+/, "/")
      : url.pathname;
    if (pathname === "/stories") {
      const metas: unknown[] = [];
      for await (const v of fs.expandGlob(metaGlob)) {
        metas.push(await Deno.readTextFile(v.path).then(JSON.parse));
      }
      return new Response(JSON.stringify(metas));
    }
    return (
      StoryLiveReloadPlugin.handleStoryLiveReloadRequest(req) ||
      fileServer
        .serveDir(req, {
          fsRoot: currentDir,
          urlRoot,
          quiet: true,
        })
        .then((v) =>
          v.status === 404 ? fileServer.serveFile(req, indexHtmlFilePath) : v
        )
    );
  },
  onListen: ({ hostname, port }) => {
    console.log(`Listening ${hostname}:${port}`);
  },
});
