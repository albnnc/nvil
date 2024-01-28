#!/usr/bin/env -S deno run -A
import {
  HtmlTemplatePlugin,
  LiveReloadPlugin,
  BuildPlugin,
  CleanPlugin,
  DevServerPlugin,
  Project,
} from "../../mod.ts";

const project = new Project({
  plugins: [
    new CleanPlugin(),
    new BuildPlugin({ entryPoint: "./index.tsx" }),
    new HtmlTemplatePlugin({ entryPoint: "./index.html" }),
    new LiveReloadPlugin(),
    new DevServerPlugin(),
  ],
  rootUrl: import.meta.resolve("./"),
  destUrl: "./dest/",
  importMapUrl: "./import_map.json",
  dev: Deno.args[0] === "dev",
});

await project.bootstrap();
