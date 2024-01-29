import { get } from "../../../_utils/get.ts";
import { PluginApplyOptions } from "../../../mod.ts";
import { Plugin } from "../../../plugin.ts";
import { StoryMeta } from "../_utils/story_meta.ts";

export interface StoryMetaPluginOptions {
  entryPoint: string;
}

export class StoryMetaPlugin extends Plugin {
  entryPoint: string;

  private textDecoder = new TextDecoder();
  private boundaryString = "--" + Math.random().toString().slice(-8);

  constructor(options: StoryMetaPluginOptions) {
    super("STORY_META");
    this.entryPoint = options.entryPoint;
  }

  apply(this: StoryMetaPlugin, options: PluginApplyOptions) {
    super.apply(options);
    this.project.stager.on("BUILD_END", async (context) => {
      const targetUrl = get(context, "targetUrl");
      if (typeof targetUrl !== "string") {
        return;
      }
      const exportedMeta = await this.getExportedMeta(targetUrl);
      const meta = StoryMeta.fromEntryPoint(
        this.entryPoint,
        this.project.rootUrl,
      );
      Object.assign(meta, exportedMeta);
      const textEncoder = new TextEncoder();
      const data = textEncoder.encode(JSON.stringify(meta, null, 2));
      this.project.bundle.set("./meta.json", { data });
    });
  }

  private async getExportedMeta(
    targetUrl?: string,
  ): Promise<Record<string, string>> {
    if (!targetUrl) {
      return {};
    }
    const contentBytes = this.project.bundle.get(targetUrl)?.data;
    if (!contentBytes) {
      return {};
    }
    const contentString = this.textDecoder.decode(contentBytes);
    const contentToEval = `
      ${contentString}
      console.log("${this.boundaryString}");
      console.log(JSON.stringify(meta))
    `;
    const output = await new Deno.Command("deno", {
      args: ["eval", contentToEval],
      stdout: "piped",
      stderr: "piped",
    }).output();
    const stdout = this.textDecoder.decode(output.stdout);
    const metaJson = stdout.split(this.boundaryString + "\n")[1];
    try {
      const meta = JSON.parse(metaJson);
      return meta;
    } catch {
      return {};
    }
  }
}
