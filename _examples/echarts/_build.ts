#!/usr/bin/env -S deno run -A
import {
  BuildPlugin,
  CleanPlugin,
  DevServerPlugin,
  HtmlTemplatePlugin,
  LiveReloadPlugin,
  Project,
} from "../../mod.ts";

await using project = new Project({
  plugins: [
    new CleanPlugin(),
    new BuildPlugin({
      entryPoint: "./index.tsx",
      metaBundleUrl: "./index.meta.json",
    }),
    new HtmlTemplatePlugin({ entryPoint: "./index.html" }),
    new LiveReloadPlugin(),
    new DevServerPlugin(),
  ],
  rootUrl: import.meta.resolve("./"),
  targetUrl: "./target/",
  importMapUrl: "./import_map.json",
  dev: Deno.args[0] === "dev",
});

await project.bootstrap();
await project.done();
