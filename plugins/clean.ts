import { relativiseUrl } from "../_utils/relativise_url.ts";
import { Plugin, PluginApplyOptions } from "../plugin.ts";

export class CleanPlugin extends Plugin {
  constructor() {
    super("CLEAN");
  }

  apply(options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BOOTSTRAP", async () => {
      const relativeTargetUrl = relativiseUrl(
        this.project.targetUrl,
        this.project.rootUrl,
      );
      this.logger.info(`Deleting ${relativeTargetUrl}`);
      await Deno
        .remove(
          new URL(this.project.targetUrl),
          { recursive: true },
        )
        .catch(() => undefined);
    });
  }
}
