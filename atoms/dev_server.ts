import { Atom } from "../atom.ts";
import { server, path, fileServer } from "../deps.ts";
import { handleLiveReloadRequest } from "./live_reload.ts";

export function devServer(): Atom {
  return ({ config: { dev, destUrl }, getLogger, onStage }) => {
    const logger = getLogger("devServer");
    if (!dev) {
      return;
    }
    onStage("BOOTSTRAP", () => {
      const indexHtmlUrl = new URL("./index.html", destUrl).toString();
      server.serve(
        (req) => {
          return (
            handleLiveReloadRequest(req) ||
            fileServer
              .serveDir(req, {
                fsRoot: path.fromFileUrl(destUrl),
                quiet: true,
              })
              .then((v) =>
                v.status === 404
                  ? fileServer.serveFile(req, path.fromFileUrl(indexHtmlUrl))
                  : v
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
