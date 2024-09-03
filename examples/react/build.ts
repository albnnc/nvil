#!/usr/bin/env -S deno run -A
import {
  BuildPlugin,
  CleanPlugin,
  DevServerPlugin,
  HtmlTemplatePlugin,
  LiveReloadPlugin,
  Project,
} from "@albnnc/nvil";

await using project = new Project({
  plugins: [
    new CleanPlugin(),
    new BuildPlugin({ entryPoint: "./index.tsx" }),
    new HtmlTemplatePlugin({ entryPoint: "./index.html" }),
    new LiveReloadPlugin(),
    new DevServerPlugin(),
  ],
  sourceUrl: import.meta.resolve("./"),
  targetUrl: "./.target/",
  dev: Deno.args.includes("--dev"),
  debug: Deno.args.includes("--debug"),
});

await project.bootstrap();
await project.done();
