import { serveDir, serveFile } from "std/http/file_server.ts";
import * as log from "std/log/mod.ts";
import * as path from "std/path/mod.ts";
import { LiveReloadPlugin } from "../../mod.ts";

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
