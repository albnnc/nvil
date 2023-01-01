import { Atom } from "../atom.ts";
import { server, path, fileServer } from "../deps.ts";
import { createLogger } from "../logger.ts";
import { handleLiveReloadRequest } from "./live_reload.ts";

export function devServer(): Atom {
  const log = createLogger("DEV_SERVER");
  return ({ config: { dev, destDir }, on }) => {
    if (!dev) {
      return;
    }
    on("BOOTSTRAP", () => {
      const indexHtml = path.join(destDir, "index.html");
      server.serve(
        (req) => {
          return (
            handleLiveReloadRequest(req) ||
            fileServer
              .serveDir(req, { fsRoot: destDir })
              .then((v) =>
                v.status === 404 ? fileServer.serveFile(req, indexHtml) : v
              )
          );
        },
        {
          onListen: ({ hostname, port }) => {
            log.info(`Listening ${hostname}:${port}`);
          },
        }
      );
    });
  };
}
