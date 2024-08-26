import * as fileServer from "@std/http/file-server";
import * as path from "@std/path";
import { Plugin, type PluginApplyOptions } from "../plugin.ts";

export class DevServerPlugin extends Plugin {
  private httpServer?: Deno.HttpServer;

  constructor() {
    super("DEV_SERVER");
  }

  apply(this: DevServerPlugin, options: PluginApplyOptions) {
    super.apply(options);
    if (!this.project.dev) {
      return;
    }
    this.project.stager.on("BOOTSTRAP", () => {
      const indexHtmlUrl = new URL(
        "./index.html",
        this.project.targetUrl,
      ).toString();
      this.httpServer = Deno.serve({
        handler: (req) => {
          return (
            fileServer
              .serveDir(req, {
                fsRoot: path.fromFileUrl(this.project.targetUrl),
                quiet: true,
              })
              .then((v) =>
                v.status === 404
                  ? fileServer.serveFile(req, path.fromFileUrl(indexHtmlUrl))
                  : v
              )
          );
        },
        onListen: ({ hostname, port }) => {
          this.logger.info(`Listening on ${hostname}:${port}`);
        },
      });
    });
  }

  async [Symbol.asyncDispose]() {
    await this.httpServer?.[Symbol.asyncDispose]();
  }
}
