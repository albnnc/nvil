import * as fileServer from "@std/http/file-server";
import * as path from "@std/path";
import { Plugin, type PluginApplyOptions } from "../plugin.ts";

export class DevServerPlugin extends Plugin {
  constructor() {
    super("DEV_SERVER");
  }

  apply(options: PluginApplyOptions) {
    super.apply(options);
    if (!this.project.dev) {
      return;
    }
    this.project.stager.on("BOOTSTRAP", () => {
      const indexHtmlUrl = new URL("./index.html", this.project.targetUrl)
        .toString();
      Deno.serve({
        signal: this.disposalSignal,
        onListen: ({ hostname, port }) => {
          this.logger.info(`Listening on ${hostname}:${port}`);
        },
      }, (request) => {
        return (
          fileServer
            .serveDir(request, {
              fsRoot: path.fromFileUrl(this.project.targetUrl),
              quiet: true,
            })
            .then((v) =>
              v.status === 404
                ? fileServer.serveFile(request, path.fromFileUrl(indexHtmlUrl))
                : v
            )
        );
      });
    });
  }
}
