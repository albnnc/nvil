import { server, path, fileServer, fs } from "../../../deps.ts";
import { handleStoryReloadRequest } from "../story_reload.ts";

const currentDir = path.fromFileUrl(import.meta.resolve("./"));
const metaGlob = path.join(currentDir, "./stories/*/meta.json");
const indexHtmlPath = path.join(currentDir, "./index.html");
const baseHref = Deno.env.get("BASE_HREF") || "/";
const indexHtml = await Deno.readTextFile(indexHtmlPath).then((v) =>
  v.replace(`<base href="/" />`, `<base href="${baseHref}" />`)
);

server.serve(
  async (req) => {
    const { pathname } = new URL(req.url);
    const filePath = path.join(currentDir, pathname);
    if (pathname === "/stories") {
      const metas: unknown[] = [];
      for await (const v of fs.expandGlob(metaGlob)) {
        metas.push(await Deno.readTextFile(v.path).then(JSON.parse));
      }
      return new Response(JSON.stringify(metas));
    }
    if (
      pathname === "index.html" ||
      (await Deno.lstat(filePath)
        .then(() => false)
        .catch(() => true))
    ) {
      return new Response(indexHtml, {
        headers: { "content-type": "text/html; charset=UTF-8" },
      });
    }
    return (
      handleStoryReloadRequest(req) ||
      fileServer.serveDir(req, {
        fsRoot: currentDir,
        quiet: true,
      })
    );
  },
  {
    onListen: ({ hostname, port }) => {
      console.log(`Listening ${hostname}:${port}`);
    },
  }
);
