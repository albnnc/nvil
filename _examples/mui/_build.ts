#!/usr/bin/env -S deno run -A
import {
  BuildPlugin,
  CleanPlugin,
  DevServerPlugin,
  HtmlTemplatePlugin,
  LiveReloadPlugin,
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
  targetUrl: "./target/",
  importMapUrl: "./import_map.json",
  dev: Deno.args[0] === "dev",
});

await project.bootstrap();
