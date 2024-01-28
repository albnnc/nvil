import { Plugin, PluginApplyOptions } from "../plugin.ts";
import { relativiseUrl } from "../_utils/relativise_url.ts";

export class CleanPlugin extends Plugin {
  constructor() {
    super("CLEAN");
  }

  apply(options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BOOTSTRAP", async () => {
      const relativeDestUrl = relativiseUrl(
        this.project.destUrl,
        this.project.rootUrl
      );
      this.logger.info(`Deleting ${relativeDestUrl}`);
      await Deno.remove(new URL(this.project.destUrl), {
        recursive: true,
      }).catch(() => undefined);
    });
  }
}
