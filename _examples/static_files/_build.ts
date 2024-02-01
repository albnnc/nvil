#!/usr/bin/env -S deno run -A
import {
  CleanPlugin,
  CopyPlugin,
  DevServerPlugin,
  HtmlTemplatePlugin,
  Project,
} from "../../mod.ts";

await using project = new Project({
  plugins: [
    new CleanPlugin(),
    new HtmlTemplatePlugin({ entryPoint: "./index.html" }),
    new CopyPlugin({
      entryPoint: "./assets/*.otf",
      bundleUrl: "./fonts/",
      glob: true,
    }),
    new CopyPlugin({
      entryPoint: "./assets/*.css",
      bundleUrl: "./styles/",
      glob: true,
    }),
    new DevServerPlugin(),
  ],
  rootUrl: import.meta.resolve("./"),
  targetUrl: "./target/",
  importMapUrl: "./import_map.json",
  dev: Deno.args[0] === "dev",
});

await project.bootstrap();
await project.done();
