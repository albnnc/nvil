import { path } from "../../../_deps.ts";
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
      const bundleUrl = get(context, "bundleUrl");
      if (typeof bundleUrl !== "string") {
        return;
      }
      const exportedMeta = await this.getExportedMeta(bundleUrl);
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
    bundleUrl?: string,
  ): Promise<Record<string, string>> {
    if (!bundleUrl) {
      return {};
    }
    const { data: contentBytes } = this.project.bundle.get(bundleUrl) ?? {};
    if (!contentBytes) {
      return {};
    }
    const contentString = this.textDecoder.decode(contentBytes);
    const stdout = await (async () => {
      const tempFile = await Deno.makeTempFile({ suffix: ".js" });
      try {
        await Deno.writeTextFile(tempFile, contentString);
        const output = await new Deno.Command("deno", {
          args: [
            "eval",
            `
              import { meta } from "${path.toFileUrl(tempFile).toString()}"
              console.log("${this.boundaryString}");
              console.log(JSON.stringify(meta))
              console.log("${this.boundaryString}");
            `,
          ],
          stdout: "piped",
          stderr: "piped",
        }).output();
        return this.textDecoder.decode(output.stdout);
      } finally {
        await Deno.remove(tempFile);
      }
    })();
    try {
      const metaJson = stdout.split(this.boundaryString + "\n")[1];
      const meta = JSON.parse(metaJson);
      return meta;
    } catch {
      return {};
    }
  }
}
