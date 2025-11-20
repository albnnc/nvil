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
    new LiveReloadPlugin({ port: +(Deno.env.get("PORT") || "") + 1 }),
    new DevServerPlugin({ port: +(Deno.env.get("PORT") || "") }),
  ],
  sourceUrl: import.meta.resolve("./"),
  targetUrl: "./.target/",
  dev: Deno.args.includes("--dev"),
  debug: Deno.args.includes("--debug"),
});

await project.bootstrap();
await project.done();
