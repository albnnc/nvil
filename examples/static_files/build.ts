#!/usr/bin/env -S deno run -A
import {
  CleanPlugin,
  CopyPlugin,
  DevServerPlugin,
  HtmlTemplatePlugin,
  Project,
} from "@albnnc/nvil";

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
  sourceUrl: import.meta.resolve("./"),
  targetUrl: "./.target/",
  dev: Deno.args.includes("--dev"),
  debug: Deno.args.includes("--debug"),
});

await project.bootstrap();
await project.done();
