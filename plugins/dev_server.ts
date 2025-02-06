import * as fileServer from "@std/http/file-server";
import { getAvailablePort } from "@std/net";
import * as path from "@std/path";
import { Plugin, type PluginApplyOptions } from "../plugin.ts";

export interface DevServerPluginOptions {
  port?: number;
}

export class DevServerPlugin extends Plugin {
  #port?: number;

  constructor(options: DevServerPluginOptions = {}) {
    super("DEV_SERVER");
    this.#port = options.port ?? getAvailablePort({ preferredPort: 8000 });
  }

  override apply(options: PluginApplyOptions) {
    super.apply(options);
    if (!this.project.dev) {
      return;
    }
    this.project.stager.on("BOOTSTRAP", () => {
      const indexHtmlUrl = new URL("./index.html", this.project.targetUrl)
        .toString();
      Deno.serve({
        port: this.#port,
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
