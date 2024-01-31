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
    new BuildPlugin({ entryPoint: "./server.ts", scope: "SERVER" }),
    new RunPlugin({ scope: "SERVER", args: ["-A"] }),
  ],
  rootUrl: import.meta.resolve("./"),
  targetUrl: "./target/",
  importMapUrl: "./import_map.json",
  dev: Deno.args[0] === "dev",
});

await project.bootstrap();
