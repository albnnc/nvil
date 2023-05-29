import { server, path, fileServer, fs } from "../../../deps.ts";
import { handleStoryReloadRequest } from "../story_reload.ts";

const currentDir = path.fromFileUrl(import.meta.resolve("./"));
const metaGlob = path.join(currentDir, "./stories/*/meta.json");
const indexHtmlFilePath = path.join(currentDir, "./index.html");

server.serve(
  async (req) => {
    const { pathname } = new URL(req.url);
    if (pathname === "/stories") {
      const metas: unknown[] = [];
      for await (const v of fs.expandGlob(metaGlob)) {
        metas.push(await Deno.readTextFile(v.path).then(JSON.parse));
      }
      return new Response(JSON.stringify(metas));
    }
    return (
      handleStoryReloadRequest(req) ||
      fileServer
        .serveDir(req, {
          fsRoot: currentDir,
          quiet: true,
        })
        .then((v) =>
          v.status === 404 ? fileServer.serveFile(req, indexHtmlFilePath) : v
        )
    );
  },
  {
    onListen: ({ hostname, port }) => {
      console.log(`Listening ${hostname}:${port}`);
    },
  }
);
