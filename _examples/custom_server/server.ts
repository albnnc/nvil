import { serveDir, serveFile } from "std/http/file_server.ts";
import { serve } from "std/http/server.ts";
import * as log from "std/log/mod.ts";
import * as path from "std/path/mod.ts";
import { handleLiveReloadRequest } from "../../plugins/live_reload.ts";

const currentDir = path.fromFileUrl(import.meta.resolve("./"));
const indexHtml = path.join(currentDir, "index.html");

serve(
  (req) => {
    return (
      handleLiveReloadRequest(req) ||
      serveDir(req, { fsRoot: currentDir }).then((v) =>
        v.status === 404 ? serveFile(req, indexHtml) : v
      )
    );
  },
  {
    onListen: ({ hostname, port }) => {
      log.info(`Started server on ${hostname}:${port}`);
    },
  },
);
