#!/usr/bin/env -S deno run -A
import {
  BuildPlugin,
  CleanPlugin,
  HtmlTemplatePlugin,
  LiveReloadPlugin,
  Project,
  RunPlugin,
} from "../../mod.ts";

await using project = new Project({
  plugins: [
    new CleanPlugin(),
    new BuildPlugin({ entryPoint: "./index.tsx" }),
    new HtmlTemplatePlugin({ entryPoint: "./index.html" }),
    new LiveReloadPlugin(),
    new BuildPlugin({ scope: "SERVER", entryPoint: "./server.ts" }),
    new RunPlugin({ scope: "SERVER", args: ["-A"] }),
  ],
  sourceUrl: import.meta.resolve("./"),
  targetUrl: "./.target/",
  dev: Deno.args.includes("--dev"),
  debug: Deno.args.includes("--debug"),
});

await project.bootstrap();
await project.done();
