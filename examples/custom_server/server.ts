// import { LiveReloadPlugin } from "../../plugins/live_reload.ts";
import { LiveReloadPlugin } from "@albnnc/nvil";
import { serveDir, serveFile } from "@std/http/file-server";
import * as log from "@std/log";
import * as path from "@std/path";

const currentDir = path.fromFileUrl(import.meta.resolve("./"));
const indexHtml = path.join(currentDir, "index.html");

Deno.serve({
  handler: (req) => {
    return (
      LiveReloadPlugin.handleLiveReloadRequest(req) ||
      serveDir(req, { fsRoot: currentDir }).then((v) =>
        v.status === 404 ? serveFile(req, indexHtml) : v
      )
    );
  },
  onListen: ({ hostname, port }) => {
    log.info(`Started server on ${hostname}:${port}`);
  },
});
