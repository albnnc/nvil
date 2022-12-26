#!/usr/bin/env -S deno run -A
import { koat } from "../../koat.ts";
import { path } from "../../deps.ts";
import { createEsbuildPlugin } from "../../plugins/esbuild.ts";
import { createHtmlTemplatePlugin } from "../../plugins/html_template.ts";
import { createLiveReloadPlugin } from "../../plugins/live_reload.ts";

await koat({
  dev: Deno.args[0] === "dev",
  rootDir: import.meta.resolve("./"),
  outputDir: "./output",
  entryPoints: ["./index.tsx"],
  plugins: [
    createEsbuildPlugin({
      importMapURL: import.meta.resolve("./import_map.json"),
    }),
    createLiveReloadPlugin(),
    createHtmlTemplatePlugin({
      template: await Deno.readTextFile(
        path.fromFileUrl(import.meta.resolve("./index.html"))
      ),
    }),
  ],
});
