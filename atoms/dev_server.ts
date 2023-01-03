import { Atom } from "../atom.ts";
import { server, path, fileServer } from "../deps.ts";
import { handleLiveReloadRequest } from "./live_reload.ts";

export function devServer(): Atom {
  return ({ config: { dev, destDir }, getLogger, onStage }) => {
    const logger = getLogger("devServer");
    if (!dev) {
      return;
    }
    onStage("BOOTSTRAP", () => {
      const indexHtml = path.join(destDir, "index.html");
      server.serve(
        (req) => {
          return (
            handleLiveReloadRequest(req) ||
            fileServer
              .serveDir(req, { fsRoot: destDir, quiet: true })
              .then((v) =>
                v.status === 404 ? fileServer.serveFile(req, indexHtml) : v
              )
          );
        },
        {
          onListen: ({ hostname, port }) => {
            logger.info(`Listening ${hostname}:${port}`);
          },
        }
      );
    });
  };
}
