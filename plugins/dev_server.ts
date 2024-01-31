import { fileServer, path } from "../_deps.ts";
import { Plugin, PluginApplyOptions } from "../plugin.ts";
import { LiveReloadPlugin } from "./live_reload.ts";

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
        this.project.destUrl,
      ).toString();
      this.httpServer = Deno.serve({
        handler: (req) => {
          return (
            LiveReloadPlugin.handleLiveReloadRequest(req) ||
            fileServer
              .serveDir(req, {
                fsRoot: path.fromFileUrl(this.project.destUrl),
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
          this.logger.info(`Listening ${hostname}:${port}`);
        },
      });
    });
  }

  async [Symbol.asyncDispose]() {
    await this.httpServer?.[Symbol.asyncDispose]();
  }
}
