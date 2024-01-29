import { PluginApplyOptions } from "../../../mod.ts";
import { Plugin } from "../../../plugin.ts";
import { StoryMeta } from "../_utils/story_meta.ts";

export interface StoryMetaPluginOptions {
  entryPoint: string;
}

export class StoryMetaPlugin extends Plugin {
  entryPoint: string;

  constructor(options: StoryMetaPluginOptions) {
    super("STORY_META");
    this.entryPoint = options.entryPoint;
  }

  apply(this: StoryMetaPlugin, options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BOOTSTRAP", () => {
      const meta = StoryMeta.fromEntryPoint(
        this.entryPoint,
        this.project.rootUrl,
      );
      const encoder = new TextEncoder();
      this.project.bundle.set("./meta.json", {
        data: encoder.encode(JSON.stringify(meta, null, 2)),
      });
    });
  }
}
