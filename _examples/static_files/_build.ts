#!/usr/bin/env -S deno run -A
import {
  CleanPlugin,
  CopyPlugin,
  DevServerPlugin,
  HtmlTemplatePlugin,
  Project,
} from "../../mod.ts";

const project = new Project({
  plugins: [
    new CleanPlugin(),
    new HtmlTemplatePlugin({ entryPoint: "./index.html" }),
    new CopyPlugin({
      entryPoint: "./fonts/*.{otf,css}",
      glob: true,
    }),
    new DevServerPlugin(),
  ],
  rootUrl: import.meta.resolve("./"),
  destUrl: "./dest/",
  importMapUrl: "./import_map.json",
  dev: Deno.args[0] === "dev",
});

await project.bootstrap();
